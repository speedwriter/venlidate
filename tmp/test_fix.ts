
import { createClient } from './lib/supabase/server'

async function testQuery() {
  const supabase = await createClient()
  const roadmapId = 'ANY_ID' // Just to test query syntax
  
  const { data, error } = await supabase
    .from('roadmap')
    .select(`
      *,
      idea:ideas (
        id,
        title,
        description,
        score,
        score_breakdown
      ),
      phase (
        *,
        sprint (
          *,
          task (*)
        )
      )
    `)
    .eq('id', roadmapId)
    .single()

  console.log('Error:', error?.message || error)
  console.log('Data:', data)
}

// Note: I can't actually run this because I can't mock cookies() easily in a script
// but I can at least check if the types are happy.
