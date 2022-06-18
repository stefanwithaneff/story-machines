import { Story } from "inkjs/engine/Story";
import {
  Context,
  Effect,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  ProcessorMachine,
  Sequence,
  Scoped,
  Fallback,
  createConditionalMachine,
  createStoryMachine,
  getFromContext,
  isOfType,
  SetContextInternal,
  addEffectToOutput,
} from "@story-machines/core";
import { addChoiceToOutput } from "@story-machines/choices";
import { addPassageToOutput } from "@story-machines/passages";
import { EffectParser } from "../utils/effect-parser";
import {
  InkExternalFunction,
  INK_EXTERNAL_FUNCS,
  INK_INITIALIZER,
  INK_POSTPROCESSER,
  INK_PREPROCESSER,
  INK_STORY,
} from "./constants";

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

interface InkMachineAttributes extends StoryMachineAttributes {
  initializers: StoryMachine[];
  preprocessors: StoryMachine[];
  postprocessors: StoryMachine[];
}

export class InkMachine extends ProcessorMachine<InkMachineAttributes> {
  private story: Story | undefined;
  private initialized: boolean = false;

  init() {
    super.init();
    this.initialized = false;
    this.story = undefined;
  }

  private createStoryInitializerProcessor() {
    return new Fallback({
      children: [
        createConditionalMachine(() => this.initialized),
        new Sequence({
          children: [
            ...this.attrs.initializers,
            createStoryMachine((context) => {
              const story: Story = getFromContext(context, INK_STORY);

              this.story = story;

              const externalFuncs: InkExternalFunction[] =
                getFromContext(context, INK_EXTERNAL_FUNCS) ?? [];

              for (const { fn, name, isGeneral } of externalFuncs) {
                if (isGeneral) {
                  story.BindExternalFunctionGeneral(name, fn, false);
                } else {
                  story.BindExternalFunction(name, fn, false);
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
        ...this.attrs.preprocessors,
        createStoryMachine((context) => {
          const { input } = context;

          if (
            input &&
            input.type === "Choice" &&
            input.payload.id.startsWith(this.id)
          ) {
            const [_, choiceId] = input.payload.id.split("#");
            this.story?.ChooseChoiceIndex(Number(choiceId));
          }

          if (this.story?.canContinue) {
            this.story.Continue();
            this.buildOutput(context);
            return { status: "Running" };
          }

          return { status: "Completed" };
        }),
        ...this.attrs.postprocessors,
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

export const InkCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    const initializers = children.filter((child) =>
      isOfType(child, INK_INITIALIZER)
    );
    const preprocessors = children.filter((child) =>
      isOfType(child, INK_PREPROCESSER)
    );
    const postprocessors = children.filter((child) =>
      isOfType(child, INK_POSTPROCESSER)
    );

    return new InkMachine({
      ...tree.attributes,
      initializers,
      preprocessors,
      postprocessors,
    });
  },
};
