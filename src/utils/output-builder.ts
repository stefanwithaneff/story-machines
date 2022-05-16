import {
  Choice,
  Effect,
  Output,
  Metadata,
  Context,
} from "../machines/base/types";

export class OutputBuilder {
  constructor(private output: Output) {}

  addText(text: string): OutputBuilder {
    this.output.text.push(text);
    return this;
  }

  addChoice(choice: Choice): OutputBuilder {
    this.output.choices.push(choice);
    return this;
  }

  addEffect(effect: Effect): OutputBuilder {
    this.output.effects.push(effect);
    return this;
  }

  addMetadata(metadata: Metadata): OutputBuilder {
    Object.assign(this.output.metadata, metadata);
    return this;
  }

  processEffects(fn: (effect: Effect) => Effect[]): OutputBuilder {
    const newEffects: Effect[] = [];
    for (const effect of this.output.effects) {
      newEffects.push(...fn(effect));
    }
    this.output.effects = newEffects;
    return this;
  }

  build() {
    return this.output;
  }
}

export function getOutputBuilder(context: Context): OutputBuilder {
  if (!context.__builder) {
    context._builder = new OutputBuilder(context.output);
  }
  return context.__builder;
}
