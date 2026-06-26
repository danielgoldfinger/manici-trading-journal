import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const WEBULL_APP_KEY    = Deno.env.get('WEBULL_APP_KEY')!
const WEBULL_APP_SECRET = Deno.env.get('WEBULL_APP_SECRET')!
const WEBULL_BASE_URL   = Deno.env.get('WEBULL_BASE_URL') || 'https://openapi.webull.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function signRequest(method: string, path: string, timestamp: string, body = '') {
  const message = `${timestamp}\n${method}\n${path}\n${body}`
  return createHmac('sha256', WEBULL_APP_SECRET)
    .update(message)
    .digest('hex')
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

  // Parse the forwarded request
  const { endpoint, method = 'GET', body } = await req.json()
  const timestamp = Date.now().toString()
  const signature = signRequest(method, endpoint, timestamp, body ? JSON.stringify(body) : '')

  const webullRes = await fetch(`${WEBULL_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'App-Key': WEBULL_APP_KEY,
      'Timestamp': timestamp,
      'Sign': signature,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await webullRes.json()
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: webullRes.status,
  })
})
