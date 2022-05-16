import { nanoid } from "nanoid";
import { Context, Result } from "../../types";

export interface StoryMachineAttributes {
  id?: string;
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
