import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TicketWithRelations } from "@shared/schema";
import { TicketCard } from "@/components/ticket-card";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const columns = [
  { id: "requested", title: "Requested", color: "bg-chart-4/10" },
  { id: "in_progress", title: "In Progress", color: "bg-chart-3/10" },
  { id: "review", title: "Review", color: "bg-chart-1/10" },
  { id: "completed", title: "Completed", color: "bg-chart-2/10" },
];

export default function ClientBoard() {
  const { toast } = useToast();
  const [activeTicket, setActiveTicket] = useState<TicketWithRelations | null>(null);

  const { data: tickets = [], isLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/tickets"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      apiRequest("PATCH", `/api/tickets/${ticketId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Status updated",
        description: "Ticket moved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Could not move ticket",
        variant: "destructive",
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const ticketsByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tickets.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<string, TicketWithRelations[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    
    // Get the column ID - if dropped on a ticket, get the parent column, otherwise get the over.id directly
    let newStatus: string;
    if (over.data.current?.sortable) {
      // Dropped on another ticket - get the container ID
      newStatus = over.data.current.sortable.containerId;
    } else {
      // Dropped in empty column space
      newStatus = over.id as string;
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Optimistically update the UI
    queryClient.setQueryData<TicketWithRelations[]>(["/api/tickets"], (old) =>
      old?.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus as any } : t
      ) || []
    );

    updateStatusMutation.mutate({ ticketId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild data-testid="button-back">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">Project Board</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Loading board...</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tickets={ticketsByStatus[column.id] || []}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTicket ? (
                <div className="opacity-80">
                  <TicketCard ticket={activeTicket} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
}

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DroppableColumn({
  id,
  title,
  color,
  tickets,
}: {
  id: string;
  title: string;
  color: string;
  tickets: TicketWithRelations[];
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-3 ${color}`}>
        <h2 className="font-semibold text-sm">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {tickets.length} items
        </p>
      </div>

      <SortableContext
        id={id}
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[200px]"
          data-testid={`column-${id}`}
        >
          {tickets.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No items</p>
            </div>
          ) : (
            tickets.map((ticket) => <DraggableTicket key={ticket.id} ticket={ticket} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function DraggableTicket({ ticket }: { ticket: TicketWithRelations }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} isDragging={isDragging} />
    </div>
  );
}
