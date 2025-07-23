"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const handleSuccess = () => {
    console.log("Payment completed successfully!");
    // Add your success logic here
  };

  const handleError = () => {
    console.log("Payment failed with error!");
    // Add your error logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-auto max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Payment Test Exchange
          </CardTitle>
          <CardDescription>
            Test payment flows by simulating success or error scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button>Test</Button>
            <Button 
              onClick={handleSuccess}
              className="w-full"
              variant="default"
            >
              Complete Successfully
            </Button>
            <Button 
              onClick={handleError}
              className="w-full"
              variant="destructive"
            >
              Trigger Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
