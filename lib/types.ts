export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface AIRescriptResult {
  optimizedTitle: string;
  optimizedDescription: string;
  optimizedTags: string[];
  hookScript: string;
  structureNotes: string[];
  seoImprovements: string[];
}

export interface AIHookEnhancement {
  enhancedHook: string;
  curiosityScore: number;
  emotionalScore: number;
  patternInterruptScore: number;
  reasoning: string;
}
