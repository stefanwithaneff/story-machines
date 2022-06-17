import { Context, Effect, HandlerMap } from "../types";

export function handleEffects(context: Context, handlerMap: HandlerMap) {
  const effects = context.output.effects;
  const newEffects: Effect[] = [];

  for (const effect of effects) {
    const handler = handlerMap[effect.type];

    if (!handler) {
      newEffects.push(effect);
      continue;
    }

    const resultingEffects = handler(context, effect);
    newEffects.push(...resultingEffects);
  }

  context.output.effects = newEffects;
}
