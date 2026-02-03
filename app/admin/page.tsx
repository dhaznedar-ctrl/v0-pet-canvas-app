'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Lock, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Job {
  id: number
  email: string
  style: string
  status: string
  created_at: string
  updated_at: string
}

interface Consent {
  id: number
  email: string
  ip_hash: string
  consent_version: string
  accepted_terms_a: boolean
  accepted_terms_b: boolean
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [consents, setConsents] = useState<Consent[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        toast({ title: 'Invalid password', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Authentication failed', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      const [jobsRes, consentsRes] = await Promise.all([
        fetch('/api/admin/jobs', {
          headers: { 'x-admin-password': password },
        }),
        fetch('/api/admin/consents', {
          headers: { 'x-admin-password': password },
        }),
      ])

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      }

      if (consentsRes.ok) {
        const consentsData = await consentsRes.json()
        setConsents(consentsData.consents || [])
      }
    } catch {
      toast({ title: 'Failed to fetch data', variant: 'destructive' })
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-foreground">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border"
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoadingData}
            className="bg-transparent"
          >
            {isLoadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="consents">Consents ({consents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Generation Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No jobs found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Style</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job.id} className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">{job.id}</td>
                            <td className="py-3 px-4 text-foreground">{job.email}</td>
                            <td className="py-3 px-4 text-foreground capitalize">{job.style}</td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(job.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consents">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Consent Records</CardTitle>
              </CardHeader>
              <CardContent>
                {consents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No consents found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Version</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Terms A</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Terms B</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consents.map((consent) => (
                          <tr key={consent.id} className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">{consent.id}</td>
                            <td className="py-3 px-4 text-foreground">{consent.email}</td>
                            <td className="py-3 px-4 text-foreground">{consent.consent_version}</td>
                            <td className="py-3 px-4">
                              <Badge className={consent.accepted_terms_a ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {consent.accepted_terms_a ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={consent.accepted_terms_b ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {consent.accepted_terms_b ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(consent.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
