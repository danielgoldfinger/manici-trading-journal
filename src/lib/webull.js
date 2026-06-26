import { supabase } from './supabase'

async function callWebull(endpoint, { method = 'GET', query = {}, body = null } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webull-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ endpoint, method, query, body }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.msg || `Webull API error: ${res.status}`)
  return data
}

// All accounts under this app's credentials
export async function getAccountList() {
  return callWebull('/openapi/account/list')
}

// Balance / buying power for a specific account
export async function getAccountBalance(accountId) {
  return callWebull('/openapi/assets/balance', { query: { account_id: accountId } })
}

// Open positions for a specific account
export async function getAccountPositions(accountId) {
  return callWebull('/openapi/assets/positions', { query: { account_id: accountId } })
}

// Order history for a specific account (last 30 days by default)
export async function getOrderHistory(accountId, { startDate, endDate, pageSize = 50 } = {}) {
  const query = { account_id: accountId, page_size: pageSize }
  if (startDate) query.start_date = startDate
  if (endDate) query.end_date = endDate
  return callWebull('/openapi/trade/order/history', { query })
}

// Single order detail by client_order_id
export async function getOrderDetail(accountId, clientOrderId) {
  return callWebull('/openapi/trade/order/detail', {
    query: { account_id: accountId, client_order_id: clientOrderId },
  })
}
