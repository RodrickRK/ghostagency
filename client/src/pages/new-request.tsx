import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertTicket } from "@shared/schema";

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  
  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertTicket>) => {
      return apiRequest("POST", "/api/tickets", {
        ...data,
        attachmentUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Request submitted",
        description: "Your design request has been received. We'll start working on it soon!",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      priority,
      attachmentUrls,
    });
  };

  const handleUrlAdd = () => {
    const url = prompt("Enter URL for attachment:");
    if (url && isValidUrl(url)) {
      setAttachmentUrls([...attachmentUrls, url]);
    } else if (url) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
    }
  };

  const removeUrl = (index: number) => {
    setAttachmentUrls(attachmentUrls.filter((_, i) => i !== index));
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isSubmitting = createMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">New Request</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Design Request</CardTitle>
            <CardDescription>
              Tell us about your design needs. The more detail you provide, the better we can help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Landing page redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your design requirements, target audience, style preferences, and any specific elements you need..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-center w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-32"
                      onClick={handleUrlAdd}
                      data-testid="button-add-url"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to add</span> an attachment URL
                        </p>
                        <p className="text-xs text-muted-foreground">URLs to images, PDFs, or documents</p>
                      </div>
                    </Button>
                  </div>

                  {attachmentUrls.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachmentUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/50 rounded-md p-2"
                          data-testid={`attachment-${index}`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{url}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUrl(index)}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
