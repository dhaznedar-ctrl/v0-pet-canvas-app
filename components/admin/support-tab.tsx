'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Ticket {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export function SupportTab({ password }: { password: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    fetch('/api/admin/support', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => setTickets(d.tickets || []))
      .catch(console.error)
  }, [password])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ status }),
    })
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return 'bg-red-500/20 text-red-400'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400'
      case 'resolved': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Support Tickets ({tickets.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No support tickets</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-foreground">#{t.id}</span>
                    <span className="ml-2 text-muted-foreground">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(t.status)}>{t.status}</Badge>
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="font-semibold text-foreground text-sm">{t.subject}</p>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{t.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
