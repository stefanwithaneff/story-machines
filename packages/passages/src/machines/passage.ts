import {
  StoryMachine,
  StoryMachineAttributes,
  ImmediateSequence,
  Scoped,
  Once,
  Wait,
  ProcessorMachine,
  StaticImplements,
  StoryMachineClass,
  StoryMachineRuntime,
  ElementTree,
  Expression,
  createStoryMachine,
  Context,
  replaceWithParsedExpressions,
  recursivelyCalculateExpressions,
} from "@story-machines/core";
import { isEmpty } from "lodash";
import { Passage } from "../types";
import { addPassageToOutput } from "../utils/add-passage-to-output";

interface PassageAttributes extends StoryMachineAttributes {
  metadata: Record<string, any>;
  text: string;
  textExpressions: Expression[];
  children: StoryMachine[];
}

@StaticImplements<StoryMachineClass>()
export class PassageMachine extends ProcessorMachine<PassageAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children, data } = runtime.compileChildElements(tree.elements);

    const metadata = data.metadata ?? {};
    const text = data.text ?? "";
    const textExpressions = data.textExpressions ?? [];

    return new PassageMachine({
      ...tree.attributes,
      children,
      metadata,
      text,
      textExpressions,
    });
  }

  protected createProcessor() {
    return new ImmediateSequence({
      children: [
        new Scoped({
          child: new Once({
            id: this.generateId("once"),
            child: createStoryMachine((context: Context) => {
              const evalText = replaceWithParsedExpressions(
                context,
                this.attrs.textExpressions,
                this.attrs.text
              );
              const passage: Passage = {
                text: evalText,
                metadata: recursivelyCalculateExpressions(
                  context,
                  this.attrs.metadata
                ),
              };

              if (evalText !== "" || !isEmpty(this.attrs.metadata)) {
                addPassageToOutput(context, passage);
              }

              return { status: "Completed" };
            }),
          }),
        }),
        ...this.attrs.children,
        new Wait({ id: this.generateId("wait") }),
      ],
    });
  }
}
