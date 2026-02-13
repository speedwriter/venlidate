import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFunctionSource() {
    console.log('🔍 Fetching create_user_karma function source...')

    // We can use rpc to call a function that returns the source, 
    // but since we don't have such a function, we'll try to use a raw query if allowed,
    // or we'll just check if we can reach it via a custom RPC if we create one.
    // Actually, we can use the 'supabase' client to run a query on pg_proc if we have permissions.
    // Usually service_role can do a lot, but sometimes direct pg_proc access is restricted via PostgREST.

    const { data, error } = await supabase.rpc('get_function_source', { fn_name: 'create_user_karma' })

    if (error) {
        console.log('⚠️  Could not use RPC get_function_source (likely doesn\'t exist).')
        console.log('Attempting to read via migrations and verify logic...')
    } else {
        console.log('Source code:\n', data)
    }
}

// Instead of RPC, let's just try to backfill again and see if it stays filled.
// And let's look for any other triggers.

checkFunctionSource()
