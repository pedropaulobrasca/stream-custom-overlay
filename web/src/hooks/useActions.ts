import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface Action {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: any;
  isActive: boolean;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/actions");
      setActions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch actions");
      console.error("Error fetching actions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const refreshActions = () => {
    fetchActions();
  };

  return {
    actions,
    loading,
    error,
    refreshActions,
    hasActions: actions.length > 0,
  };
}
