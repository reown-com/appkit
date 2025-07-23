import ActionResult from "@/components/action-result";
import { XCircle } from 'lucide-react';

export default function ErrorActionPage() {
  const description = (
    <>
      <p>
        Unfortunately, your payment could not be processed. The session has been updated to reflect the error state.
      </p>
      <br />
      <p> 
        This test exchange has simulated a payment failure. Please try again or contact support if you continue to experience issues.
      </p>
    </>
  );

  return (
    <ActionResult
      icon={<XCircle className="w-full h-full" />}
      title="Payment Failed"
      description={description}
      iconClassName="text-red-500"
    />
  );
} 