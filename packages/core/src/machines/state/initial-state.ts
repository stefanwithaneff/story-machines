import { ElementTree } from "../../types";
import { DataElementClass } from "../../base-classes";
import { StoryMachineRuntime } from "../../runtime";
import { StaticImplements } from "../../utils/static-implements";

@StaticImplements<DataElementClass>()
export class InitialState {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);
    return { initialState: data };
  }
}
