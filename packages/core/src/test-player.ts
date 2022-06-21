import { StoryMachine } from "./base-classes";
import { StoryMachineRuntime } from "./runtime";
import { Context, Input, Output, SaveData, StoryMachineStatus } from "./types";
import { createEmptyContext } from "./utils/create-empty-context";

export class TestPlayer {
  story: StoryMachine;
  currentOutput: Output | undefined;
  currentStatus: StoryMachineStatus | undefined;
  currentContext: Context | undefined;
  constructor(private readonly runtime: StoryMachineRuntime, story: string) {
    this.story = runtime.compileXML(story);
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

  tick(input?: Input) {
    const context = createEmptyContext(input);

    const result = this.story.process(context);
    this.currentStatus = result.status;
    this.currentOutput = context.output;
    this.currentContext = context;
    return this;
  }

  loadStory(xml: string) {
    this.story = this.runtime.compileXML(xml);
    this.init();
    return this;
  }
}
