import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useOverlays } from "@/hooks/useOverlays";
import { useAuth } from "@/contexts/AuthContext";

export default function OverlaysPage(): React.ReactElement {
  const { user } = useAuth();
  const { overlays, loading, error } = useOverlays();

  const copyToClipboard = (overlayId: string): void => {
    const url = `${window.location.origin}/overlay/${user?.userId}/${overlayId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleEdit = (): void => {
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = (): void => {
    toast.info("Delete functionality coming soon");
  };

  const openOverlay = (overlayId: string): void => {
    const url = `${window.location.origin}/overlay/${user?.userId}/${overlayId}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading overlays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading overlays: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Albion Online Overlays</h1>
          <p className="text-muted-foreground">
            Manage your Albion Online stream overlays for OBS and streaming platforms
          </p>
        </div>
        <Button>
          Create Overlay
        </Button>
      </div>

      {overlays.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No overlays available yet.</p>
          <p className="text-sm text-muted-foreground">
            Create your first Albion Online action to automatically generate your overlay.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overlays.map((overlay) => {
                const overlayUrl = `${window.location.origin}/overlay/${user?.userId}/${overlay.id}`;
                const formattedDate = new Date(overlay.createdAt).toLocaleDateString();

                return (
                  <TableRow key={overlay.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        Albion Online
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={overlay.isActive ? "default" : "secondary"}
                      >
                        {overlay.isActive ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded truncate max-w-xs">
                          {overlayUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(overlay.id)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openOverlay(overlay.id)}
                          className="h-8 w-8"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(overlay)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(overlay)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
