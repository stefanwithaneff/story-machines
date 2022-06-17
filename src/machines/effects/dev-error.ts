import { Effect } from "../../types";

export const DEV_ERROR = "@DEV/error";

export interface DevErrorPayload {
  message: string;
}

export type DevErrorEffect = Effect<DevErrorPayload>;

export function createDevErrorEffect(payload: DevErrorPayload): DevErrorEffect {
  return {
    type: DEV_ERROR,
    payload,
  };
}

export function isDevErrorEffect(effect: Effect): effect is DevErrorEffect {
  return effect.type === DEV_ERROR;
}
