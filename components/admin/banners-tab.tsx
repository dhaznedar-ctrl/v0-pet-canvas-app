'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Banner {
  id: number
  message: string
  type: string
  active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export function BannersTab({ password }: { password: string }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newType, setNewType] = useState('info')

  const fetchBanners = () => {
    fetch('/api/admin/banners', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => setBanners(d.banners || []))
      .catch(console.error)
  }

  useEffect(() => { fetchBanners() }, [password])

  const createBanner = async () => {
    if (!newMessage.trim()) return
    await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ message: newMessage, type: newType, active: true }),
    })
    setNewMessage('')
    fetchBanners()
  }

  const toggleActive = async (banner: Banner) => {
    await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: banner.id, active: !banner.active }),
    })
    fetchBanners()
  }

  const typeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-400'
      case 'warning': return 'bg-amber-500/20 text-amber-400'
      case 'promo': return 'bg-pink-500/20 text-pink-400'
      case 'maintenance': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Create Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Banner message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-secondary border-border"
            />
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createBanner}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No banners</p>
          ) : (
            <div className="space-y-3">
              {banners.map((b) => (
                <div key={b.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Badge className={typeColor(b.type)}>{b.type}</Badge>
                    <span className="text-foreground text-sm">{b.message}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(b)}
                    className={b.active ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-transparent'}
                  >
                    {b.active ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
