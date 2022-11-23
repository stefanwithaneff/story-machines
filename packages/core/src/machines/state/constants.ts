import { EffectHandlerFn } from "../../types";

export const INCOMING_EFFECT_PAYLOAD = "INCOMING_EFFECT_PAYLOAD";
export const RETURNED_EFFECTS = "RETURNED_EFFECTS";
export const STATE = "__STATE__";

export interface HandlerEntry {
  type: string;
  handler: EffectHandlerFn;
}
