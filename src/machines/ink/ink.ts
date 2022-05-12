import { Story } from "inkjs/engine/Story";
import { EffectParser } from "./effect-parser";
import {
  StoryMachine,
  Choice,
  Effect,
  StoryMachineStatus,
  Input,
  Output,
} from "../base/story-machine";
import { ElementTree } from "../base/story-machine";

type InkChoice = Story["currentChoices"][0];

function transformInkChoice(choice: InkChoice, id: Choice["id"]): Choice {
  return {
    id,
    text: choice.text,
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

export class Ink extends StoryMachine {
  private story: Story;

  constructor(tree: ElementTree) {
    super(tree);

    const { filename } = tree.attributes;

    const inkJson = "{}"; // TODO: Figure out how to retrieve the file in question, probably with fs sync methods (which basically means Ink is only supported out of browser...)

    this.story = new Story(inkJson);
  }

  getChildren() {
    return [];
  }

  getChildState(externalState: any) {
    return externalState;
  }

  private setExternalState(externalState: any) {
    for (const [key, value] of Object.entries(externalState)) {
      this.story.variablesState.$(key, value);
    }
  }

  private continueStory(): Output {
    if (this.story.canContinue) {
      const text = [this.story.Continue() ?? ""];
      const choices = this.story.currentChoices.map(transformInkChoice);

      const effects = getEffectsFromInkTags(this.story.currentTags);

      return { status: "Active" as const, text, choices, effects };
    }

    return { status: "Done" as const, text: [], choices: [], effects: [] };
  }

  produceOutput(
    externalState: any,
    _: Output[],
    input?: Input | undefined
  ): Output {
    this.setExternalState(externalState);
    if (input) {
      this.story.ChooseChoiceIndex(input.id as any);
    }
    return this.continueStory();
  }

  // internalState = null; // This class is simply a container for the Inkjs engine and delegates state tracking to the engine itself
  // initialized = false;
  // private story: Story;

  // constructor(inkJson: object) {
  //   this.story = new Story(inkJson);
  // }

  // start(externalState: any) {
  //   this.initialized = true;
  //   this.setExternalState(externalState);

  //   const output = this.getCurrentOutput();

  //   // Ink initializes the story without actually starting it, so we need to move to the first passage
  //   if (output.passages.length === 0) {
  //     return this.next(externalState);
  //   }

  //   return output;
  // }

  // next(externalState: any, input?: Choice) {
  //   this.setExternalState(externalState);
  //   if (input) {
  //     this.story.ChooseChoiceIndex(input.key as any);
  //   }
  //   return this.continueStory();
  // }

  // setExternalState(externalState: any) {
  //   for (const [key, value] of Object.entries(externalState)) {
  //     this.story.variablesState.$(key, value);
  //   }
  // }

  // continueStory() {
  //   if (this.story.canContinue) {
  //     const passages = [this.story.Continue() ?? ""];
  //     const choices = this.story.currentChoices.map(transformInkChoice);

  //     const effects = getEffectsFromInkTags(this.story.currentTags);

  //     return { status: "Active" as const, passages, choices, effects };
  //   }

  //   return { status: "Done" as const, passages: [], choices: [], effects: [] };
  // }

  // getCurrentOutput() {
  //   const status: StoryMachineStatus = this.getCurrentStatus();
  //   return {
  //     status,
  //     passages: this.story.currentText ? [this.story.currentText] : [],
  //     choices: this.story.currentChoices.map(transformInkChoice),
  //     effects: getEffectsFromInkTags(this.story.currentTags),
  //   };
  // }

  // getCurrentStatus() {
  //   if (!this.initialized) {
  //     return "Uninitialized";
  //   }
  //   if (this.story.canContinue) {
  //     return "Active";
  //   }
  //   return "Done";
  // }

  // save(): string {
  //   return this.story.state.ToJson();
  // }

  // load(jsonState: string) {
  //   this.story.state.LoadJson(jsonState);
  // }
}
