import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserEmail() {
    const userId = 'ddc77c66-a99f-4ffc-a4ec-368e538eb291'
    console.log(`🔍 Checking auth.users for user_id: ${userId}`)

    // Use admin API to get user
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
        console.error('❌ Error getting user:', error)
    } else if (user) {
        console.log('✅ User found in auth.users:')
        console.log('📧 Email:', user.email)
        console.log('👤 ID:', user.id)
        console.log('📅 Created At:', user.created_at)
    } else {
        console.log('⚠️  User not found in auth.users')
    }
}

checkUserEmail()
