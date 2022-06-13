import { unset } from "lodash";
import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";

interface DeleteContextAttributes extends StoryMachineAttributes {
  key: string;
}

export class DeleteContext extends StoryMachine<DeleteContextAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    unset(context, this.attrs.key);
    return { status: "Completed" };
  }
}
