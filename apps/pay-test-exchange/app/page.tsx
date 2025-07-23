"use client"
import ExchangeActions from "@/components/exchange-actions";
import ErrorScreen from "@/components/error-screen";
import { useSearchParams } from "next/navigation";

export default function Home() {

  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId')
  if (!sessionId) {
    return <ErrorScreen />
  }


  
  return (
    <div>
        <ExchangeActions sessionId={sessionId} />
    </div>
  )
}
