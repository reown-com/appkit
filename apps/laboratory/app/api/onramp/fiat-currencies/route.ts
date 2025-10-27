import { NextResponse } from 'next/server'
import z from 'zod'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const paymentOptionSchema = z.object({
  name: z.string(),
  id: z.string(),
  icon: z.string(),
  minAmountForPayOut: z.number().optional(),
  maxAmountForPayOut: z.number().optional()
})

const cryptoCurrencySchema = z.object({
  symbol: z.string(),
  supportingCountries: z.array(z.string()),
  logoSymbol: z.string(),
  name: z.string(),
  paymentOptions: z.array(paymentOptionSchema),
  icon: z.string()
})

const cryptoCurrenciesSchema = z.array(cryptoCurrencySchema)

export async function GET() {
  try {
    const response = await fetch(
      `${ConstantsUtil.TRANSAK_BASE_API_URL}/fiat/public/v1/currencies/fiat-currencies`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch crypto currencies', status: response.status },
        { status: response.status }
      )
    }

    const data = await response
      .json()
      .then(({ response }) => cryptoCurrenciesSchema.parse(response))

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
