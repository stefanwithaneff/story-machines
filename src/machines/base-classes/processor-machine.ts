import { StoryMachineRuntime } from "../../runtime";
import { Context, SaveData } from "../../types";
import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export abstract class ProcessorMachine<
  A extends StoryMachineAttributes
> extends StoryMachine<A> {
  protected processor: StoryMachine;
  constructor(attrs: A) {
    super(attrs);
    this.processor = this.createProcessor();
  }

  protected generateId(tag: string) {
    return `${this.id}_${tag}`;
  }

  init() {
    this.processor.init();
  }

  save(saveData: SaveData) {
    this.processor.save(saveData);
  }

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    this.processor.load(saveData, runtime);
  }

  process(context: Context) {
    return this.processor.process(context);
  }

  protected abstract createProcessor(): StoryMachine;
}
