import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TicketWithRelations, User } from "@shared/schema";
import { UserPlus } from "lucide-react";
import { AssignmentDialog } from "@/components/assignment-dialog";
import { formatDistanceToNow } from "date-fns";

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

export default function AdminTickets() {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithRelations | null>(null);

  const { data: tickets = [], isLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/admin/tickets"],
  });

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/employees"],
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) =>
      apiRequest("PATCH", `/api/admin/tickets/${ticketId}/assign`, { assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setSelectedTicket(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="text-muted-foreground mt-1">
          Manage all client design requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tickets yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>{ticket.client.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[ticket.status]}`}
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${priorityColors[ticket.priority]}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ticket.assignee.avatarUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {ticket.assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ticket.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          data-testid={`button-assign-${ticket.id}`}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <AssignmentDialog
          ticket={selectedTicket}
          employees={employees}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onAssign={(assigneeId) =>
            assignMutation.mutate({ ticketId: selectedTicket.id, assigneeId })
          }
        />
      )}
    </div>
  );
}
