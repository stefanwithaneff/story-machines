import { StoryMachine } from "./base-classes";
import { StoryMachineRuntime } from "./runtime";
import { Context, Output, SaveData, StoryMachineStatus } from "./types";
import { createEmptyContext } from "./utils/create-empty-context";

export class TestPlayer {
  story: StoryMachine;
  currentOutput: Output | undefined;
  currentStatus: StoryMachineStatus | undefined;
  currentContext: Context | undefined;
  constructor(private readonly runtime: StoryMachineRuntime, story: string) {
    const result = runtime.compileXML(story);

    if (!(result instanceof StoryMachine)) {
      throw new Error(
        "Provided XML string does not compile to a valid story machine"
      );
    }

    this.story = result;
  }

  init() {
    this.story.init();
    this.currentOutput = undefined;
    this.currentStatus = undefined;
    this.currentContext = undefined;
    return this;
  }

  save(saveData: SaveData) {
    this.story.save(saveData);
    return this;
  }

  load(saveData: SaveData) {
    this.story.load(saveData);
    return this;
  }

  tick(externalContext?: Record<string, any>) {
    const context = createEmptyContext(externalContext);

    const result = this.story.process(context);
    this.currentStatus = result.status;
    this.currentOutput = context.output;
    this.currentContext = context;
    return this;
  }

  loadStory(xml: string) {
    const result = this.runtime.compileXML(xml);

    if (!(result instanceof StoryMachine)) {
      throw new Error(
        "Provided XML string does not compile to a valid story machine"
      );
    }

    this.story = result;
    this.init();
    return this;
  }
}
