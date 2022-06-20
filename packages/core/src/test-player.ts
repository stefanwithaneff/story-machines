import { StoryMachine } from "./base-classes";
import { StoryMachineRuntime } from "./runtime";
import { Context, Input, Output, SaveData, StoryMachineStatus } from "./types";

type TestFn = (output: Output, status: StoryMachineStatus) => boolean;

export class TestPlayer {
  story: StoryMachine;
  currentOutput: Output | undefined;
  currentStatus: StoryMachineStatus | undefined;
  currentContext: Context | undefined;
  constructor(private readonly runtime: StoryMachineRuntime, story: string) {
    this.story = runtime.compileXML(story);
  }

  private generateEmptyContext(input?: Input): Context {
    return {
      output: {
        effects: [],
      },
      input,
      __SCOPES__: [],
    };
  }

  init(): TestPlayer {
    this.story.init();
    this.currentOutput = undefined;
    this.currentStatus = undefined;
    this.currentContext = undefined;
    return this;
  }

  save(saveData: SaveData): TestPlayer {
    this.story.save(saveData);
    return this;
  }

  load(saveData: SaveData): TestPlayer {
    this.story.load(saveData);
    return this;
  }

  tick(input?: Input): TestPlayer {
    const context = this.generateEmptyContext(input);

    const result = this.story.process(context);
    this.currentStatus = result.status;
    this.currentOutput = context.output;
    this.currentContext = context;
    return this;
  }

  loadStory(xml: string): TestPlayer {
    this.story = this.runtime.compileXML(xml);
    this.init();
    return this;
  }

  // chooseNthChoice(n: number): TestPlayer {
  //   const nthChoice = this.currentOutput?.choices[n];

  //   if (!nthChoice) {
  //     throw new Error(
  //       `Specified choice does not exist. Specified index: ${n} Choices: ${this.currentOutput?.choices}`
  //     );
  //   }

  //   const input: ChoiceInput = {
  //     type: "Choice",
  //     payload: {
  //       id: nthChoice.id,
  //     },
  //   };

  //   this.tick(input);

  //   return this;
  // }

  // chooseRandomChoice(): TestPlayer {
  //   const numChoices = this.currentOutput?.choices.length ?? 0;
  //   const choiceIndex = Math.floor(Math.random() * numChoices);
  //   const input: ChoiceInput | undefined = this.currentOutput
  //     ? {
  //         type: "Choice",
  //         payload: {
  //           id: this.currentOutput.choices[choiceIndex].id,
  //         },
  //       }
  //     : undefined;

  //   this.tick(input);

  //   return this;
  // }

  // playRandomly(maxIterations: number) {
  //   for (let i = 0; i < maxIterations; i++) {
  //     this.chooseRandomChoice();
  //     if (this.currentStatus !== "Running") {
  //       return;
  //     }
  //   }
  // }
}
