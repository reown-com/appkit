import { NextResponse } from 'next/server'
import z from 'zod'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const cryptoCurrencySchema = z.object({
  coinId: z.string(),
  address: z.string().or(z.null()),
  decimals: z.number().optional(), // ETH has 0 decimals
  image: z.object({
    small: z.string()
  }),
  name: z.string().optional(),
  symbol: z.string(),
  kycCountriesNotSupported: z.array(z.string()),
  network: z.object({
    chainId: z.string().or(z.null())
  })
})

const cryptoCurrenciesSchema = z.array(cryptoCurrencySchema)

export async function GET() {
  try {
    const response = await fetch(
      `${ConstantsUtil.TRANSAK_BASE_API_URL}/cryptocoverage/api/v1/public/crypto-currencies`,
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
