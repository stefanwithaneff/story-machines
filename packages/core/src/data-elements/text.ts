import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { TextWithExpressions } from "../utils/expression-parser";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class Text {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { textContent } = tree.attributes;
    return { text: new TextWithExpressions(textContent ?? "") };
  }
}
