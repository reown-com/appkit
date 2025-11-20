/* eslint-disable multiline-comment-style */
/* eslint-disable init-declarations */
/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server'

import type { CaipNetworkId } from '@reown/appkit-common'
import type { PaymentAsset } from '@reown/appkit-pay'

/**
 * Relay.link Quote API Proxy
 *
 * Simplified endpoint that proxies requests to Relay.link's quote API
 * with sensible defaults for unused parameters and transforms the response
 * into a simplified structure.
 */

interface QuoteRequest {
  user: string
  originChainId: string
  originCurrency: string
  destinationChainId: string
  destinationCurrency: string
  recipient: string
  amount: string
  // Optional parameters with sensible defaults
  tradeType?: 'EXACT_INPUT' | 'EXPECTED_OUTPUT'
  usePermit?: boolean
  useExternalLiquidity?: boolean
  referrer?: string
  useDepositAddress?: boolean
  refundTo?: string
  topupGas?: boolean
  protocolVersion?: string
  explicitDeposit?: boolean
}

interface RelayQuoteRequest {
  type: 'cross-chain' | 'same-chain'
  user: string
  originChainId: string
  originCurrency: string
  destinationChainId: string
  destinationCurrency: string
  recipient: string
  tradeType: string
  amount: string
  referrer: string
  useExternalLiquidity: boolean
  useDepositAddress: boolean
  // Optional parameters
  usePermit?: boolean
  refundTo?: string
  topupGas?: boolean
  protocolVersion?: string
  explicitDeposit?: boolean
  appFees?: Array<{
    recipient: string
    fee: string
  }>
}

interface RelayCurrency {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  metadata: {
    logoURI: string
    verified: boolean
  }
}

interface RelayCurrencyAmount {
  currency: RelayCurrency
  amount: string
  amountFormatted: string
  amountUsd: string
  minimumAmount: string
}

interface RelayFee {
  currency: RelayCurrency
  amount: string
  amountFormatted: string
  amountUsd: string
  minimumAmount: string
}

interface RelayQuoteResponse {
  steps: Array<{
    id: string
    action: string
    description: string
    kind: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[]
    requestId: string
    depositAddress?: string
  }>
  fees: {
    gas: RelayFee
    relayer: RelayFee
    relayerGas: RelayFee
    relayerService: RelayFee
    app: RelayFee
    subsidized?: RelayFee
  }
  details: {
    operation: string
    sender: string
    recipient: string
    currencyIn: RelayCurrencyAmount
    currencyOut: RelayCurrencyAmount
    refundCurrency: RelayCurrencyAmount
    totalImpact: {
      usd: string
      percent: string
    }
    timeEstimate: number
    route: {
      origin: {
        inputCurrency: RelayCurrencyAmount
        outputCurrency: RelayCurrencyAmount
      }
      destination: {
        inputCurrency: RelayCurrencyAmount
        outputCurrency: RelayCurrencyAmount
      }
    }
  }
}

/**
 * Normalized chain ID that supports special formats
 */
type NormalizedChainId = string

/**
 * Simplified currency amount with essential information
 */
interface SimplifiedCurrencyAmount {
  amount: string
  amountFormatted: string
  chainId: NormalizedChainId
  symbol?: string
  decimals?: number
}

/**
 * Simplified fee information
 */
interface SimplifiedFee {
  id: string
  label: string
  amount: string
  amountFormatted: string
  chainId: NormalizedChainId
  amountUsd: string
  currency: PaymentAsset
}

/**
 * Simplified quote response
 */
interface SimplifiedQuoteResponse {
  origin: SimplifiedCurrencyAmount
  destination: SimplifiedCurrencyAmount
  fees: SimplifiedFee[]
  requestId?: string
  depositAddress?: string
  timeEstimate?: number
}

/**
 * Special chain ID mappings for Bitcoin and Solana
 * Maps numeric IDs to normalized string IDs
 */
const CHAIN_ID_MAP: Record<number, string> = {
  8253038: '000000000019d6689c085ae165831e93',
  792703809: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
}

/**
 * Reverse mapping: normalized string IDs to numeric IDs
 */
const REVERSE_CHAIN_ID_MAP: Record<string, string> = {
  '000000000019d6689c085ae165831e93': '8253038',
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': '792703809'
}

const OVERRIDEN_ASSETS: Record<string, string> = {
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '0x0000000000000000000000000000000000000000',
  So11111111111111111111111111111111111111111: '11111111111111111111111111111111'
}

/**
 * Normalize chain ID to handle special formats (numeric -> string)
 */
function normalizeChainId(chainId: number): NormalizedChainId {
  return CHAIN_ID_MAP[chainId] || String(chainId)
}

/**
 * Convert normalized or numeric chain ID string to numeric for Relay.link API
 */
function toStringChainId(chainId: string): string {
  // Check if it's a normalized special chain ID
  if (REVERSE_CHAIN_ID_MAP[chainId]) {
    return REVERSE_CHAIN_ID_MAP[chainId]
  }

  return chainId
}

/**
 * Get chain namespace from chain ID
 */
function getChainNamespace(chainId: number): string {
  // Bitcoin
  if (chainId === 8253038) {
    return 'bip122'
  }
  // Solana
  if (chainId === 792703809) {
    return 'solana'
  }

  // Default to EVM
  return 'eip155'
}

/**
 * Transform Relay currency to PaymentAsset format
 */
function transformCurrency(currency: RelayCurrency): PaymentAsset {
  const normalizedChainId = normalizeChainId(currency.chainId)
  const chainNamespace = getChainNamespace(currency.chainId)

  return {
    network: `${chainNamespace}:${normalizedChainId}` as CaipNetworkId,
    asset: currency.address,
    metadata: {
      logoURI: currency.metadata.logoURI,
      name: currency.name,
      symbol: currency.symbol,
      decimals: currency.decimals
    }
  }
}

/**
 * Transform Relay.link response to simplified format
 */
function transformQuoteResponse(relayResponse: RelayQuoteResponse): SimplifiedQuoteResponse {
  const { details, fees, steps } = relayResponse

  // Extract origin currency (input)
  const origin: SimplifiedCurrencyAmount = {
    amount: details.route.origin.inputCurrency.amount,
    amountFormatted: details.route.origin.inputCurrency.amountFormatted,
    chainId: normalizeChainId(details.route.origin.inputCurrency.currency.chainId),
    symbol: details.route.origin.inputCurrency.currency.symbol,
    decimals: details.route.origin.inputCurrency.currency.decimals
  }

  // Extract destination currency (output)
  const destination: SimplifiedCurrencyAmount = {
    amount: details.route.destination.inputCurrency.amount,
    amountFormatted: details.route.destination.inputCurrency.amountFormatted,
    chainId: normalizeChainId(details.route.destination.inputCurrency.currency.chainId),
    symbol: details.route.destination.inputCurrency.currency.symbol,
    decimals: details.route.destination.inputCurrency.currency.decimals
  }

  // Transform fees into array of objects
  const feeArray: SimplifiedFee[] = []

  // Add gas fee (Network Fee)
  if (fees.gas && fees.gas.amount !== '0') {
    feeArray.push({
      id: 'network',
      label: 'Network Fee',
      amount: fees.gas.amount,
      amountFormatted: fees.gas.amountFormatted,
      chainId: normalizeChainId(fees.gas.currency.chainId),
      amountUsd: fees.gas.amountUsd,
      currency: transformCurrency(fees.gas.currency)
    })
  }

  // Combine relayer, relayerGas, and app fees into a single Service Fee
  const serviceFees = [fees.relayer, fees.relayerGas, fees.app].filter(
    (fee): fee is RelayFee => fee !== undefined && fee.amount !== '0'
  )

  if (serviceFees.length > 0) {
    // Pick the first currency (they should all be the same)
    const baseCurrency = serviceFees[0]

    if (baseCurrency) {
      const decimals = baseCurrency.currency.decimals

      // Sum all service fee amounts
      const totalAmount = serviceFees.reduce((sum, fee) => sum + BigInt(fee.amount), BigInt(0))

      // Sum all USD values
      const totalUsd = serviceFees
        .reduce((sum, fee) => sum + parseFloat(fee.amountUsd), 0)
        .toFixed(6)

      // Format the combined amount
      const totalFormatted = (Number(totalAmount) / 10 ** decimals).toFixed(decimals)

      feeArray.push({
        id: 'service',
        label: 'Service Fee',
        amount: totalAmount.toString(),
        amountFormatted: totalFormatted,
        chainId: normalizeChainId(baseCurrency.currency.chainId),
        amountUsd: totalUsd,
        currency: transformCurrency(baseCurrency.currency)
      })
    }
  }

  const combinedFees = feeArray

  // Extract additional metadata
  const requestId = steps[0]?.requestId
  const depositAddress = steps[0]?.depositAddress
  const timeEstimate = details.timeEstimate

  return {
    origin,
    destination,
    fees: combinedFees,
    requestId,
    depositAddress,
    timeEstimate
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: QuoteRequest = await request.json()

    // Validate required fields
    const requiredFields: (keyof QuoteRequest)[] = [
      'user',
      'originChainId',
      'originCurrency',
      'destinationChainId',
      'destinationCurrency',
      'recipient',
      'amount'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    let originChainIdNumeric: string
    let destinationChainIdNumeric: string

    try {
      originChainIdNumeric = toStringChainId(body.originChainId)
      destinationChainIdNumeric = toStringChainId(body.destinationChainId)
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid chain ID',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      )
    }

    const relayRequest: RelayQuoteRequest = {
      type: 'cross-chain',
      user: body.user,
      originChainId: originChainIdNumeric,
      destinationChainId: destinationChainIdNumeric,
      originCurrency: OVERRIDEN_ASSETS[body.originCurrency] || body.originCurrency,
      destinationCurrency: OVERRIDEN_ASSETS[body.destinationCurrency] || body.destinationCurrency,
      recipient: body.recipient,
      tradeType: 'EXPECTED_OUTPUT',
      amount: body.amount,
      referrer: 'relay.link',
      useExternalLiquidity: false,
      useDepositAddress: true,
      appFees: [
        {
          recipient: '0x8B271bedbf142EaB0819B113D9003Ee22BeE3871',
          fee: '1000'
        }
      ]
    }

    console.log('Calling Relay.link API with:', relayRequest)

    const relayResponse = await fetch('https://api.relay.link/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(relayRequest)
    })

    if (!relayResponse.ok) {
      const errorText = await relayResponse.text()
      console.error('Relay.link API error:', errorText)

      let errorMessage = 'Failed to fetch quote from Relay.link'

      try {
        const parsedError = JSON.parse(errorText)

        if (parsedError.message && typeof parsedError.message === 'string') {
          errorMessage = parsedError.message
        }
      } catch {
        // If parsing fails, keep the default message
      }

      return NextResponse.json({ error: errorMessage }, { status: relayResponse.status })
    }

    const relayData: RelayQuoteResponse = await relayResponse.json()

    // Transform the response to simplified format
    const simplifiedQuote = transformQuoteResponse(relayData)

    console.log('Transformed quote:', simplifiedQuote)

    // Return the simplified quote data
    return NextResponse.json(simplifiedQuote, { status: 200 })
  } catch (error) {
    console.error('Quote API error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
