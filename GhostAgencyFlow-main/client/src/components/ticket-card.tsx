import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Paperclip } from "lucide-react";
import type { TicketWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TicketCardProps {
  ticket: TicketWithRelations;
  onClick?: () => void;
  isDragging?: boolean;
}

const statusColors = {
  requested: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  in_progress: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  review: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  completed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-3/10 text-chart-3",
  high: "bg-destructive/10 text-destructive",
};

export function TicketCard({ ticket, onClick, isDragging }: TicketCardProps) {
  return (
    <Card
      className={`cursor-pointer hover-elevate active-elevate-2 transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onClick}
      data-testid={`card-ticket-${ticket.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2">{ticket.title}</h3>
          <Badge
            variant="outline"
            className={`capitalize text-xs ${priorityColors[ticket.priority]}`}
          >
            {ticket.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`capitalize text-xs ${statusColors[ticket.status]}`}
            data-testid={`badge-status-${ticket.id}`}
          >
            {ticket.status.replace("_", " ")}
          </Badge>

          {ticket.assignee && (
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
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
          </div>
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{ticket.attachments.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
