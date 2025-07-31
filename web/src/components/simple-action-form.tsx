import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionCardPreview } from "./action-card-preview";
import { AlbionItemSelector } from "./albion-item-selector";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { AlbionItem, getAlbionItemImageUrl } from "@/lib/albion-utils";

interface SimpleActionFormProps {
  onActionCreated?: () => void;
  onCancel?: () => void;
}

export function SimpleActionForm({ onActionCreated, onCancel }: SimpleActionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bitCost: 100,
    timer: 30,
  });

  const [selectedAlbionItem, setSelectedAlbionItem] = useState<AlbionItem | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<number>(1);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomImage(result);
      setCustomImageFile(file);
      // Clear Albion item selection when custom image is uploaded
      setSelectedAlbionItem(null);
    };
    reader.readAsDataURL(file);
  };

  const removeCustomImage = () => {
    setCustomImage(null);
    setCustomImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Action name is required");
      return;
    }

    if (!customImage && !selectedAlbionItem) {
      toast.error("Please select an image or Albion item");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      
      // If custom image is provided, upload it first
      if (customImageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', customImageFile);
        
        const uploadResponse = await api.post('/upload/image', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        imageUrl = uploadResponse.data.url;
      }

      const actionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: "simple-action",
        config: {
          emoji: "⚡",
          bitCost: formData.bitCost,
          timer: formData.timer,
          customImage: customImage ? {
            url: imageUrl || customImage,
            filename: customImageFile?.name || "custom-image",
          } : null,
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
        bitCost: 100,
        timer: 30,
      });
      setSelectedAlbionItem(null);
      setSelectedQuality(1);
      removeCustomImage();

      onActionCreated?.();
    } catch (error: unknown) {
      console.error("Error creating action:", error);
      toast.error((error as any)?.response?.data?.error || "Failed to create action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayImage = () => {
    if (customImage) return customImage;
    if (selectedAlbionItem) {
      return getAlbionItemImageUrl(selectedAlbionItem.UniqueName, selectedQuality);
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Simple Action</CardTitle>
          <CardDescription>
            Create a stream action with custom image or Albion item
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
                placeholder="My Action"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of what this action does"
                maxLength={100}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <Label>Action Image</Label>
              
              {/* Custom Image Upload */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Custom Image</div>
                <div className="flex items-center gap-4">
                  {customImage ? (
                    <div className="relative">
                      <img 
                        src={customImage} 
                        alt="Custom" 
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeCustomImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!selectedAlbionItem}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <div className="text-xs text-muted-foreground mt-1">
                      Max 5MB. PNG, JPG, GIF supported.
                    </div>
                  </div>
                </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-muted-foreground/25"></div>
                <div className="px-3 text-sm text-muted-foreground">OR</div>
                <div className="flex-1 border-t border-muted-foreground/25"></div>
              </div>

              {/* Albion Item Selector */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Albion Online Item</div>
                <AlbionItemSelector
                  selectedItem={selectedAlbionItem}
                  onItemSelect={(item) => {
                    setSelectedAlbionItem(item);
                    setSelectedQuality(1);
                    // Clear custom image when selecting Albion item
                    removeCustomImage();
                  }}
                  placeholder="Search for an Albion item..."
                  disabled={!!customImage}
                />

                {selectedAlbionItem && (
                  <div className="space-y-2">
                    <Label htmlFor="item-quality">Item Quality</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((quality) => (
                        <Button
                          key={quality}
                          type="button"
                          variant={selectedQuality === quality ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedQuality(quality)}
                          className="flex-1"
                        >
                          {quality === 1 && "Normal"}
                          {quality === 2 && "Good"}
                          {quality === 3 && "Outstanding"}
                          {quality === 4 && "Excellent"}
                          {quality === 5 && "Masterpiece"}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
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
                <Label htmlFor="timer">Timer (seconds)</Label>
                <Input
                  id="timer"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.timer}
                  onChange={(e) => setFormData(prev => ({ ...prev, timer: parseInt(e.target.value) || 0 }))}
                />
                <div className="text-xs text-muted-foreground">
                  Cooldown before action can be triggered again
                </div>
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
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How your action will appear to viewers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 min-w-[200px]">
                  <div className="text-center space-y-3">
                    {/* Image Display */}
                    <div className="flex justify-center">
                      {getDisplayImage() ? (
                        <img 
                          src={getDisplayImage()!} 
                          alt={formData.name || "Action"} 
                          className="w-16 h-16 object-cover rounded-md border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-2xl">⚡</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Name */}
                    <h3 className="font-semibold text-sm">
                      {formData.name || "Action Name"}
                    </h3>
                    
                    {/* Description */}
                    {formData.description && (
                      <p className="text-xs text-gray-600">
                        {formData.description}
                      </p>
                    )}
                    
                    {/* Bit Cost */}
                    <div className="flex items-center justify-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <span className="font-medium">{formData.bitCost}</span>
                      <span>bits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Action Details:</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>Simple Action</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooldown:</span>
                  <span>{formData.timer} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span>{formData.bitCost} bits</span>
                </div>
                <div className="flex justify-between">
                  <span>Image:</span>
                  <span>
                    {customImage ? "Custom Image" : 
                     selectedAlbionItem ? `${selectedAlbionItem.LocalizedNames["EN-US"]} (Q${selectedQuality})` : 
                     "No image selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}