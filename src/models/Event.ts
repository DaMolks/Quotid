export interface Event {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  startTime: number; // timestamp
  endTime: number; // timestamp
  location?: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  
  // Propriétés jointes depuis la catégorie
  color?: string;
  emoji?: string;
  notificationType?: string;
}
