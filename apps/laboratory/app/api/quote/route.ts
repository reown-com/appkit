import { NextRequest, NextResponse } from 'next/server'

/**
 * Relay.link Quote API Proxy
 *
 * Simplified endpoint that proxies requests to Relay.link's quote API
 * with sensible defaults for unused parameters and transforms the response
 * into a simplified structure.
 */

// ============================================================
// REQUEST TYPES
// ============================================================

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
}

// ============================================================
// RELAY.LINK RESPONSE TYPES
// ============================================================

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

// ============================================================
// SIMPLIFIED RESPONSE TYPES
// ============================================================

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
 * Simplified currency matching TransfersController format
 */
interface SimplifiedCurrency {
  name: string
  symbol: string
  address: string
  decimals: number
  logoUri: string
  caipNetworkId: string
}

/**
 * Simplified fee information
 */
interface SimplifiedFee {
  label: string
  amount: string
  amountFormatted: string
  chainId: NormalizedChainId
  amountUsd: string
  currency: SimplifiedCurrency
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

// ============================================================
// CHAIN ID MAPPING
// ============================================================

/**
 * Special chain ID mappings for Bitcoin and Solana
 * Maps numeric IDs to normalized string IDs
 */
const CHAIN_ID_MAP: Record<number, string> = {
  8253038: '000000000019d6689c085ae165831e93', // Bitcoin
  792703809: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' // Solana
}

/**
 * Reverse mapping: normalized string IDs to numeric IDs
 */
const REVERSE_CHAIN_ID_MAP: Record<string, string> = {
  '000000000019d6689c085ae165831e93': '8253038', // Bitcoin
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': '792703809' // Solana
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

// ============================================================
// TRANSFORMATION FUNCTIONS
// ============================================================

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
 * Transform Relay currency to simplified format matching TransfersController
 */
function transformCurrency(currency: RelayCurrency): SimplifiedCurrency {
  const normalizedChainId = normalizeChainId(currency.chainId)
  const chainNamespace = getChainNamespace(currency.chainId)

  return {
    name: currency.name,
    symbol: currency.symbol,
    address: currency.address,
    decimals: currency.decimals,
    logoUri: currency.metadata.logoURI,
    caipNetworkId: `${chainNamespace}:${normalizedChainId}`
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

  // Add gas fee
  if (fees.gas && fees.gas.amount !== '0') {
    feeArray.push({
      label: 'Gas Fee',
      amount: fees.gas.amount,
      amountFormatted: fees.gas.amountFormatted,
      chainId: normalizeChainId(fees.gas.currency.chainId),
      amountUsd: fees.gas.amountUsd,
      currency: transformCurrency(fees.gas.currency)
    })
  }

  // Add relayer fee
  if (fees.relayer && fees.relayer.amount !== '0') {
    feeArray.push({
      label: 'Relayer Fee',
      amount: fees.relayer.amount,
      amountFormatted: fees.relayer.amountFormatted,
      chainId: normalizeChainId(fees.relayer.currency.chainId),
      amountUsd: fees.relayer.amountUsd,
      currency: transformCurrency(fees.relayer.currency)
    })
  }

  // Add relayer gas fee
  if (fees.relayerGas && fees.relayerGas.amount !== '0') {
    feeArray.push({
      label: 'Relayer Gas Fee',
      amount: fees.relayerGas.amount,
      amountFormatted: fees.relayerGas.amountFormatted,
      chainId: normalizeChainId(fees.relayerGas.currency.chainId),
      amountUsd: fees.relayerGas.amountUsd,
      currency: transformCurrency(fees.relayerGas.currency)
    })
  }

  // Add app fee
  if (fees.app && fees.app.amount !== '0') {
    feeArray.push({
      label: 'App Fee',
      amount: fees.app.amount,
      amountFormatted: fees.app.amountFormatted,
      chainId: normalizeChainId(fees.app.currency.chainId),
      amountUsd: fees.app.amountUsd,
      currency: transformCurrency(fees.app.currency)
    })
  }

  // Add subsidized fee if present
  if (fees.subsidized && fees.subsidized.amount !== '0') {
    feeArray.push({
      label: 'Subsidized Fee',
      amount: fees.subsidized.amount,
      amountFormatted: fees.subsidized.amountFormatted,
      chainId: normalizeChainId(fees.subsidized.currency.chainId),
      amountUsd: fees.subsidized.amountUsd,
      currency: transformCurrency(fees.subsidized.currency)
    })
  }

  // Extract additional metadata
  const requestId = steps[0]?.requestId
  const depositAddress = steps[0]?.depositAddress
  const timeEstimate = details.timeEstimate

  return {
    origin,
    destination,
    fees: feeArray,
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

    // Convert chain IDs to numeric format for Relay.link API
    // Supports both numeric strings (e.g., "1", "8453") and normalized special chain IDs
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
      user: body.user,
      originChainId: originChainIdNumeric,
      destinationChainId: destinationChainIdNumeric,
      originCurrency: body.originCurrency,
      destinationCurrency: body.destinationCurrency,
      recipient: body.recipient,
      tradeType: 'EXPECTED_OUTPUT',
      amount: body.amount as string,
      referrer: 'relay.link',
      useExternalLiquidity: false,
      useDepositAddress: true
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
      return NextResponse.json(
        { error: 'Failed to fetch quote from Relay.link', details: errorText },
        { status: relayResponse.status }
      )
    }

    const relayData: RelayQuoteResponse = await relayResponse.json()
    // fs.writeFileSync('relay-data.json', JSON.stringify(relayData, null, 2))

    // Transform the response to simplified format
    const simplifiedQuote = transformQuoteResponse(relayData)

    console.log('Transformed quote:', simplifiedQuote)

    // Return the simplified quote data
    return NextResponse.json(simplifiedQuote, { status: 200 })
  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
