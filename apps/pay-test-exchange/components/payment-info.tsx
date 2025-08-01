'use client'

import React from 'react'

import { useSearchParams } from 'next/navigation'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

interface PaymentInfoProps {
  className?: string
}

export default function PaymentInfo({ className }: PaymentInfoProps) {
  const searchParams = useSearchParams()

  const asset = searchParams.get('asset')
  const amount = searchParams.get('amount')
  const recipient = searchParams.get('recipient')

  function parseAsset(assetString: string | null) {
    if (!assetString) {
      return { chain: 'Unknown', standard: 'Unknown' }
    }

    const parts = assetString.split('/')
    const chainPart = parts[0]
    const standardPart = parts[1]
    const chainId = chainPart?.split(':')[1] || 'Unknown'
    const standard = standardPart?.split(':')[0] || 'Unknown'

    return {
      chain: `Chain ID: ${chainId}`,
      standard: standard.toUpperCase(),
      full: assetString
    }
  }

  const assetInfo = parseAsset(asset)

  if (!asset && !amount && !recipient) {
    return null
  }

  return (
    <div className={className}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="payment-details">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Payment Details</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {[asset, amount, recipient].filter(Boolean).length} parameters
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {asset && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Asset Information</h4>
                  <div className="bg-fg-secondary p-3 rounded-md space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Chain:</span>
                      <span className="text-sm font-mono">{assetInfo.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Standard:</span>
                      <span className="text-sm font-mono">{assetInfo.standard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Full Asset ID:</span>
                      <span className="text-sm font-mono ">{assetInfo.full}</span>
                    </div>
                  </div>
                </div>
              )}

              {amount && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Amount</h4>
                  <div className="bg-fg-secondary p-3 rounded-md">
                    <span className="text-md">{amount}</span>
                  </div>
                </div>
              )}

              {recipient && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recipient</h4>
                  <div className="bg-fg-secondary p-3 rounded-md">
                    <div className="text-xsmt-1 break-all">{recipient}</div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
