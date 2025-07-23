"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { ReactNode } from 'react'

interface ActionResultProps {
  icon: ReactNode
  title: string
  description: ReactNode
  iconClassName?: string
}

export default function ActionResult({ icon, title, description, iconClassName = "" }: ActionResultProps) {
  const handleGoBack = () => {
    window.history.back()
  }

  const handleCloseTab = () => {
    window.close()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-auto max-w-lg mx-auto bg-fg-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <Image src="/reown-logo.png" alt="Reown Logo" width={200} height={200} className="mx-auto m-5" />
            {title}
          </CardTitle>
          <div className="flex justify-center mt-6 mb-5">
            <div className={`w-16 h-16 ${iconClassName}`}>
              {icon}
            </div>
          </div>
          <CardDescription className="py-5 text-md">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoBack}
              className="w-full"
              variant="default"
            >
              Go Back
            </Button>
            <Button 
              onClick={handleCloseTab}
              className="w-full"
              variant="default"
            >
              Close Tab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 