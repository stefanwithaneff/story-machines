import { nanoid } from "nanoid";
import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class ObjectElement {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key } = tree.attributes;
    const { data } = runtime.compileChildElements(tree.elements);
    return { [key ?? nanoid()]: data };
  }
}
