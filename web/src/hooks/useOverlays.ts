import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface Overlay {
  id: string;
  userId: string;
  name: string;
  description: string;
  game: string;
  config: any;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useOverlays() {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverlays = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/overlays");
      setOverlays(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch overlays");
      console.error("Error fetching overlays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverlays();
  }, []);

  const refreshOverlays = () => {
    fetchOverlays();
  };

  return {
    overlays,
    loading,
    error,
    refreshOverlays,
    hasOverlays: overlays.length > 0,
  };
}
