import { useState } from "react";
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

interface Overlay {
  id: string;
  game: string;
  status: "active" | "inactive";
  url: string;
  userId: string;
  createdAt: string;
}

export default function OverlaysPage() {
  // Simulated user ID - in a real app this would come from authentication
  const userId = "user_123abc";
  
  const [overlays] = useState<Overlay[]>([
    {
      id: "1",
      game: "Albion Online",
      status: "active",
      url: `${window.location.origin}/overlay/${userId}/albion`,
      userId: userId,
      createdAt: "2024-01-15",
    },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard");
  };

  const handleEdit = (overlay: Overlay) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = (overlay: Overlay) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  const openOverlay = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Overlays</h1>
          <p className="text-muted-foreground">
            Manage your stream overlays for different games
          </p>
        </div>
        <Button>
          Create Overlay
        </Button>
      </div>

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
            {overlays.map((overlay) => (
              <TableRow key={overlay.id}>
                <TableCell className="font-medium">{overlay.game}</TableCell>
                <TableCell>
                  <Badge 
                    variant={overlay.status === "active" ? "default" : "secondary"}
                  >
                    {overlay.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded truncate w-full">
                      {overlay.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(overlay.url)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openOverlay(overlay.url)}
                      className="h-8 w-8"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{overlay.createdAt}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}