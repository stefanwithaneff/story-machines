import {
  DataElementClass,
  ElementTree,
  StaticImplements,
  StoryMachineRuntime,
} from "@story-machines/core";

@StaticImplements<DataElementClass>()
export class InkPreprocessors {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);

    return { inkPreprocessors: children };
  }
}

@StaticImplements<DataElementClass>()
export class InkPostprocessors {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);

    return { inkPostprocessors: children };
  }
}
