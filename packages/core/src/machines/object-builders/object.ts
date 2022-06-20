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

// Named "ObjectMachine" instead of "Object" due to JS runtime conflict
export class ObjectMachine extends CompositeMachine {
  process(context: Context): Result {
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    setOnContext(context, keyPrefix, {});

    for (const child of this.attrs.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const ObjectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new ObjectMachine({ ...tree.attributes, children });
  },
};

interface NestedObjectAttributes extends CompositeMachineAttributes {
  key: string;
}

export class NestedObject extends ProcessorMachine<NestedObjectAttributes> {
  protected createProcessor(): StoryMachine<StoryMachineAttributes> {
    let keyPrefix: string[];
    return new Sequence({
      children: [
        createStoryMachine((context) => {
          keyPrefix = getFromContext(context, KEY_PREFIX);
          keyPrefix.push(this.attrs.key);
          return { status: "Completed" };
        }),
        new ObjectMachine({ children: this.attrs.children }),
        createStoryMachine((context) => {
          keyPrefix.pop();
          return { status: "Completed" };
        }),
      ],
    });
  }
}

export const NestedObjectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new NestedObject({
      ...tree.attributes,
      key: tree.attributes.key,
      children,
    });
  },
};
