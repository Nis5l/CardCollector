export interface CollectorConfig {
  name: {
    minLength: number,
    maxLength: number
  },
  description: {
    minLength: number,
    maxLength: number
  },
  moderatorLimit: number
};
