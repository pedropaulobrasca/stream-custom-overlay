import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ActionType, CreateActionRequest } from "@/types/action";
import { getActionTypeLabel } from "@/data/mock-actions";
import { Volume2, Layers, MessageCircle, Monitor, PlayCircle, Webhook } from "lucide-react";
import { ActionConfigForm } from "./action-config-form";

const getActionIcon = (type: ActionType) => {
  switch (type) {
  case ActionType.SOUND:
    return Volume2;
  case ActionType.OVERLAY:
    return Layers;
  case ActionType.CHAT:
    return MessageCircle;
  case ActionType.SCENE:
    return Monitor;
  case ActionType.MEDIA:
    return PlayCircle;
  case ActionType.WEBHOOK:
    return Webhook;
  default:
    return Volume2;
  }
};

const createActionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
  type: z.nativeEnum(ActionType),
  image: z.string().min(1, "Image is required"),
  enabled: z.boolean().default(true),
  config: z.object({}).passthrough(),
});

type FormData = z.infer<typeof createActionSchema>;

interface CreateActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActionRequest) => Promise<void>;
}

export function CreateActionModal({ open, onOpenChange, onSubmit }: CreateActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      name: "",
      description: "",
      type: ActionType.SOUND,
      image: "",
      enabled: true,
      config: {},
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as CreateActionRequest);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: ActionType) => {
    form.setValue("type", type);
    form.setValue("config", {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Action</DialogTitle>
          <DialogDescription>
            Set up a new action for your stream overlay. Configure the action type and its specific settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter action name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ActionType).map((type) => {
                          const IconComponent = getActionIcon(type);
                          return (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {getActionTypeLabel(type)}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this action does"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this action will do when triggered.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input placeholder="Action image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL or path to the action image (e.g., /images/actions/sound.png)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <FormDescription>
                        Whether this action is active and can be triggered
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <ActionConfigForm
              type={selectedType}
              value={form.getValues("config")}
              onChange={(config) => form.setValue("config", config)}
              errors={form.formState.errors.config}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Action"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
