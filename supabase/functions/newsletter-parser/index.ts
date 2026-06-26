import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Auth check
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') || ''
  )
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  const { directBidText, fullPlanText } = await req.json()

  const prompt = `You are parsing a futures trading newsletter written by Adam Mancini.
Extract all actionable trade levels from the text below.

For each level found, return a JSON object with these fields:
- price: number (the ES price level)
- type: "FB" | "direct_bid" | "conditional" | "watch"
  - FB = specifically mentioned as a Failed Breakdown setup (flush and recover)
  - direct_bid = can buy directly without waiting for a flush
  - conditional = only actionable if a higher/lower level breaks first
  - watch = mentioned but no clear action prescribed
- condition: string (what needs to happen at this level to enter — e.g. "flush and recover", "bid directly", "hold and recover above")
- conditional_on: number | null (if this level only activates after another level breaks, put that price here)
- bonus_level: number | null (a bonus target if price overshoots — e.g. "bonus if we tag 7570")
- notes: string (brief verbatim context from the text, max 100 chars)
- priority: 1 | 2 | 3 (1 = explicitly Mancini's top pick, 2 = secondary, 3 = watch only)

Return ONLY a valid JSON array. No explanation, no markdown, no preamble.

Text to parse:
${directBidText}

Additional context (full plan section — use only to resolve ambiguities):
${fullPlanText?.slice(0, 2000) || ''}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  if (!data.content?.[0]?.text) {
    return new Response(JSON.stringify({ levels: [], warning: `AI call failed: ${JSON.stringify(data).slice(0, 300)}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  const raw = data.content[0].text.trim()
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

  let levels = []
  try {
    levels = JSON.parse(cleaned)
  } catch {
    return new Response(JSON.stringify({ levels: [], warning: `AI parse failed — manual entry required. Raw: ${raw.slice(0, 200)}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ levels }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
