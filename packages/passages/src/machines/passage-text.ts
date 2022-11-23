import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  Expression,
  parseAll,
  ProcessorMachine,
  StaticImplements,
  StoryMachineClass,
  StoryMachineRuntime,
  ElementTree,
} from "@story-machines/core";
import { PassageMachine } from "./passage";

interface TextAttributes extends StoryMachineAttributes {
  text: string;
  textExpressions: Expression[];
}

@StaticImplements<StoryMachineClass>()
export class PassageText extends ProcessorMachine<TextAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const textExpressions: Expression[] = parseAll(tree.attributes.textContent);
    return new PassageText({
      ...tree.attributes,
      text: tree.attributes.textContent,
      textExpressions,
    });
  }

  protected createProcessor(): StoryMachine {
    return new PassageMachine({
      id: this.generateId("passage"),
      text: this.attrs.text,
      textExpressions: this.attrs.textExpressions,
      metadata: {},
      children: [],
    });
  }
}
