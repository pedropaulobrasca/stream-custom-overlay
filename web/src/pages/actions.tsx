import { useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, Power, PowerOff } from "lucide-react";
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
import { CreateActionForm } from "@/components/create-action-form";
import { useActions } from "@/hooks/useActions";
import { api } from "@/lib/api";
import { toast } from "sonner";

function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { actions, loading, error, refreshActions } = useActions();

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (action.description && action.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleEdit = (action: any) => {
    console.log("Edit action:", action);
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/actions/${id}`);
      toast.success("Action deleted successfully");
      refreshActions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete action");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/actions/${id}/toggle`);
      toast.success("Action status updated");
      refreshActions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update action status");
    }
  };

  const handleActionCreated = () => {
    setShowCreateForm(false);
    refreshActions();
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading actions: {error}</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <CreateActionForm
          onActionCreated={handleActionCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stream Actions</h1>
          <p className="text-muted-foreground">
            Manage actions that viewers can activate with bits on Albion Online
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
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
            <Button onClick={() => setShowCreateForm(true)} variant="outline">
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
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Bits</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="flex items-center justify-center h-10 w-10 rounded bg-muted">
                      {action.config?.albionItem ? (
                        <img 
                          src={action.config.albionItem.imageUrl}
                          alt={action.config.albionItem.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const sibling = target.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`text-lg flex items-center justify-center w-full h-full ${action.config?.albionItem ? 'hidden' : 'flex'}`}>
                        {action.config?.emoji || "⚡"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{action.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {action.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {action.config?.bitCost || 100} bits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={action.isActive ? "default" : "secondary"}>
                      {action.isActive ? "Active" : "Inactive"}
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
                          {action.isActive ? (
                            <PowerOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Power className="mr-2 h-4 w-4" />
                          )}
                          {action.isActive ? "Deactivate" : "Activate"}
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
    </div>
  );
}

export default ActionsPage;
