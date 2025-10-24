import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";

import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import ClientDashboard from "@/pages/client-dashboard";
import NewRequest from "@/pages/new-request";
import ClientBoard from "@/pages/client-board";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminTickets from "@/pages/admin-tickets";
import AdminTeam from "@/pages/admin-team";
import EmployeeDashboard from "@/pages/employee-dashboard";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
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
          </header>
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'client';
  avatarUrl: string | null;
}

function Router() {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401
      if (error?.status === 401) {
        // Redirect to login if not already there
        if (location !== '/login' && location !== '/') {
          setLocation('/login');
        }
        return false;
      }
      return failureCount < 3;
    }
  });

  // During initial load, show nothing
  if (isLoading) {
    return null;
  }

  // If there's an error or no user, and we're not on login/root, redirect to login
  if ((error || !user) && location !== '/login' && location !== '/') {
    setLocation('/login');
    return null;
  }

  // Role-based routing
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />

      {/* Client routes */}
      {user?.role === "client" && (
        <>
          <Route path="/dashboard" component={ClientDashboard} />
          <Route path="/request" component={NewRequest} />
          <Route path="/board" component={ClientBoard} />
        </>
      )}

      {/* Admin routes */}
      {user?.role === "admin" && (
        <>
          <Route path="/admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </Route>
          <Route path="/admin/tickets">
            <AdminLayout>
              <AdminTickets />
            </AdminLayout>
          </Route>
          <Route path="/admin/team">
            <AdminLayout>
              <AdminTeam />
            </AdminLayout>
          </Route>
        </>
      )}

      {/* Employee routes */}
      {user?.role === "employee" && (
        <>
          <Route path="/dashboard">
            <AdminLayout>
              <EmployeeDashboard />
            </AdminLayout>
          </Route>
          <Route path="/employee">
            <AdminLayout>
              <EmployeeDashboard />
            </AdminLayout>
          </Route>
          <Route path="/employee/tickets">
            <AdminLayout>
              <EmployeeDashboard />
            </AdminLayout>
          </Route>
        </>
      )}

      {/* Add role-specific root routes */}
      {user?.role === "admin" && (
        <Route path="/">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Route>
      )}
      {user?.role === "employee" && (
        <Route path="/">
          <AdminLayout>
            <EmployeeDashboard />
          </AdminLayout>
        </Route>
      )}
      {user?.role === "client" && (
        <Route path="/" component={ClientDashboard} />
      )}

      {/* Catch-all route - only show if user is authenticated */}
      {user && <Route component={NotFound} />}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
