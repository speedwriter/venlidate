import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyUserKarmaEmail() {
    console.log('🔍 Verifying user_karma email column...\n')

    // Fetch all user_karma records
    const { data, error } = await supabase
        .from('user_karma')
        .select('user_id, email, karma_points, ideas_shared, free_validation_credits')
        .limit(10)

    if (error) {
        console.error('❌ Error fetching user_karma:', error)
        process.exit(1)
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No user_karma records found')
        process.exit(0)
    }

    console.log(`✅ Found ${data.length} user_karma records\n`)

    // Check if email column exists and is populated
    let emailsPopulated = 0
    let emailsMissing = 0

    data.forEach((record, index) => {
        console.log(`Record ${index + 1}:`)
        console.log(`  User ID: ${record.user_id}`)
        console.log(`  Email: ${record.email || '❌ MISSING'}`)
        console.log(`  Karma Points: ${record.karma_points}`)
        console.log(`  Ideas Shared: ${record.ideas_shared}`)
        console.log(`  Free Credits: ${record.free_validation_credits}`)
        console.log('')

        if (record.email) {
            emailsPopulated++
        } else {
            emailsMissing++
        }
    })

    console.log('📊 Summary:')
    console.log(`  Total records: ${data.length}`)
    console.log(`  Emails populated: ${emailsPopulated}`)
    console.log(`  Emails missing: ${emailsMissing}`)

    if (emailsMissing > 0) {
        console.log('\n⚠️  Some emails are missing. This might indicate the backfill didn\'t complete.')
    } else {
        console.log('\n✅ All user_karma records have emails!')
    }
}

verifyUserKarmaEmail()
