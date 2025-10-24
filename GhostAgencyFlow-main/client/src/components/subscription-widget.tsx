import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pause, Play } from "lucide-react";
import type { Subscription } from "@shared/schema";

interface SubscriptionWidgetProps {
  subscription: Subscription;
  onPause: () => void;
  onResume: () => void;
}

export function SubscriptionWidget({
  subscription,
  onPause,
  onResume,
}: SubscriptionWidgetProps) {
  const percentageUsed = (subscription.daysUsed / subscription.totalDays) * 100;
  const isLowCredits = subscription.daysRemaining <= 5;

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Subscription Credits
        </CardTitle>
        <Badge
          variant={
            subscription.status === "active"
              ? "default"
              : subscription.status === "paused"
              ? "secondary"
              : "outline"
          }
          className="capitalize"
          data-testid="badge-subscription-status"
        >
          {subscription.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Days Used</span>
            <span className="font-mono font-semibold">
              {subscription.daysUsed} / {subscription.totalDays}
            </span>
          </div>
          <Progress value={percentageUsed} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Days Remaining</p>
            <p
              className={`text-2xl font-bold font-mono ${
                isLowCredits ? "text-chart-3" : "text-chart-2"
              }`}
              data-testid="text-days-remaining"
            >
              {subscription.daysRemaining}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Days</p>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-days">
              {subscription.totalDays}
            </p>
          </div>
        </div>

        {isLowCredits && subscription.status === "active" && (
          <div className="rounded-md bg-chart-3/10 px-3 py-2 text-sm text-chart-3">
            Low credits! Only {subscription.daysRemaining} days remaining.
          </div>
        )}

        {subscription.status === "active" ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={onPause}
            data-testid="button-pause-subscription"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause Subscription
          </Button>
        ) : subscription.status === "paused" ? (
          <Button
            className="w-full"
            onClick={onResume}
            data-testid="button-resume-subscription"
          >
            <Play className="mr-2 h-4 w-4" />
            Resume Subscription
          </Button>
        ) : null}

        {subscription.pausedAt && subscription.status === "paused" && (
          <p className="text-xs text-muted-foreground text-center">
            Paused on {new Date(subscription.pausedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
