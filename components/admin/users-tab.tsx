'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserRow {
  id: number
  email: string
  credits: number
  created_at: string
  order_count: number
  generation_count: number
}

export function UsersTab({ password }: { password: string }) {
  const [users, setUsers] = useState<UserRow[]>([])

  useEffect(() => {
    fetch('/api/admin/users', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(console.error)
  }, [password])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Credits</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Orders</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Generations</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-3 px-2 text-foreground">{u.id}</td>
                    <td className="py-3 px-2 text-foreground">{u.email}</td>
                    <td className="py-3 px-2 text-foreground">{u.credits}</td>
                    <td className="py-3 px-2 text-foreground">{u.order_count}</td>
                    <td className="py-3 px-2 text-foreground">{u.generation_count}</td>
                    <td className="py-3 px-2 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
