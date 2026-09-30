export interface SurveyResponse {
  id: string;
  timestamp: string;
  // Question 1: Expectations (multi-select)
  expectations: string[];
  // Question 2: Ranked Expectations (sorted subset of Q1)
  expectationsRanking: string[];
  // Question 3: Target Assets (multi-select + custom)
  assets: string[];
  customAsset?: string;
  // Question 4: Reason for asset selection (free text)
  assetReason: string;
  // Question 5: Investment apps used (multi-select + custom)
  apps: string[];
  customApp?: string;
  // Question 6: Message / Support requested (free text)
  supportMessage: string;
  // Question 7: Alcohol preference (multi-select + custom)
  drinks: string[];
  customDrink?: string;
}
