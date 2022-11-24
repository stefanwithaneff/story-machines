import {
  Context,
  Effect,
  StoryMachine,
  StoryMachineAttributes,
  ProcessorMachine,
  Sequence,
  Scoped,
  Fallback,
  createConditionalMachine,
  createStoryMachine,
  SetContextInternal,
  addEffectToOutput,
  StaticImplements,
  StoryMachineClass,
  StoryMachineRuntime,
  ElementTree,
  Expression,
  recursivelyCalculateExpressions,
  SaveData,
} from "@story-machines/core";
import { addChoiceToOutput } from "@story-machines/choices";
import { addPassageToOutput } from "@story-machines/passages";
import * as Ink from "inkjs";
import { Story } from "inkjs/engine/Story";
import { EffectParser } from "../utils/effect-parser";
import { InkExternalFunction, INK_STORY } from "./constants";

function parseEffectFromInkTag(tag: string): Effect | null {
  const result = EffectParser.parse(tag);

  // TODO: Better error handling here
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

interface InkMachineAttributes extends StoryMachineAttributes {
  storyText: string;
  inkState: Record<string, any>;
  inkExternalFuncs: Expression[];
  inkPreprocessors: StoryMachine[];
  inkPostprocessors: StoryMachine[];
}

@StaticImplements<StoryMachineClass>()
export class InkMachine extends ProcessorMachine<InkMachineAttributes> {
  private initialized: boolean = false;
  private story: Story;

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);

    const storyText = data.text ?? "";
    const inkState = data.inkState ?? {};
    const inkExternalFuncs = data.inkExternalFuncs ?? [];
    const inkPreprocessors = data.inkPreprocessors ?? [];
    const inkPostprocessors = data.inkPostprocessors ?? [];

    return new InkMachine({
      ...tree.attributes,
      storyText,
      inkState,
      inkExternalFuncs,
      inkPreprocessors,
      inkPostprocessors,
    });
  }

  constructor(attrs: InkMachineAttributes) {
    super(attrs);
    this.story = new Ink.Compiler(this.attrs.storyText ?? "").Compile();
  }

  init() {
    super.init();
    this.initialized = false;
    this.story = new Ink.Compiler(this.attrs.storyText ?? "").Compile();
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      json: this.story.state.toJson(),
    };
  }

  load(saveData: SaveData) {
    const json = saveData[this.id]?.json;
    if (json) {
      this.story.state.LoadJson(json);
    }
  }

  private createStoryInitializerProcessor() {
    return new Fallback({
      children: [
        createConditionalMachine(() => this.initialized),
        new Sequence({
          children: [
            createStoryMachine((context) => {
              const externalFuncs: InkExternalFunction[] =
                recursivelyCalculateExpressions(
                  context,
                  this.attrs.inkExternalFuncs
                );

              for (const { fn, name, isGeneral } of externalFuncs) {
                if (isGeneral) {
                  this.story.BindExternalFunctionGeneral(name, fn, false);
                } else {
                  this.story.BindExternalFunction(name, fn, false);
                }
              }
              this.initialized = true;
              return { status: "Completed" };
            }),
          ],
        }),
      ],
    });
  }

  buildOutput(context: Context): void {
    if (!this.story) {
      return;
    }
    const { currentText, currentChoices, currentTags } = this.story;

    if (currentText) {
      addPassageToOutput(context, { text: currentText, metadata: {} });
    }

    for (let i = 0; i < currentChoices.length; i++) {
      addChoiceToOutput(context, {
        id: `${this.id}#${i}`,
        text: currentChoices[i].text,
        metadata: {},
      });
    }

    const effects = getEffectsFromInkTags(currentTags);
    for (const effect of effects) {
      addEffectToOutput(context, effect);
    }
  }

  private createRunStoryProcessor() {
    return new Sequence({
      children: [
        new SetContextInternal({ key: INK_STORY, valFn: () => this.story }),
        ...this.attrs.inkPreprocessors,
        createStoryMachine((context) => {
          const { input } = context;

          // Sync with external state
          const externalState = recursivelyCalculateExpressions(
            context,
            this.attrs.inkState
          );

          for (const [key, val] of Object.entries(externalState)) {
            this.story.state.variablesState.$(key, val);
          }

          // Advance story with given input
          if (
            input &&
            input.type === "Choice" &&
            input.payload.id.startsWith(this.id)
          ) {
            const [_, choiceId] = input.payload.id.split("#");
            this.story?.ChooseChoiceIndex(Number(choiceId));
          }

          // Get story output
          if (this.story?.canContinue) {
            this.story.Continue();
            this.buildOutput(context);
            return { status: "Running" };
          }

          return { status: "Completed" };
        }),
        ...this.attrs.inkPostprocessors,
      ],
    });
  }

  protected createProcessor(): StoryMachine<StoryMachineAttributes> {
    return new Scoped({
      child: new Sequence({
        children: [
          this.createStoryInitializerProcessor(),
          this.createRunStoryProcessor(),
        ],
      }),
    });
  }
}
