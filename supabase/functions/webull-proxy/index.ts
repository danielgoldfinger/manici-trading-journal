import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBULL_APP_KEY    = Deno.env.get('WEBULL_APP_KEY')!
const WEBULL_APP_SECRET = Deno.env.get('WEBULL_APP_SECRET')!
// Host only, no protocol — e.g. "us-openapi-alb.uat.webullbroker.com"
const WEBULL_HOST = (Deno.env.get('WEBULL_BASE_URL') || '').replace(/^https?:\/\//, '').replace(/\/$/, '')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hosts that still use the legacy HMAC-SHA1 + MD5 signing scheme.
// Any host not in this set uses the newer HMAC-SHA256 + SHA-256 scheme.
const LEGACY_SHA1_HOSTS = new Set([
  'api.webull.com', 'events-api.webull.com',
  'api.webull.hk', 'events-api.webull.hk',
  'pre-openapi-us-alb.webullbroker.com', 'pre-openapi-us-events.webullbroker.com',
  'pre-openapi-alb.webullbroker.com', 'pre-openapi-events.webullbroker.com',
  'us-openapi-alb.uat.webullbroker.com', 'us-openapi-events.uat.webullbroker.com',
  'hk-openapi.uat.webullbroker.com', 'hk-openapi-events-api.uat.webullbroker.com',
  'api.sandbox.webull.hk', 'events-api.sandbox.webull.hk',
])

async function hmac(algo: 'SHA-1' | 'SHA-256', secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: algo },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function digestHex(algo: 'MD5' | 'SHA-256', message: string): Promise<string> {
  if (algo === 'MD5') {
    // Web Crypto doesn't support MD5 — use a minimal pure-JS MD5 fallback.
    return md5Hex(message)
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Minimal MD5 implementation (RFC 1321) for the legacy signing path.
function md5Hex(input: string): string {
  function rotl(x: number, c: number) { return (x << c) | (x >>> (32 - c)) }
  function toHexLE(n: number) {
    let s = ''
    for (let i = 0; i < 4; i++) s += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0')
    return s
  }
  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21]
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)
  const bytes = new TextEncoder().encode(input)
  const msgLen = bytes.length
  const withOne = new Uint8Array(((msgLen + 8) >> 6) * 64 + 64)
  withOne.set(bytes)
  withOne[msgLen] = 0x80
  const bitLen = msgLen * 8
  new DataView(withOne.buffer).setUint32(withOne.length - 8, bitLen >>> 0, true)
  new DataView(withOne.buffer).setUint32(withOne.length - 4, Math.floor(bitLen / 2 ** 32), true)

  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]
  for (let chunk = 0; chunk < withOne.length; chunk += 64) {
    const M = new Array(16)
    for (let i = 0; i < 16; i++) {
      M[i] = withOne[chunk + i * 4] | (withOne[chunk + i * 4 + 1] << 8) |
        (withOne[chunk + i * 4 + 2] << 16) | (withOne[chunk + i * 4 + 3] << 24)
    }
    let [a, b, c, d] = [a0, b0, c0, d0]
    for (let i = 0; i < 64; i++) {
      let f, g
      if (i < 16) { f = (b & c) | (~b & d); g = i }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16 }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16 }
      else { f = c ^ (b | ~d); g = (7 * i) % 16 }
      f = (f + a + K[i] + M[g]) >>> 0
      a = d; d = c; c = b
      b = (b + rotl(f, s[i])) >>> 0
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0
  }
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0)
}

function getUuid(): string {
  return crypto.randomUUID()
}

function getIso8601(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

async function buildSignedHeaders(
  method: string,
  path: string,
  query: Record<string, string>,
  bodyParams: unknown
): Promise<Record<string, string>> {
  const useSha1 = LEGACY_SHA1_HOSTS.has(WEBULL_HOST)
  const hmacAlgo = useSha1 ? 'SHA-1' : 'SHA-256'
  const signerName = useSha1 ? 'HMAC-SHA1' : 'HMAC-SHA256'

  const signHeaders: Record<string, string> = {
    'x-app-key': WEBULL_APP_KEY,
    'x-timestamp': getIso8601(),
    'x-signature-version': '1.0',
    'x-signature-algorithm': signerName,
    'x-signature-nonce': getUuid(),
  }

  // Merge sign headers + query params (lowercased keys) for the canonical string.
  const signParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(signHeaders)) signParams[k.toLowerCase()] = v
  signParams['host'] = WEBULL_HOST
  for (const [k, v] of Object.entries(query)) {
    const lk = k.toLowerCase()
    signParams[lk] = signParams[lk] !== undefined ? `${signParams[lk]}&${v}` : String(v)
  }

  let bodyString: string | null = null
  if (bodyParams !== undefined && bodyParams !== null) {
    const raw = JSON.stringify(bodyParams)
    bodyString = (await digestHex(useSha1 ? 'MD5' : 'SHA-256', raw)).toUpperCase()
  }

  const sortedEntries = Object.entries(signParams).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  let stringToSign = path
  const joined = sortedEntries.map(([k, v]) => `${k}=${v}`).join('&')
  stringToSign = stringToSign ? `${stringToSign}&${joined}` : joined
  if (bodyString) stringToSign = `${stringToSign}&${bodyString}`

  const encoded = encodeURIComponent(stringToSign).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
  const signature = await hmac(hmacAlgo, `${WEBULL_APP_SECRET}&`, encoded)

  return { ...signHeaders, 'x-signature': signature, 'x-version': 'v2' }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify user is authenticated via Supabase JWT
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  try {
    // { endpoint: "/openapi/account/list", method: "GET", query: { account_id: "..." }, body: null }
    const { endpoint, method = 'GET', query = {}, body } = await req.json()

    const queryString = new URLSearchParams(query).toString()
    const url = `https://${WEBULL_HOST}${endpoint}${queryString ? `?${queryString}` : ''}`

    const signedHeaders = await buildSignedHeaders(method, endpoint, query, body ?? null)

    const webullRes = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...signedHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await webullRes.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: webullRes.status,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 502,
    })
  }
})
