'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OrderRow {
  id: number
  email: string
  paid: boolean
  amount: number
  currency: string
  product_id: string | null
  created_at: string
  print_order_id: number | null
  print_size: string | null
  print_status: string | null
  tracking_number: string | null
  tracking_url: string | null
  recipient_name: string | null
  recipient_address1: string | null
  recipient_city: string | null
  recipient_state_code: string | null
  recipient_country_code: string | null
  recipient_zip: string | null
  recipient_phone: string | null
}

export function OrdersTab({ password }: { password: string }) {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/orders', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
  }, [password])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Print</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <>
                    <tr
                      key={o.id}
                      className="border-b border-border/50 cursor-pointer hover:bg-secondary/50"
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      <td className="py-3 px-2 text-foreground">{o.id}</td>
                      <td className="py-3 px-2 text-foreground">{o.email}</td>
                      <td className="py-3 px-2 text-foreground">
                        {o.amount} {o.currency}
                        {o.recipient_country_code === 'TR' && (
                          <Badge className="ml-2 bg-red-500/20 text-red-400">TR</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={o.paid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {o.paid ? 'Paid' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {o.print_order_id ? (
                          <Badge className="bg-blue-500/20 text-blue-400">{o.print_status || 'ordered'}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                    {expandedId === o.id && o.recipient_name && (
                      <tr key={`${o.id}-details`}>
                        <td colSpan={6} className="py-3 px-4 bg-secondary/30">
                          <div className="text-xs space-y-1">
                            <p><strong>Recipient:</strong> {o.recipient_name}</p>
                            <p><strong>Address:</strong> {o.recipient_address1}, {o.recipient_city} {o.recipient_state_code} {o.recipient_zip}</p>
                            <p><strong>Country:</strong> {o.recipient_country_code} | <strong>Phone:</strong> {o.recipient_phone}</p>
                            {o.tracking_number && <p><strong>Tracking:</strong> {o.tracking_url ? <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{o.tracking_number}</a> : o.tracking_number}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
