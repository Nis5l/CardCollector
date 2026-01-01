export interface CollectorConfig {
  name: {
    min: number,
    max: number
  },
  description: {
    min: number,
    max: number
  },
  moderatorLimit: number,
  packCooldown: {
    min: number,
    max: number
  },
  packAmount: {
    min: number,
    max: number
  },
  packQualityMin: {
    min: number,
    max: number
  },
  packQualityMax: {
    min: number,
    max: number
  },
};
