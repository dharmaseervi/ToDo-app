import AdminUserTable from '@/components/ui/admin-user-table'
import React from 'react'

function User() {
    return (
        <div>
            <section className="bg-white dark:bg-gray-950 rounded-2xl shadow p-4">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <AdminUserTable />
            </section>
        </div>
    )
}

export default User
