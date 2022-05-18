import { nanoid } from "nanoid";
import { StoryMachineRuntime } from "../../runtime";
import { Context, Result, ElementTree } from "../../types";

export interface StoryMachineAttributes {
  id?: string;
  textContent?: string;
}

export abstract class StoryMachine<
  A extends StoryMachineAttributes = StoryMachineAttributes
> {
  id: string;
  attrs: A;

  constructor(attributes: A) {
    this.id = attributes.id ?? nanoid();
    this.attrs = attributes;
  }

  abstract process(context: Context): Result;
}

export interface StoryMachineCompiler {
  compile(runtime: StoryMachineRuntime, tree: ElementTree): StoryMachine<any>;
}
