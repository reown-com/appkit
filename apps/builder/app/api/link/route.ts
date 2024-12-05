import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { value } = await request.json()

    if (!value) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 })
    }

    const shortId = uuidv4().split('-')[0] // Get first segment of UUID for shorter ID

    const { error } = await supabase.from('builder_link').insert([
      {
        uuid: shortId,
        value
      }
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: shortId })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
