import { PageBuilder } from '@/components/page-builder'
import { getAppKitConfig } from '@/lib/supabase'
import { AppKitProvider } from '@/providers/appkit-provider'

export default async function Page({ params }: { params: { uid: string } }) {
  const config = await getAppKitConfig(params.uid)

  return (
    <AppKitProvider initialConfig={config}>
      <PageBuilder />
    </AppKitProvider>
  )
}
