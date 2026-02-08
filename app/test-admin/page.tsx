import { isUserAdmin } from '@/lib/utils/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
                <p className="text-red-500">Not logged in. Please log in first.</p>
            </div>
        )
    }

    const isAdmin = await isUserAdmin(user.id)

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
            <div className="space-y-4">
                <div>
                    <span className="font-semibold">User ID:</span> {user.id}
                </div>
                <div>
                    <span className="font-semibold">Email:</span> {user.email}
                </div>
                <div>
                    <span className="font-semibold">Is Admin?</span>{' '}
                    <span className={isAdmin ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {isAdmin ? 'YES' : 'NO'}
                    </span>
                </div>
                <div className="mt-8 p-4 bg-gray-100 rounded">
                    <h2 className="text-lg font-semibold mb-2">Instructions</h2>
                    <p>
                        If <b>Is Admin?</b> is NO, run this SQL in your Supabase SQL Editor:
                    </p>
                    <pre className="bg-black text-white p-4 mt-2 rounded overflow-x-auto">
                        {`INSERT INTO admin_users (user_id, role) 
VALUES ('${user.id}', 'superadmin')
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';`}
                    </pre>
                </div>
            </div>
        </div>
    )
}
