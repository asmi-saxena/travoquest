export interface Preference {
  id: string;
  userId: string;
  questId: string;
  preferredTimeframe?: {
    startDate: Date;
    endDate: Date;
  };
  preferredPlace?: string;
  preferredTheme?: 'beach' | 'mountains' | 'city' | 'countryside' | 'cultural';
  additionalNotes?: string;
} 