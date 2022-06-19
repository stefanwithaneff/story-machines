import { Context, Result } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  CompositeMachineAttributes,
  StoryMachine,
  StoryMachineCompiler,
} from "../../base-classes";
import { KEY_PREFIX } from "./constants";

interface ObjectAttributes extends CompositeMachineAttributes {
  key?: string;
}

// Named "ObjectMachine" instead of "Object" due to JS runtime conflict
export class ObjectMachine extends StoryMachine<ObjectAttributes> {
  process(context: Context): Result {
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    if (this.attrs.key) {
      keyPrefix.push(this.attrs.key);
    }

    setOnContext(context, keyPrefix, {});

    for (const child of this.attrs.children) {
      const result = child.process(context);

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

export const ObjectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new ObjectMachine({ key: tree.attributes.key, children });
  },
};