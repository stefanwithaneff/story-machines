import { nanoid } from "nanoid";
import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class Machine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key } = tree.attributes;
    const { children } = runtime.compileChildElements(tree.elements);
    return { [key ?? nanoid()]: children[0] };
  }
}
