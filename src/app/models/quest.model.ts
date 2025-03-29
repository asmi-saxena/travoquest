import { Preference } from "./preference.model";

export interface Quest {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: string[]; // User IDs
  preferences?: { [userId: string]: Preference };
  selectedTimeframe?: {
    startDate: Date;
    endDate: Date;
  };
  selectedPlace?: string;
  selectedTheme?: string;
  status: 'planning' | 'confirmed' | 'completed';
} 