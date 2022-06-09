import { Context, Result } from "../../types";
import { getFromScope, setOnScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

interface MetadataListAttributes extends CompositeMachineAttributes {
  key: string;
}

export class MetadataList extends StoryMachine<MetadataListAttributes> {
  process(context: Context): Result {
    const metadataPrefix: string[] = getFromScope(context, "metadataPrefix");

    if (!metadataPrefix) {
      return { status: "Terminated" };
    }

    metadataPrefix.push(this.attrs.key);

    const list: any[] = [];

    try {
      setOnScope(context, metadataPrefix, list);
    } catch (e) {
      return { status: "Terminated" };
    }

    for (let i = 0; i < this.attrs.children.length; i++) {
      // Add an empty item to the array to be replaced
      list.push(null);

      // Update the key prefix with the current index
      metadataPrefix.push(`${i}`);

      const result = this.attrs.children[i].process(context);

      // Remove current index from the key prefix
      metadataPrefix.pop();

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const MetadataListCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new MetadataList({ key: tree.attributes.key, children });
  },
};
