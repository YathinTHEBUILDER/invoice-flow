import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserStatusActions } from "./user-status-actions"; // Client component
import { Users as UsersIcon, ShieldAlert, CheckCircle2 } from "lucide-react";

export default async function AdminUserManagement() {
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)]
  });

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
        <p className="text-muted-foreground">Monitor and control access for all platform participants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.isSuspended).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active KYC</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.kycStatus === 'approved').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">KYC</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{user.fullName || "Unnamed User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${
                        user.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                        user.kycStatus === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-amber-500/10 text-amber-600'
                      } border-none`}>
                        {user.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      ₹{parseFloat(user.walletBalance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge className="bg-emerald-500 text-white border-none">Active</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserStatusActions userId={user.id} isSuspended={user.isSuspended} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
