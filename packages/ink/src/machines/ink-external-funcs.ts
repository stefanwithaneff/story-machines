import {
  DataElementClass,
  ElementTree,
  ExpressionParser,
  StaticImplements,
  StoryMachineRuntime,
} from "@story-machines/core";

@StaticImplements<DataElementClass>()
export class InkExternalFuncs {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);

    return { inkExternalFuncs: Object.values(data) };
  }
}

@StaticImplements<DataElementClass>()
export class InkExternalFunc {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const name = tree.attributes.name ?? "";
    const isGeneral = tree.attributes.isGeneral ?? false;
    const fn = ExpressionParser.tryParse(tree.attributes.textContent ?? "");

    return { [name]: { fn, isGeneral, name } };
  }
}
