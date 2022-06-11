import { EffectHandler, Context, Result } from "../../types";
import { DecoratorMachine, DecoratorAttributes } from "./decorator-machine";

export abstract class EffectHandlerMachine<
  A extends DecoratorAttributes = DecoratorAttributes
> extends DecoratorMachine<A> {
  protected state: any;
  protected abstract handlers: Record<string, EffectHandler>;

  process(context: Context): Result {
    // Process child
    const result = this.child.process(context);

    // Handle effects
    const newEffects = context.output.effects.flatMap((effect) => {
      const handler = this.handlers[effect.type];
      if (!handler) {
        return [effect];
      }
      return handler(this.state, effect);
    });

    context.output.effects = newEffects;

    return result;
  }
}
