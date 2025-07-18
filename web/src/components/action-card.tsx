import { Edit2, Trash2, Clock, Coins } from "lucide-react";
import { Action } from "@/types/action";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActionCardProps {
  action: Action;
  onEdit: (action: Action) => void;
  onDelete: (id: string) => void;
}

export function ActionCard({ action, onEdit, onDelete }: ActionCardProps) {
  const handleDelete = () => {
    onDelete(action.id);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{action.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          </div>
          <Badge variant={action.isActive ? "default" : "secondary"}>
            {action.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {action.icon && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img
              src={action.icon}
              alt={action.name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4" />
            <span>{action.cost} bits</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{action.duration} min</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(action)}
          className="flex-1"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the action "{action.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
