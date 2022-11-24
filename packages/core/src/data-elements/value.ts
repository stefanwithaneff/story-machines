import { nanoid } from "nanoid";
import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { ExpressionParser } from "../utils/expression-parser";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class Value {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key, textContent } = tree.attributes;
    return { [key ?? nanoid()]: ExpressionParser.tryParse(textContent) };
  }
}
