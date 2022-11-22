import { DataElementClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<DataElementClass>()
export class Metadata {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);
    return { metadata: data };
  }
}
