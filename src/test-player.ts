import { StoryMachine } from "./machines/base-classes/story-machine";
import { StoryMachineRuntime } from "./runtime";
import {
  ChoiceInput,
  Context,
  Input,
  Output,
  StoryMachineStatus,
} from "./types";

type TestFn = (output: Output, status: StoryMachineStatus) => boolean;

export class TestPlayer {
  private story: StoryMachine;
  currentOutput: Output | undefined;
  currentStatus: StoryMachineStatus | undefined;
  currentContext: Context | undefined;
  constructor(private readonly runtime: StoryMachineRuntime, story: string) {
    this.story = runtime.compileXML(story);
  }

  private generateEmptyContext(input?: Input): Context {
    return {
      output: {
        passages: [],
        choices: [],
        effects: [],
      },
      originalInput: input,
      input,
    };
  }

  tick(input?: Input): TestPlayer {
    const context = this.generateEmptyContext(input);

    const result = this.story.process(context);
    this.currentStatus = result.status;
    this.currentOutput = context.output;
    this.currentContext = context;
    return this;
  }

  chooseNthChoice(n: number): TestPlayer {
    const nthChoice = this.currentOutput?.choices[n];

    if (!nthChoice) {
      throw new Error(
        `Specified choice does not exist. Specified index: ${n} Choices: ${this.currentOutput?.choices}`
      );
    }

    const input: ChoiceInput = {
      type: "Choice",
      payload: {
        id: nthChoice.id,
      },
    };

    this.tick(input);

    return this;
  }

  chooseRandomChoice(): TestPlayer {
    const numChoices = this.currentOutput?.choices.length ?? 0;
    const choiceIndex = Math.floor(Math.random() * numChoices);
    const input: ChoiceInput | undefined = this.currentOutput
      ? {
          type: "Choice",
          payload: {
            id: this.currentOutput.choices[choiceIndex].id,
          },
        }
      : undefined;

    this.tick(input);

    return this;
  }

  test(fn: TestFn, desc?: string) {
    if (!this.currentOutput || !this.currentStatus) {
      throw new Error("Story has not run yet");
    }

    if (!fn(this.currentOutput, this.currentStatus)) {
      throw new Error(`Expectation failed${desc ? `: ${desc}` : "."}`);
    }
  }

  playRandomly(maxIterations: number) {
    for (let i = 0; i < maxIterations; i++) {
      this.chooseRandomChoice();
      if (this.currentStatus !== "Running") {
        return;
      }
    }
  }
}
