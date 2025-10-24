import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionWidget } from "@/components/subscription-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, LayoutGrid, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserWithSubscription, TicketWithRelations } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { TicketCard } from "@/components/ticket-card";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<UserWithSubscription>({
    queryKey: ["/api/user"],
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ["/api/tickets"],
  });

  const pauseMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscriptions/pause", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription paused",
        description: "Your remaining days have been saved for later.",
      });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscriptions/resume", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription resumed",
        description: "Welcome back! Your design work continues.",
      });
    },
  });

  const handleLogout = () => {
    setLocation("/login");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Ghost Agency</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Welcome back, {user?.name}</h2>
            <p className="text-muted-foreground mt-1">
              Manage your design requests and track progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild data-testid="button-view-board">
              <Link href="/board">
                <LayoutGrid className="mr-2 h-4 w-4" />
                View Board
              </Link>
            </Button>
            <Button asChild data-testid="button-new-request">
              <Link href="/request">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            {user?.subscription && (
              <SubscriptionWidget
                subscription={user.subscription}
                onPause={() => pauseMutation.mutate()}
                onResume={() => resumeMutation.mutate()}
              />
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Your latest design requests</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-muted-foreground">No requests yet</p>
                    <Button asChild>
                      <Link href="/request">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first request
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tickets.slice(0, 3).map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
