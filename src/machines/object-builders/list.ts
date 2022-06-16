import { Context, Result } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { KEY_PREFIX } from "./constants";

interface ListAttributes extends CompositeMachineAttributes {
  key?: string;
}

export class List extends StoryMachine<ListAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    if (this.attrs.key) {
      keyPrefix.push(this.attrs.key);
    }

    const list: any[] = [];

    setOnContext(context, keyPrefix, list);

    for (let i = 0; i < this.attrs.children.length; i++) {
      // Add an empty item to the array to be replaced
      list.push(null);

      // Update the key prefix with the current index
      keyPrefix.push(`${i}`);

      const result = this.attrs.children[i].process(context);

      // Remove current index from the key prefix
      keyPrefix.pop();

      if (result.status === "Terminated") {
        return result;
      }
    }

    if (this.attrs.key) {
      keyPrefix.pop();
    }

    return { status: "Completed" };
  }
}

export const ListCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new List({ key: tree.attributes.key, children });
  },
};
