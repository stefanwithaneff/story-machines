import { Effect } from "../../types";

export const DEV_WARN = "@DEV/warn";

export interface DevWarnPayload {
  message: string;
}

export type DevWarnEffect = Effect<DevWarnPayload>;

export function createDevWarnEffect(payload: DevWarnPayload): DevWarnEffect {
  return {
    type: DEV_WARN,
    payload,
  };
}

export function isDevWarnEffect(effect: Effect): effect is DevWarnEffect {
  return effect.type === DEV_WARN;
}
