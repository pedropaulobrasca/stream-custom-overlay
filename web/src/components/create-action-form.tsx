import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ActionCardPreview } from "./action-card-preview";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateActionFormProps {
  onActionCreated?: () => void;
  onCancel?: () => void;
}

export function CreateActionForm({ onActionCreated, onCancel }: CreateActionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "⚡",
    bitCost: 100,
    duration: 5,
    type: "albion-resource-block"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Action name is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const actionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        config: {
          emoji: formData.emoji,
          bitCost: formData.bitCost,
          duration: formData.duration,
          game: "albion-online"
        }
      };

      await api.post('/actions', actionData);
      
      toast.success("Action created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        emoji: "⚡",
        bitCost: 100,
        duration: 5,
        type: "albion-resource-block"
      });
      
      onActionCreated?.();
    } catch (error: any) {
      console.error('Error creating action:', error);
      toast.error(error.response?.data?.error || "Failed to create action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonEmojis = ["⚡", "🪓", "⛏️", "⚒️", "🌾", "🦌", "🏹", "⚔️", "🛡️", "💎", "🔥", "❄️", "🌟", "💰"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Action</CardTitle>
          <CardDescription>
            Configure your action that will appear in the Albion Online overlay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Action Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Block Wood Collection"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Block wood collection for duration"
                maxLength={100}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Emoji/Icon</Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="⚡"
                  className="w-20 text-center text-lg"
                  maxLength={2}
                />
                <span className="text-sm text-muted-foreground">or choose:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant={formData.emoji === emoji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                    className="text-lg p-2 h-10 w-10"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bitCost">Bit Cost</Label>
                <Input
                  id="bitCost"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.bitCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, bitCost: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Action
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Overlay Preview</CardTitle>
          <CardDescription>
            This is how your action will appear in the overlay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex justify-center">
                <ActionCardPreview
                  name={formData.name}
                  description={formData.description}
                  emoji={formData.emoji}
                  bitCost={formData.bitCost}
                />
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Action Details:</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge variant="outline" className="text-xs">Albion Resource Block</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{formData.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span>{formData.bitCost} bits</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}