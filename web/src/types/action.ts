export interface Action {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // em minutos
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActionRequest {
  name: string;
  description: string;
  cost: number;
  duration: number;
  icon?: string;
}

export interface UpdateActionRequest extends Partial<CreateActionRequest> {
  id: string;
}
