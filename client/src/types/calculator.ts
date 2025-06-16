export interface CalculationResult {
  [key: string]: number | string;
}

export interface FormData {
  [key: string]: number | string;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  message?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}
