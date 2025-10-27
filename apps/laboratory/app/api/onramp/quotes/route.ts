import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const feeBreakdownSchema = z.object({
  name: z.string(),
  value: z.number()
})

const quoteResponseSchema = z.object({
  fiatCurrency: z.string(),
  cryptoCurrency: z.string(),
  paymentMethod: z.string(),
  fiatAmount: z.number(),
  cryptoAmount: z.number(),
  network: z.string(),
  totalFee: z.number(),
  feeBreakdown: z.array(feeBreakdownSchema)
})

const isBuyOrSell = 'BUY' as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const fiatCurrency = searchParams.get('fiatCurrency')
    const cryptoCurrency = searchParams.get('cryptoCurrency')
    const network = searchParams.get('network')
    const paymentMethod = searchParams.get('paymentMethod')
    const fiatAmount = searchParams.get('fiatAmount')

    if (!fiatCurrency || !cryptoCurrency || !network || !paymentMethod || !fiatAmount) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['fiatCurrency', 'cryptoCurrency', 'network', 'paymentMethod', 'fiatAmount']
        },
        { status: 400 }
      )
    }

    const queryParams = new URLSearchParams({
      partnerApiKey: ConstantsUtil.TRANSAK_API_KEY as string,
      fiatCurrency,
      cryptoCurrency,
      isBuyOrSell,
      network,
      paymentMethod,
      fiatAmount
    })

    const response = await fetch(
      `${ConstantsUtil.TRANSAK_BASE_API_URL}/api/v1/pricing/public/quotes?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch quote', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json().then(({ response }) => quoteResponseSchema.parse(response))

    return NextResponse.json(data, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
