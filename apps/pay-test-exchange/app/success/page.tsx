import { CheckCircle } from 'lucide-react'

import ActionResult from '@/components/action-result'

export default function SuccessPage() {
  const description = (
    <>
      <p>
        Your payment has been processed successfully! The session has been updated and you can now
        return to your application.
      </p>
      <br />
      <p>
        This test exchange has completed the payment simulation. You may close this tab or navigate
        back to your application.
      </p>
    </>
  )

  return (
    <ActionResult
      icon={<CheckCircle className="w-full h-full" />}
      title="Payment Successful"
      description={description}
      iconClassName="text-green-500"
    />
  )
}
