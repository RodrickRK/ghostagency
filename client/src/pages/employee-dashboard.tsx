import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { TicketWithRelations } from "@shared/schema";
import { Ticket } from "lucide-react";

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

export default function EmployeeDashboard() {
  // Use the employee-specific endpoint
  const { data: tickets = [], isLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/employee/tickets"],
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
          View your assigned tickets and tasks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned to me</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tickets assigned yet</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.title}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={statusColors[ticket.status]}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </div>
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