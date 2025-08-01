import { XCircle } from 'lucide-react'

import ActionResult from '@/components/action-result'

export default function ErrorActionPage() {
  const description = (
    <>
      <p>The session has been updated to reflect the error state.</p>
      <br />
      <p>This test exchange has simulated a payment failure.</p>
    </>
  )

  return (
    <ActionResult
      icon={<XCircle className="w-full h-full" />}
      title="Payment Failed"
      description={description}
      iconClassName="text-red-500"
    />
  )
}
