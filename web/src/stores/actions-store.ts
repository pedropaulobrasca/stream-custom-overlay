import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Action, CreateActionRequest, UpdateActionRequest } from "@/types/action";
import { mockActions } from "@/data/mock-actions";

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

const delay = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

export const useActionsStore = create<ActionsState>()(
  devtools(
    (set, get) => ({
      actions: [],
      isLoading: false,
      error: null,

      fetchActions: async () => {
        set({ isLoading: true, error: null });
        try {
          await delay(500);
          set({ actions: mockActions, isLoading: false });
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
          await delay(800);

          const newAction: Action = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
          await delay(500);

          set(state => ({
            actions: state.actions.map(action =>
              action.id === data.id
                ? { ...action, ...data, updatedAt: new Date().toISOString() }
                : action,
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
          await delay(300);

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
          await delay(300);

          set(state => ({
            actions: state.actions.map(action =>
              action.id === id
                ? { ...action, enabled: !action.enabled, updatedAt: new Date().toISOString() }
                : action,
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
