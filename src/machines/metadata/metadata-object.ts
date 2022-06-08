import { Context, Result } from "../../types";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { getFromScope, setOnScope } from "../base-machines/scoped";

interface MetadataObjectAttributes extends CompositeMachineAttributes {
  key?: string;
}

export class MetadataObject extends StoryMachine<MetadataObjectAttributes> {
  process(context: Context): Result {
    const metadataPrefix: string[] = getFromScope(context, "metadataPrefix");

    if (!metadataPrefix) {
      return { status: "Terminated" };
    }

    if (this.attrs.key) {
      metadataPrefix.push(this.attrs.key);
    }

    try {
      setOnScope(context, metadataPrefix, {});
    } catch (e) {
      return { status: "Terminated" };
    }

    for (const child of this.attrs.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const MetadataObjectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new MetadataObject({ key: tree.attributes.key, children });
  },
};
