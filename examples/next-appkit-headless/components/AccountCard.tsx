import { Link2Off } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import {
  useAppKit,
  useAppKitAccount,
  useAppKitConnections,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function AccountCard({ className, ...props }: React.ComponentProps<'div'>) {
  const { open } = useAppKit()
  const { address } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const { connections } = useAppKitConnections()

  const connection = connections[0]

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="flex p-4">
          <FieldGroup className="relative">
            <div className="flex flex-col items-start gap-2 text-center">
              <h1 className="text-2xl font-bold">Your wallet</h1>
              <p className="text-muted-foreground text-balance">
                See your wallet information below
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              className="absolute right-2 top-2"
              size="sm"
              onClick={() => open({ view: 'Networks' })}
            >
              {caipNetwork?.name}
            </Button>
            <Field>
              <FieldTitle className="text-muted-foreground">Address</FieldTitle>
              <p>{address}</p>
            </Field>
            {connection ? (
              <Field>
                <FieldTitle className="text-muted-foreground">Connected with</FieldTitle>
                <FieldLabel>
                  {connection?.icon && (
                    <Image src={connection.icon} alt={connection.name} width={24} height={24} />
                  )}
                  {connection.name}
                </FieldLabel>
              </Field>
            ) : null}
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card"></FieldSeparator>
            <Field>
              <Button
                type="submit"
                onClick={() => {
                  disconnect()
                  toast.success('Disconnected wallet')
                }}
              >
                <Link2Off />
                Disconnect
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
