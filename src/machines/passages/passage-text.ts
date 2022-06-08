import { Context, Result } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../../utils/expression-parser";
import { getOutputBuilder } from "../../utils/output-builder";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Once } from "../base-machines/once";
import { setOnScope } from "../base-machines/scoped";
import { createDevErrorEffect } from "../effects/dev-error";

interface PassageTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class PassageText extends StoryMachine<PassageTextAttributes> {
  private processor: StoryMachine;
  constructor(attrs: PassageTextAttributes) {
    super(attrs);

    this.processor = new Once({
      child: createStoryMachine((context: Context): Result => {
        try {
          const evalText = replaceWithParsedExpressions(
            context,
            this.attrs.expressions,
            this.attrs.textContent ?? ""
          );

          setOnScope(context, "passageText", evalText);
        } catch (e) {
          const builder = getOutputBuilder(context);
          builder.addEffect(createDevErrorEffect({ message: e.message }));
          return { status: "Terminated" };
        }
        return { status: "Completed" };
      }),
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

export const PassageTextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new PassageText({
      expressions,
      textContent: tree.attributes.textContent,
    });
  },
};
