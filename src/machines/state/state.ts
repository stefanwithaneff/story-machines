import { StoryMachineRuntime } from "../../runtime";
import {
  Context,
  Result,
  EffectHandlerFn,
  Effect,
  SaveData,
} from "../../types";
import { getFromScope, initScope } from "../../utils/scope";
import { DecoratorMachine } from "../base-classes/decorator-machine";
import { HandlerEntry, HANDLERS, INITIAL_STATE, STATE } from "./constants";

export class State extends DecoratorMachine {
  private isInitialized = false;
  private handlers: Record<string, EffectHandlerFn | undefined> = {};
  private state: Record<string, any> = {};

  private handleEffects(context: Context) {
    const effects = context.output.effects;
    const newEffects: Effect[] = [];

    for (const effect of effects) {
      const handler = this.handlers[effect.type];

      if (handler) {
        const effects = handler(context, effect);
        newEffects.push(...effects);
      } else {
        newEffects.push(effect);
      }
    }

    context.output.effects = newEffects;
  }

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

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    const { state } = saveData[this.id];
    this.isInitialized = false;
    this.state = state;
  }

  process(context: Context): Result {
    if (!this.isInitialized) {
      const state =
        getFromScope(context, INITIAL_STATE) ?? context[INITIAL_STATE];
      const handlers: HandlerEntry[] =
        getFromScope(context, HANDLERS) ?? context[HANDLERS] ?? [];

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

    initScope(context, STATE, this.state);

    const result = this.child.process(context);

    if (result.status !== "Terminated") {
      this.handleEffects(context);
    }

    return result;
  }
}