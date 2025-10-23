export interface Plot {
  id: string;
  imageUrl: string;
  message: string;
}

// New interface for multi-plot ads
export interface Ad {
  id: string; // Can be the top-left plot ID
  plots: string[];
  imageUrl: string;
  message: string;
}

export type Theme = 'day' | 'night' | 'rain';