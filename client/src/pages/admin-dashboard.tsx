import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { TicketWithRelations, User } from "@shared/schema";
import { Ticket, Users, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: tickets = [] } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/admin/tickets"],
  });

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/employees"],
  });

  const stats = {
    total: tickets.length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    review: tickets.filter((t) => t.status === "review").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your design agency operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-tickets">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All design requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3" data-testid="stat-in-progress">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1" data-testid="stat-review">
              {stats.review}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-employees">{employees.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active designers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tickets yet</p>
          ) : (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                  data-testid={`activity-${ticket.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.client.name} • {ticket.status.replace("_", " ")}
                    </p>
                  </div>
                  {ticket.assignee && (
                    <div className="text-sm text-muted-foreground">
                      Assigned to {ticket.assignee.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
