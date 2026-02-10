import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function verifyEmailFix() {
    console.log('🔍 Verifying user_karma email fix...\n')

    // 1. Check for NULL emails
    const { data: nullEmails, error: nullError } = await supabase
        .from('user_karma')
        .select('id, user_id, email')
        .is('email', null)

    if (nullError) {
        console.error('❌ Error checking for NULL emails:', nullError)
        return
    }

    console.log(`📊 Records with NULL email: ${nullEmails?.length || 0}`)
    if (nullEmails && nullEmails.length > 0) {
        console.log('⚠️  Found records with NULL emails:')
        nullEmails.forEach(record => {
            console.log(`   - ID: ${record.id}, User ID: ${record.user_id}`)
        })
    } else {
        console.log('✅ All records have email addresses!')
    }

    // 2. Check the specific record mentioned by the user
    console.log('\n🔍 Checking specific record: 7e672fa8-1e2e-4bac-a2aa-e15f16783edd')
    const { data: specificRecord, error: specificError } = await supabase
        .from('user_karma')
        .select('id, user_id, email')
        .eq('id', '7e672fa8-1e2e-4bac-a2aa-e15f16783edd')
        .single()

    if (specificError) {
        console.error('❌ Error fetching specific record:', specificError)
    } else if (specificRecord) {
        console.log('📧 Email:', specificRecord.email || 'NULL')
        if (specificRecord.email) {
            console.log('✅ Email is now populated!')
        } else {
            console.log('❌ Email is still NULL')
        }
    } else {
        console.log('⚠️  Record not found')
    }

    // 3. Show total user_karma records
    const { count, error: countError } = await supabase
        .from('user_karma')
        .select('*', { count: 'exact', head: true })

    if (!countError) {
        console.log(`\n📊 Total user_karma records: ${count}`)
    }
}

verifyEmailFix()
