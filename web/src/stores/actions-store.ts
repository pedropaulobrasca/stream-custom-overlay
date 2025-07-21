import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Action, CreateActionRequest, UpdateActionRequest } from "@/types/action";
import { api } from "@/lib/api";

interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActions: () => Promise<void>;
  createAction: (data: CreateActionRequest) => Promise<void>;
  updateAction: (data: UpdateActionRequest) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  toggleAction: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useActionsStore = create<ActionsState>()(
  devtools(
    (set, get) => ({
      actions: [],
      isLoading: false,
      error: null,

      fetchActions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/actions');
          const actions = response.data.map((action: any) => ({
            ...action,
            enabled: action.isActive,
            image: null, // Backend doesn't support image URLs yet
          }));
          set({ actions, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch actions",
            isLoading: false,
          });
        }
      },

      createAction: async (data: CreateActionRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/actions', data);
          const newAction = {
            ...response.data,
            enabled: response.data.isActive,
            image: null,
          };

          set(state => ({
            actions: [...state.actions, newAction],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create action",
            isLoading: false,
          });
          throw error;
        }
      },

      updateAction: async (data: UpdateActionRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/actions/${data.id}`, data);
          const updatedAction = {
            ...response.data,
            enabled: response.data.isActive,
            image: null,
          };

          set(state => ({
            actions: state.actions.map(action =>
              action.id === data.id ? updatedAction : action,
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update action",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteAction: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/actions/${id}`);

          set(state => ({
            actions: state.actions.filter(action => action.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete action",
            isLoading: false,
          });
          throw error;
        }
      },

      toggleAction: async (id: string) => {
        const action = get().actions.find(a => a.id === id);
        if (!action) return;

        set({ isLoading: true, error: null });
        try {
          const response = await api.patch(`/actions/${id}/toggle`);
          const updatedAction = {
            ...response.data,
            enabled: response.data.isActive,
            image: null,
          };

          set(state => ({
            actions: state.actions.map(action =>
              action.id === id ? updatedAction : action,
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to toggle action",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "actions-store",
    },
  ),
);
