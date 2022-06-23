import { Effect } from "@story-machines/core";

export const PRESENT_CHOICE = "@Choice/present_choice";

interface PresentChoicePayload {
  choiceId: string;
}

export type PresentChoiceEffect = Effect<PresentChoicePayload>;

export function createPresentChoiceEffect(
  payload: PresentChoicePayload
): PresentChoiceEffect {
  return {
    type: PRESENT_CHOICE,
    payload,
  };
}

export function isPresentChoiceEffect(
  effect: Effect
): effect is PresentChoiceEffect {
  return effect.type === PRESENT_CHOICE;
}
