import { Context, SaveData } from "../../types";
import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export abstract class ProcessorMachine<
  A extends StoryMachineAttributes = StoryMachineAttributes
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

  load(saveData: SaveData) {
    this.processor.load(saveData);
  }

  process(context: Context) {
    return this.processor.process(context);
  }

  protected abstract createProcessor(): StoryMachine;
}
