import { CardState } from "../../../types";

export interface SelectCardDialogConfig {
  collectorId: string,
  title: string,
  cardState: CardState | null
}
