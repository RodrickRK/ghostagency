import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { TicketWithRelations, User } from "@shared/schema";
import { Ticket, Users, CheckCircle, Clock } from "lucide-react";

const statusColors = {
  requested: "bg-chart-4/10 text-chart-4",
  in_progress: "bg-chart-3/10 text-chart-3",
  review: "bg-chart-1/10 text-chart-1",
  completed: "bg-chart-2/10 text-chart-2",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-3/10 text-chart-3",
  high: "bg-destructive/10 text-destructive",
};

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
              {/* Show unassigned tickets first, then recently updated tickets */}
              {tickets
                .sort((a, b) => {
                  // Unassigned tickets first
                  if (!a.assigneeId && b.assigneeId) return -1;
                  if (a.assigneeId && !b.assigneeId) return 1;
                  // Then by date
                  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                })
                .slice(0, 5)
                .map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                  data-testid={`activity-${ticket.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{ticket.client.name}</span>
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusColors[ticket.status]}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      {ticket.priority === "high" && (
                        <Badge
                          variant="outline"
                          className={priorityColors.high}
                        >
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.assignee ? (
                      <>Assigned to {ticket.assignee.name}</>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/admin/tickets'}
                        className="text-primary hover:text-primary/80"
                      >
                        Needs Assignment
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
