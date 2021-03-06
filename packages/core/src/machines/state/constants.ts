import { EffectHandlerFn } from "../../types";

export const CAN_ALTER_STATE = "CAN_ALTER_STATE";
export const INITIAL_STATE = "INITIAL_STATE";
export const HANDLERS = "HANDLERS";
export const INCOMING_EFFECT_PAYLOAD = "INCOMING_EFFECT_PAYLOAD";
export const RETURNED_EFFECTS = "RETURNED_EFFECTS";
export const STATE = "__STATE__";
export const STATE_BUILDER = Symbol("STATE_BUILDER");

export interface HandlerEntry {
  type: string;
  handler: EffectHandlerFn;
}
