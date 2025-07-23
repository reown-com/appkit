"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPendingSession, markSessionSuccess, markSessionError } from "@/lib/session-actions";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ExchangeActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  
  useEffect(() => {
    createPendingSession(sessionId).catch((error) => {
      console.error('Failed to create pending session:', error);
    });
  }, [sessionId]);

  const handleSuccess = async () => {
    try {
      await markSessionSuccess(sessionId);
      router.push('/success');
    } catch (error) {
      console.error('Failed to mark session as success:', error);
    }
  };

  const handleError = async () => {
    try {
      await markSessionError(sessionId);
      router.push('/error');
    } catch (error) {
      console.error('Failed to mark session as error:', error);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-auto max-w-lg mx-auto bg-fg-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <Image src="/reown-logo.png" alt="Reown Logo" width={200} height={200} className="mx-auto m-5" />
            Reown Test Exchange
          </CardTitle>
          <CardDescription className="py-5 text-md">
            <p>
              This is a test environment for AppKit Pay. You can use this page to test the payment flow by simulating success or error scenarios.
            </p>
            <br />
            <p> 
              When you click the buttons below, the session status will be updated and you can go back to your dapp to see the result.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
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