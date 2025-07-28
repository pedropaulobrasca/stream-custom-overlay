import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionCardPreview } from "./action-card-preview";
import { AlbionItemSelector } from "./albion-item-selector";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AlbionItem, getAlbionItemImageUrl } from "@/lib/albion-utils";

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
    type: "stream-action",
    skillKey: "e", // For disable_skill actions
  });

  const [selectedAlbionItem, setSelectedAlbionItem] = useState<AlbionItem | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<number>(1);

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
          skillKey: formData.skillKey, // Include skill key for disable_skill actions
          albionItem: selectedAlbionItem ? {
            uniqueName: selectedAlbionItem.UniqueName,
            name: selectedAlbionItem.LocalizedNames["EN-US"],
            quality: selectedQuality,
            imageUrl: getAlbionItemImageUrl(selectedAlbionItem.UniqueName, selectedQuality),
          } : null,
        },
      };

      await api.post("/actions", actionData);

      toast.success("Action created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        emoji: "⚡",
        bitCost: 100,
        duration: 5,
        type: "stream-action",
        skillKey: "e",
      });
      setSelectedAlbionItem(null);
      setSelectedQuality(1);

      onActionCreated?.();
    } catch (error: any) {
      console.error("Error creating action:", error);
      toast.error(error.response?.data?.error || "Failed to create action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonEmojis = ["⚡", "🎮", "🎯", "🎪", "🎊", "🎁", "🔥", "❄️", "🌟", "💰", "🎵", "🎨", "🎭", "🎲"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Action</CardTitle>
          <CardDescription>
            Configure your action that will appear in the stream overlay
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
                placeholder="Custom Stream Action"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Custom action for stream interaction"
                maxLength={100}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Action Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disable_skill">🚫 Block Skill Key (E/Q/W/R)</SelectItem>
                  <SelectItem value="disable_movement">🚶 Block Movement (W)</SelectItem>
                  <SelectItem value="disable_interaction">🤏 Block Interaction (F)</SelectItem>
                  <SelectItem value="stream-action">⚡ General Stream Action</SelectItem>
                  <SelectItem value="visual-effect">🎨 Visual Effect</SelectItem>
                  <SelectItem value="sound-effect">🔊 Sound Effect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skill Key Selection for disable_skill type */}
            {formData.type === 'disable_skill' && (
              <div className="space-y-2">
                <Label htmlFor="skillKey">Skill Key to Block</Label>
                <Select
                  value={formData.skillKey}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, skillKey: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q">Q - First Skill</SelectItem>
                    <SelectItem value="w">W - Second Skill</SelectItem>
                    <SelectItem value="e">E - Third Skill</SelectItem>
                    <SelectItem value="r">R - Ultimate Skill</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  Choose which skill key will be blocked when this action is executed
                </div>
              </div>
            )}

            <AlbionItemSelector
              selectedItem={selectedAlbionItem}
              onItemSelect={(item) => {
                setSelectedAlbionItem(item);
                setSelectedQuality(1); // Reset quality when changing item
              }}
              placeholder="Select an Albion item for the overlay..."
            />

            {selectedAlbionItem && (
              <div className="space-y-2">
                <Label htmlFor="item-quality">Item Quality</Label>
                <Select
                  value={selectedQuality.toString()}
                  onValueChange={(value) => setSelectedQuality(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Normal</SelectItem>
                    <SelectItem value="2">Good</SelectItem>
                    <SelectItem value="3">Outstanding</SelectItem>
                    <SelectItem value="4">Excellent</SelectItem>
                    <SelectItem value="5">Masterpiece</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  Higher quality items have enhanced visual effects
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Fallback Emoji/Icon</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Used when no Albion item is selected
              </div>
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
                <Label htmlFor="duration">
                  {['disable_skill', 'disable_movement', 'disable_interaction'].includes(formData.type) 
                    ? 'Duration (seconds)' 
                    : 'Duration (minutes)'}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max={['disable_skill', 'disable_movement', 'disable_interaction'].includes(formData.type) ? "30" : "60"}
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
                {['disable_skill', 'disable_movement', 'disable_interaction'].includes(formData.type) && (
                  <div className="text-xs text-muted-foreground">
                    How long the key will be blocked (1-30 seconds)
                  </div>
                )}
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
                  albionItem={selectedAlbionItem ? {
                    uniqueName: selectedAlbionItem.UniqueName,
                    name: selectedAlbionItem.LocalizedNames["EN-US"],
                    quality: selectedQuality,
                    imageUrl: getAlbionItemImageUrl(selectedAlbionItem.UniqueName, selectedQuality),
                  } : undefined}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Action Details:</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{formData.type.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>
                    {formData.duration} {['disable_skill', 'disable_movement', 'disable_interaction'].includes(formData.type) ? 'seconds' : 'minutes'}
                  </span>
                </div>
                {formData.type === 'disable_skill' && (
                  <div className="flex justify-between">
                    <span>Blocks Key:</span>
                    <span className="uppercase font-mono bg-muted px-2 py-1 rounded text-xs">
                      {formData.skillKey}
                    </span>
                  </div>
                )}
                {formData.type === 'disable_movement' && (
                  <div className="flex justify-between">
                    <span>Blocks Key:</span>
                    <span className="uppercase font-mono bg-muted px-2 py-1 rounded text-xs">W</span>
                  </div>
                )}
                {formData.type === 'disable_interaction' && (
                  <div className="flex justify-between">
                    <span>Blocks Key:</span>
                    <span className="uppercase font-mono bg-muted px-2 py-1 rounded text-xs">F</span>
                  </div>
                )}
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
