import { SaveData } from "../types";
import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export interface CompositeMachineAttributes extends StoryMachineAttributes {
  children: StoryMachine[];
}

export abstract class CompositeMachine<
  A extends CompositeMachineAttributes = CompositeMachineAttributes
> extends StoryMachine<A> {
  protected children: StoryMachine[];
  constructor(attributes: A) {
    super(attributes);

    this.children = attributes.children;
  }
  init() {
    for (const child of this.children) {
      child.init();
    }
  }
  save(saveData: SaveData) {
    for (const child of this.children) {
      child.save(saveData);
    }
  }
  load(saveData: SaveData) {
    for (const child of this.children) {
      child.load(saveData);
    }
  }
}
