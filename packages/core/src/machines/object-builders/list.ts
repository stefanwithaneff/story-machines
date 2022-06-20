import { Context, Result } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  CompositeMachine,
  CompositeMachineAttributes,
  ProcessorMachine,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { KEY_PREFIX } from "./constants";
import { Sequence } from "../sequence";
import { createStoryMachine } from "../../utils/create-story-machine";

export class List extends CompositeMachine {
  process(context: Context): Result {
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    const list: any[] = [];

    setOnContext(context, keyPrefix, list);

    for (let i = 0; i < this.children.length; i++) {
      // Add an empty item to the array to be replaced
      list.push(null);

      // Update the key prefix with the current index
      keyPrefix.push(`${i}`);

      const result = this.children[i].process(context);

      // Remove current index from the key prefix
      keyPrefix.pop();

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const ListCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new List({ ...tree.attributes, children });
  },
};

interface NestedListAttributes extends CompositeMachineAttributes {
  key: string;
}

export class NestedList extends ProcessorMachine<NestedListAttributes> {
  protected createProcessor(): StoryMachine<StoryMachineAttributes> {
    let keyPrefix: string[];
    return new Sequence({
      children: [
        createStoryMachine((context) => {
          keyPrefix = getFromContext(context, KEY_PREFIX);
          keyPrefix.push(this.attrs.key);
          return { status: "Completed" };
        }),
        new List({ children: this.attrs.children }),
        createStoryMachine((context) => {
          keyPrefix.pop();
          return { status: "Completed" };
        }),
      ],
    });
  }
}

export const NestedListCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new NestedList({
      ...tree.attributes,
      key: tree.attributes.key,
      children,
    });
  },
};
