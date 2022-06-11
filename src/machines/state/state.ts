import { Context, Result, EffectHandler, Effect } from "../../types";
import { getFromScope, initScope } from "../../utils/scope";
import { DecoratorMachine } from "../base-classes/decorator-machine";
import { HANDLERS, INITIAL_STATE, STATE } from "./constants";

export class State extends DecoratorMachine {
  private isInitialized = false;
  private handlers: Record<string, EffectHandler | undefined> = {};
  private state: Record<string, any> = {};

  private handleEffects(context: Context) {
    const effects = context.output.effects;
    const newEffects: Effect[] = [];

    for (const effect of effects) {
      const handler = this.handlers[effect.type];

      if (handler) {
        const effects = handler(this.state, effect);
        newEffects.push(...effects);
      } else {
        newEffects.push(effect);
      }
    }

    context.output.effects = newEffects;
  }

  process(context: Context): Result {
    if (!this.isInitialized) {
      const state =
        getFromScope(context, INITIAL_STATE) ?? context[INITIAL_STATE];
      const handlers = getFromScope(context, HANDLERS) ?? context[HANDLERS];

      if (!state || !handlers) {
        return { status: "Terminated" };
      }

      this.state = state;
      this.handlers = handlers;
      this.isInitialized = true;
    }

    initScope(context, STATE, this.state);

    const result = this.child.process(context);

    if (result.status === "Terminated") {
      return result;
    }

    this.handleEffects(context);

    return { status: "Completed" };
  }
}
