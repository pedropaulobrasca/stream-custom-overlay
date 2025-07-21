import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, Zap, Power, PowerOff } from "lucide-react";
import { Action, CreateActionRequest } from "@/types/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CreateActionModal } from "@/components/actions/create-action-modal";
import { useActionsStore } from "@/stores/actions-store";
import { getActionTypeLabel } from "@/data/mock-actions";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { toast } from "sonner";

function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    actions,
    error,
    fetchActions,
    createAction,
    deleteAction,
    toggleAction,
    clearError,
  } = useActionsStore();

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEdit = (action: Action) => {
    console.log("Edit action:", action);
    // TODO: Implement edit modal
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id);
      toast.success("Action deleted successfully");
    } catch {
      toast.error("Failed to delete action");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleAction(id);
      toast.success("Action status updated");
    } catch {
      toast.error("Failed to update action status");
    }
  };

  const handleCreateAction = async (data: CreateActionRequest) => {
    try {
      await createAction(data);
      toast.success("Action created successfully");
    } catch (error) {
      toast.error("Failed to create action");
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stream Actions</h1>
          <p className="text-muted-foreground">
            Manage actions that viewers can activate with bits
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Action
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            {searchTerm ? "No actions found" : "No actions created yet"}
          </div>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create first action
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    {action.image ? (
                      <img
                        src={action.image}
                        alt={action.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded bg-muted">
                        <Zap className="h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{action.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {action.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getActionTypeLabel(action.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={action.enabled ? "default" : "secondary"}>
                      {action.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggle(action.id)}>
                          {action.enabled ? (
                            <PowerOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Power className="mr-2 h-4 w-4" />
                          )}
                          {action.enabled ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(action)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e: Event) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
                              <AlertDialogAction
                                onClick={() => handleDelete(action.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateActionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateAction}
      />
      </div>
    </ProtectedRoute>
  );
}

export default ActionsPage;
