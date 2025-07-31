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
import { SimpleActionForm } from "@/components/simple-action-form";
import { useActions } from "@/hooks/useActions";
import { api } from "@/lib/api";
import { toast } from "sonner";

function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSimpleForm, setShowSimpleForm] = useState(false);

  const { actions, loading, error, refreshActions } = useActions();

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (action.description && action.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleEdit = (action: { id: string; name: string }) => {
    console.log("Edit action:", action);
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/actions/${id}`);
      toast.success("Action deleted successfully");
      refreshActions();
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.error || "Failed to delete action");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/actions/${id}/toggle`);
      toast.success("Action status updated");
      refreshActions();
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.error || "Failed to update action status");
    }
  };

  const handleActionCreated = () => {
    setShowCreateForm(false);
    setShowSimpleForm(false);
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

  if (showSimpleForm) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <SimpleActionForm
          onActionCreated={handleActionCreated}
          onCancel={() => setShowSimpleForm(false)}
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
            Manage stream actions that viewers can activate with Twitch bits
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSimpleForm(true)} variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Simple Action
          </Button>
          <Button onClick={() => setShowCreateForm(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Advanced Action
          </Button>
        </div>
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
            <div className="flex gap-2">
              <Button onClick={() => setShowSimpleForm(true)} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Simple Action
              </Button>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Advanced Action
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-40">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20 text-center">Bits</TableHead>
                <TableHead className="w-24 text-center">Duration</TableHead>
                <TableHead className="w-20 text-center">Status</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-muted overflow-hidden">
                      {action.config?.customImage ? (
                        <img
                          src={action.config.customImage.url}
                          alt={action.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                            const sibling = target.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = "flex";
                          }}
                        />
                      ) : action.config?.albionItem ? (
                        <img
                          src={action.config.albionItem.imageUrl}
                          alt={action.config.albionItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                            const sibling = target.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div className={`text-lg flex items-center justify-center w-full h-full ${(action.config?.customImage || action.config?.albionItem) ? "hidden" : "flex"}`}>
                        {action.config?.emoji || "⚡"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{action.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {action.type === "disable_skill" && (
                        <>
                          <Badge variant="destructive" className="text-xs">
                            🚫 Block Key
                          </Badge>
                          {action.config?.skillKey && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {action.config.skillKey.toUpperCase()}
                            </Badge>
                          )}
                        </>
                      )}
                      {action.type === "press_key" && (
                        <>
                          <Badge variant="default" className="text-xs">
                            ⚡ Press Key
                          </Badge>
                          {action.config?.skillKey && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {action.config.skillKey.toUpperCase()}
                            </Badge>
                          )}
                        </>
                      )}
                      {action.type === "stream-action" && (
                        <Badge variant="secondary" className="text-xs">
                          ⚡ General
                        </Badge>
                      )}
                      {action.type === "simple-action" && (
                        <Badge variant="default" className="text-xs">
                          ⚡ Simple
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {action.description || "No description"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {action.config?.bitCost || 100}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {(action.type === "disable_skill" || action.type === "press_key") && action.config?.duration ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">{action.config.duration}s</span>
                        <span className="text-xs text-muted-foreground">
                          {action.type === "press_key" ? "cooldown" : "duration"}
                        </span>
                      </div>
                    ) : action.type === "stream-action" && action.config?.duration ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">{action.config.duration}m</span>
                        <span className="text-xs text-muted-foreground">duration</span>
                      </div>
                    ) : action.type === "simple-action" && action.config?.timer ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">{action.config.timer}s</span>
                        <span className="text-xs text-muted-foreground">cooldown</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={action.isActive ? "default" : "secondary"} className="text-xs">
                      {action.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
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
                    </div>
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
