import crypto from 'crypto'

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1'
const API_KEY = process.env.NOWPAYMENTS_API_KEY!

export interface CreatePaymentParams {
  price_amount: number
  price_currency: string
  pay_currency: string
  order_id: string
  order_description: string
  success_url: string
  cancel_url: string
  ipn_callback_url: string
}

export interface NOWPaymentsInvoice {
  id: string
  invoice_url: string
  payment_status: string
  price_amount: number
  price_currency: string
  pay_currency: string
  order_id: string
}

export async function createPaymentInvoice(
  params: CreatePaymentParams
): Promise<NOWPaymentsInvoice> {
  const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`NOWPayments error: ${err}`)
  }

  return res.json()
}

export async function getPaymentStatus(paymentId: string) {
  const res = await fetch(`${NOWPAYMENTS_API}/payment/${paymentId}`, {
    headers: { 'x-api-key': API_KEY },
  })
  if (!res.ok) throw new Error('Failed to get payment status')
  return res.json()
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((result: Record<string, unknown>, key) => {
        result[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
        return result
      }, {})
  }
  return obj
}

export function verifyIpnSignature(body: string, signature: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET!
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return false
  }
  const sortedJson = JSON.stringify(sortObjectKeys(parsed))
  const hmac = crypto.createHmac('sha512', secret)
  hmac.update(sortedJson)
  const computed = hmac.digest('hex')
  return computed === signature
}

export const PAID_STATUSES = ['finished', 'confirmed', 'sending', 'partially_paid']
