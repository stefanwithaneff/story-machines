import { StoryMachineRuntime } from "../../runtime";
import { Context, Result, SaveData, HandlerMap } from "../../types";
import { handleEffects } from "../../utils/effects";
import { getFromContext, setOnContext } from "../../utils/scope";
import { DecoratorMachine } from "../base-classes/decorator-machine";
import { HandlerEntry, HANDLERS, INITIAL_STATE, STATE } from "./constants";

export class State extends DecoratorMachine {
  private isInitialized = false;
  private handlers: HandlerMap = {};
  private state: Record<string, any> = {};

  init() {
    this.isInitialized = false;
    this.handlers = {};
    this.state = {};
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      state: this.state,
    };
  }

  load(saveData: SaveData) {
    const { state } = saveData[this.id];
    this.isInitialized = false;
    this.state = state;
  }

  process(context: Context): Result {
    if (!this.isInitialized) {
      const state =
        getFromContext(context, INITIAL_STATE) ?? context[INITIAL_STATE];
      const handlers: HandlerEntry[] =
        getFromContext(context, HANDLERS) ?? context[HANDLERS] ?? [];

      if (!state) {
        return { status: "Terminated" };
      }

      // Spread existing state during initialization to overwrite with loaded save data
      this.state = { ...state, ...this.state };
      this.isInitialized = true;
      for (const { type, handler } of handlers) {
        this.handlers[type] = handler;
      }
    }

    setOnContext(context, STATE, this.state);

    const result = this.child.process(context);

    if (result.status !== "Terminated") {
      handleEffects(context, this.handlers);
    }

    return result;
  }
}
