import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { User, TicketWithRelations } from "@shared/schema";

export default function AdminTeam() {
  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/employees"],
  });

  const { data: tickets = [] } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/admin/tickets"],
  });

  const employeeWorkload = employees.map((employee) => {
    const assignedTickets = tickets.filter((t) => t.assigneeId === employee.id);
    const activeTickets = assignedTickets.filter(
      (t) => t.status === "in_progress" || t.status === "review"
    );
    return {
      ...employee,
      totalTickets: assignedTickets.length,
      activeTickets: activeTickets.length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-1">
          Manage your design team and workload
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employeeWorkload.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No team members yet</p>
            </CardContent>
          </Card>
        ) : (
          employeeWorkload.map((employee) => (
            <Card key={employee.id} data-testid={`card-employee-${employee.id}`}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatarUrl || undefined} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{employee.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Projects</span>
                  <Badge
                    variant="outline"
                    className={
                      employee.activeTickets > 0
                        ? "bg-chart-3/10 text-chart-3"
                        : "bg-muted text-muted-foreground"
                    }
                    data-testid={`badge-active-${employee.id}`}
                  >
                    {employee.activeTickets}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Assigned</span>
                  <Badge variant="outline" data-testid={`badge-total-${employee.id}`}>
                    {employee.totalTickets}
                  </Badge>
                </div>
                <div className="pt-2">
                  {employee.activeTickets === 0 ? (
                    <p className="text-xs text-muted-foreground">Available for new work</p>
                  ) : employee.activeTickets >= 3 ? (
                    <p className="text-xs text-chart-3">At capacity</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Can take {3 - employee.activeTickets} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
