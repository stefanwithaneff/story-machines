import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { Expression, parseAll } from "../utils/expression-parser";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class Text {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { textContent } = tree.attributes;
    const textExpressions: Expression[] = parseAll(tree.attributes.textContent);
    return { text: textContent, textExpressions };
  }
}
