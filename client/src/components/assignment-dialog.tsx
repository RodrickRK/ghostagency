import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { TicketWithRelations, User } from "@shared/schema";

interface AssignmentDialogProps {
  ticket: TicketWithRelations;
  employees: User[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assigneeId: string) => void;
}

export function AssignmentDialog({
  ticket,
  employees,
  isOpen,
  onClose,
  onAssign,
}: AssignmentDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    ticket.assigneeId || ""
  );

  const handleAssign = () => {
    if (selectedEmployee) {
      onAssign(selectedEmployee);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-assignment">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>{ticket.title}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover-elevate"
                >
                  <RadioGroupItem
                    value={employee.id}
                    id={employee.id}
                    data-testid={`radio-employee-${employee.id}`}
                  />
                  <Label
                    htmlFor={employee.id}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-assign">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedEmployee}
            data-testid="button-confirm-assign"
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
