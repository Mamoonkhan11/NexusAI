"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data.users) ? data.users : [])
      } else {
        console.error('Failed to fetch users:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      const response = await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, block }),
      })

      if (response.ok) {
        toast.success(`User ${block ? 'blocked' : 'unblocked'} successfully`)
        fetchUsers() // Refresh the user list
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      console.error('Block user error:', error)
      toast.error('Failed to update user')
    }
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage system users and their access</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-slate-400">Loading users...</div>
        ) : users && Array.isArray(users) && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => {
              const isActive = user.last_sign_in_at && new Date(user.last_sign_in_at) > fiveMinutesAgo
              const isBlocked = user.user_metadata?.blocked === true

              return (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  isBlocked ? 'border-red-500/50 bg-red-500/10' :
                  isActive ? 'border-green-500/50 bg-green-500/10' :
                  'border-slate-700 bg-slate-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isBlocked ? 'bg-red-500' :
                      isActive ? 'bg-green-500' : 'bg-slate-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{user.email}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Badge variant="outline" className="text-xs">
                          {user.user_metadata?.role || 'user'}
                        </Badge>
                        <span>Joined {format(new Date(user.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.last_sign_in_at && (
                      <span className="text-xs text-slate-500">
                        Last: {format(new Date(user.last_sign_in_at), 'HH:mm')}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={isBlocked ? "outline" : "destructive"}
                      className="text-xs"
                      onClick={() => handleBlockUser(user.id, !isBlocked)}
                    >
                      {isBlocked ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-400 text-center py-8">
            {users && Array.isArray(users) ? 'No users found' : 'Failed to load users'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
