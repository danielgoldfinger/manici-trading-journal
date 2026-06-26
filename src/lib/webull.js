import { supabase } from './supabase'

async function callWebull(endpoint, method = 'GET', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webull-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ endpoint, method, body }),
  })
  if (!res.ok) throw new Error(`Webull API error: ${res.status}`)
  return res.json()
}

// Account summary
export async function getAccountSummary() {
  return callWebull('/v1/account/summary')
}

// Open positions
export async function getPositions() {
  return callWebull('/v1/account/positions')
}

// Recent orders (last 30 days)
export async function getRecentOrders(startDate, endDate) {
  const params = new URLSearchParams({ startDate, endDate })
  return callWebull(`/v1/trading/orders/list?${params}`)
}

// Single order detail
export async function getOrder(orderId) {
  return callWebull(`/v1/trading/orders/${orderId}`)
}

// Account P&L
export async function getPnL(startDate, endDate) {
  const params = new URLSearchParams({ startDate, endDate })
  return callWebull(`/v1/account/pnl?${params}`)
}
