import { Effect, StoryMachine } from "@story-machines/core";

export const MAKE_CHOICE = "@Choice/make_choice";

interface MakeChoicePayload {
  choiceId: string;
}

export type MakeChoiceEffect = Effect<MakeChoicePayload>;

export function createMakeChoiceEffect(
  payload: MakeChoicePayload
): MakeChoiceEffect {
  return {
    type: MAKE_CHOICE,
    payload,
  };
}

export function isMakeChoiceEffect(effect: Effect): effect is MakeChoiceEffect {
  return effect.type === MAKE_CHOICE;
}
