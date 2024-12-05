import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getAppKitConfig(uid: string) {
  const { data, error } = await supabase
    .from('builder_link')
    .select('value')
    .eq('uuid', uid)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  const parsedValue = JSON.parse(atob(data.value))

  return parsedValue
}
