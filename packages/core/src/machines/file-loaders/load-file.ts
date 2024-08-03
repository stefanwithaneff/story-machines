import { Effect } from "../../types";

export const LOAD_FILE = "@Core/load_file";

interface LoadFilePayload {
  src: string;
}

export type MakeChoiceEffect = Effect<LoadFilePayload>;

export function createLoadFileEffect(
  payload: LoadFilePayload
): MakeChoiceEffect {
  return {
    type: LOAD_FILE,
    payload,
  };
}

export function isLoadFileEffect(effect: Effect): effect is MakeChoiceEffect {
  return effect.type === LOAD_FILE;
}
