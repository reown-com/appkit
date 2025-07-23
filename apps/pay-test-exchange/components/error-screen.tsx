import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-auto max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
          <CardDescription>
            Invalid configuration provided. Please check your URL and try again.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
