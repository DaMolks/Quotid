export interface Category {
  id: number;
  name: string;
  color: string;
  emoji?: string;
  notificationType?: string;
  createdAt: number; // timestamp
}
