import { Context, ProcessFn, Result, Effect, EffectHandler } from "../../types";
import { StoryMachine } from "../base-classes/story-machine";

const INITIALIZE_STATE = "@State/INITIALIZE_STATE";
const SET_STATE = "@State/SET_STATE";

export class State extends StoryMachine {
  private state: Record<string, any> = {};
  process(context: Context): Result {
    return { status: "Terminated" };
  }
}
