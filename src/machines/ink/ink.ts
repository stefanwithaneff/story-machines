import { Story } from "inkjs/engine/Story";
import { EffectParser } from "./effect-parser";
import {
  ChoiceBasedStoryMachine,
  Choice,
  Effect,
  StoryMachineStatus,
} from "../types";

type InkChoice = Story["currentChoices"][0];

function transformInkChoice(choice: InkChoice, key: Choice["key"]): Choice {
  return {
    key,
    description: choice.text,
    metadata: {},
  };
}

function parseEffectFromInkTag(tag: string): Effect | null {
  const result = EffectParser.parse(tag);

  if (result.status === false) {
    return null;
  }

  return result.value;
}

function getEffectsFromInkTags(tags: Story["currentTags"]): Effect[] {
  const effects: Effect[] = [];

  if (tags === null) {
    return effects;
  }

  for (const tag of tags) {
    const effect = parseEffectFromInkTag(tag);

    if (effect !== null) {
      effects.push(effect);
    }
  }

  return effects;
}

export class InkMachine implements ChoiceBasedStoryMachine {
  internalState = null; // This class is simply a container for the Inkjs engine and delegates state tracking to the engine itself
  initialized = false;
  private story: Story;

  constructor(inkJson: object) {
    this.story = new Story(inkJson);
  }

  start(externalState: any) {
    this.initialized = true;
    this.setExternalState(externalState);

    const output = this.getCurrentOutput();

    // Ink initializes the story without actually starting it, so we need to move to the first passage
    if (output.passages.length === 0) {
      return this.next(externalState);
    }

    return output;
  }

  next(externalState: any, input?: Choice) {
    this.setExternalState(externalState);
    if (input) {
      this.story.ChooseChoiceIndex(input.key as any);
    }
    return this.continueStory();
  }

  setExternalState(externalState: any) {
    for (const [key, value] of Object.entries(externalState)) {
      this.story.variablesState.$(key, value);
    }
  }

  continueStory() {
    if (this.story.canContinue) {
      const passages = [this.story.Continue() ?? ""];
      const choices = this.story.currentChoices.map(transformInkChoice);

      const effects = getEffectsFromInkTags(this.story.currentTags);

      return { status: "Active" as const, passages, choices, effects };
    }

    return { status: "Done" as const, passages: [], choices: [], effects: [] };
  }

  getCurrentOutput() {
    const status: StoryMachineStatus = this.getCurrentStatus();
    return {
      status,
      passages: this.story.currentText ? [this.story.currentText] : [],
      choices: this.story.currentChoices.map(transformInkChoice),
      effects: getEffectsFromInkTags(this.story.currentTags),
    };
  }

  getCurrentStatus() {
    if (!this.initialized) {
      return "Uninitialized";
    }
    if (this.story.canContinue) {
      return "Active";
    }
    return "Done";
  }

  save(): string {
    return this.story.state.ToJson();
  }

  load(jsonState: string) {
    this.story.state.LoadJson(jsonState);
  }
}
