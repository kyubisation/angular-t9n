export interface TranslationTargetUnit {
  id: string;
  source: string;
  target: string;
  state: 'initial' | 'translated' | 'reviewed' | 'final';
  description?: string;
  meaning?: string;
  locations?: string[];
}
