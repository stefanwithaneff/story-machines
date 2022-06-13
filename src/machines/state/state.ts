import { StoryMachineRuntime } from "../../runtime";
import {
  Context,
  Result,
  EffectHandlerFn,
  Effect,
  SaveData,
  ElementTree,
} from "../../types";
import { getFromScope, initScope } from "../../utils/scope";
import { DecoratorMachine } from "../base-classes/decorator-machine";
import { Sequence } from "../base-machines/sequence";
import { HandlerEntry, HANDLERS, INITIAL_STATE, STATE } from "./constants";
import { createEffectHandler } from "./effect-handler";

interface StoredHandler {
  handler: EffectHandlerFn;
  tree: ElementTree;
}

export class State extends DecoratorMachine {
  private isInitialized = false;
  private handlers: Record<string, StoredHandler | undefined> = {};
  private state: Record<string, any> = {};

  private handleEffects(context: Context) {
    const effects = context.output.effects;
    const newEffects: Effect[] = [];

    for (const effect of effects) {
      const handler = this.handlers[effect.type]?.handler;

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
      isInitialized: this.isInitialized,
      state: this.state,
      handlers: Object.entries(this.handlers).map(([type, storedHandler]) => ({
        type,
        tree: storedHandler?.tree,
      })),
    };
  }

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    const { isInitialized, state, handlers } = saveData[this.id];

    this.isInitialized = isInitialized;
    this.state = state;
    this.handlers = handlers;

    for (const { type, tree } of handlers) {
      const children = runtime.compileChildElements(tree.elements);
      const processor = new Sequence({ children });
      this.handlers[type] = {
        handler: createEffectHandler(tree.attributes, processor),
        tree,
      };
    }
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

      this.state = state;
      this.isInitialized = true;
      for (const { type, handler, tree } of handlers) {
        this.handlers[type] = {
          handler,
          tree,
        };
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
