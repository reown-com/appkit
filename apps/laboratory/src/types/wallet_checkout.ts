/**
 * Hexadecimal string representation with '0x' prefix
 */
export type Hex = `0x${string}`

/**
 * Metadata for a product included in the checkout
 * @property name - The name of the product
 * @property description - Optional description of the product
 * @property imageUrl - Optional URL to an image of the product
 * @property price - Optional price of the product in a human-readable format (e.g. "$100.00")
 */
export type ProductMetadata = {
  /** The name of the product */
  name: string
  /** Optional description of the product */
  description?: string
  /** Optional URL to an image of the product */
  imageUrl?: string
  /** Optional price of the product in a human-readable format (e.g. "$100.00") */
  price?: string
}

/**
 * Smart contract interaction details
 * @property type - The type of contract interaction (e.g. "evm-calls", "solana-instruction")
 * @property data - Data required for the specific contract interaction type
 */
export type ContractInteraction = {
  /** The type of contract interaction (e.g. "evm-calls", "solana-instruction") */
  type: string
  /** Data required for the specific contract interaction type */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}

/**
 * EVM-specific contract interaction
 * @property type - Must be "evm-calls"
 * @property data - Array of contract call data objects
 */
export type EvmContractInteraction = {
  /** Must be "evm-calls" */
  type: 'evm-calls'
  /** Array of contract call data objects */
  data: {
    /** Contract address */
    to: string
    /** Optional additional ETH value */
    value?: Hex
    /** Contract call data */
    data: Hex
  }[]
}

/**
 * Solana-specific contract interaction
 * @property type - Must be "solana-instruction"
 * @property data - Solana instruction data
 */
export type SolanaContractInteraction = {
  /** Must be "solana-instruction" */
  type: 'solana-instruction'
  /** Solana instruction data */
  data: {
    /** Program ID */
    programId: string
    /** Accounts involved in the instruction */
    accounts: {
      /** Account public key */
      pubkey: string
      /** Whether the account needs to sign the transaction */
      isSigner: boolean
      /** Whether the account's data will be modified */
      isWritable: boolean
    }[]
    /** Base64-encoded instruction data */
    data: string
  }
}

/**
 * A payment option for the checkout
 * @property asset - CAIP-19 asset identifier
 * @property amount - Hex-encoded amount of the asset to transfer
 * @property recipient - Optional CAIP-10 account ID of the recipient (required for direct payments)
 * @property contractInteraction - Optional contract interaction details (required for contract-based payments)
 */
export type PaymentOption = {
  /** CAIP-19 asset identifier */
  asset: string
  /** Hex-encoded amount of the asset to transfer */
  amount: Hex
  /** CAIP-10 account ID of the recipient (required for direct payments) */
  recipient?: string
  /** Contract interaction details (required for contract-based payments) */
  contractInteraction?: ContractInteraction
}

/**
 * Checkout request parameters
 * @property orderId - Unique identifier for this checkout request (max 128 chars)
 * @property acceptedPayments - Array of accepted payment options
 * @property products - Optional array of product metadata
 * @property expiry - Optional UNIX timestamp (seconds) after which the payment request expires
 */
export type CheckoutRequest = {
  /** Unique identifier for this checkout request (max 128 chars) */
  orderId: string
  /** Array of accepted payment options */
  acceptedPayments: PaymentOption[]
  /** Optional array of product metadata */
  products?: ProductMetadata[]
  /** Optional UNIX timestamp (seconds) after which the payment request expires */
  expiry?: number
}

/**
 * Checkout result returned by the wallet
 * @property orderId - Matching order ID from the original request
 * @property txid - Transaction identifier on the blockchain
 * @property recipient - Optional CAIP-10 account ID that received the payment
 * @property asset - Optional CAIP-19 asset identifier that was used for payment
 * @property amount - Optional hex-encoded amount that was paid
 */
export type CheckoutResult = {
  /** Matching order ID from the original request */
  orderId: string
  /** Transaction identifier on the blockchain */
  txid: string
  /** CAIP-10 account ID that received the payment */
  recipient?: string
  /** CAIP-19 asset identifier that was used for payment */
  asset?: string
  /** Hex-encoded amount that was paid */
  amount?: Hex
}

/**
 * Error codes for wallet_checkout method
 */
// eslint-disable-next-line no-shadow
export enum CheckoutErrorCode {
  /** User rejected the payment */
  USER_REJECTED = 4001,
  /** No matching assets available in user's wallet */
  NO_MATCHING_ASSETS = 4100,
  /** Checkout has expired */
  CHECKOUT_EXPIRED = 4200,
  /** Insufficient funds for the payment */
  INSUFFICIENT_FUNDS = 4300,
  /** Unsupported contract interaction type */
  UNSUPPORTED_CONTRACT_INTERACTION = 4400,
  /** Invalid contract interaction data */
  INVALID_CONTRACT_INTERACTION_DATA = 4401,
  /** Contract interaction failed during execution */
  CONTRACT_INTERACTION_FAILED = 4402,
  /** Method not found (wallet doesn't support wallet_checkout) */
  METHOD_NOT_FOUND = -32601
}

/**
 * Checkout error response
 * @property code - Error code indicating the type of error
 * @property message - Description of the error
 * @property data - Optional additional data about the error
 */
export type CheckoutError = {
  /** Error code indicating the type of error */
  code: CheckoutErrorCode
  /** Description of the error */
  message: string
  /** Optional additional data about the error */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

/**
 * JSON-RPC request for wallet_checkout method
 * @property method - Must be "wallet_checkout"
 * @property params - Array containing the CheckoutRequest object
 * @property id - Request identifier
 * @property jsonrpc - JSON-RPC version, must be "2.0"
 */
export type WalletCheckoutRequest = {
  /** Must be "wallet_checkout" */
  method: 'wallet_checkout'
  /** Array containing the CheckoutRequest object */
  params: [CheckoutRequest]
  /** Request identifier */
  id: number | string
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: '2.0'
}

/**
 * JSON-RPC successful response for wallet_checkout method
 * @property result - The checkout result
 * @property id - Matching request identifier
 * @property jsonrpc - JSON-RPC version, must be "2.0"
 */
export type WalletCheckoutSuccessResponse = {
  /** The checkout result */
  result: CheckoutResult
  /** Matching request identifier */
  id: number | string
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: '2.0'
}

/**
 * JSON-RPC error response for wallet_checkout method
 * @property error - The error details
 * @property id - Matching request identifier
 * @property jsonrpc - JSON-RPC version, must be "2.0"
 */
export type WalletCheckoutErrorResponse = {
  /** The error details */
  error: CheckoutError
  /** Matching request identifier */
  id: number | string
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: '2.0'
}

/**
 * JSON-RPC response for wallet_checkout method (success or error)
 */
export type WalletCheckoutResponse = WalletCheckoutSuccessResponse | WalletCheckoutErrorResponse
