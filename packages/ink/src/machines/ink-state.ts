import {
  DataElementClass,
  ElementTree,
  StaticImplements,
  StoryMachineRuntime,
} from "@story-machines/core";

@StaticImplements<DataElementClass>()
export class InkState {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);

    return { inkState: data };
  }
}
