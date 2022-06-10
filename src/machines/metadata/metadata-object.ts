import { Context, Result } from "../../types";
import { getFromScope, initScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

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
      initScope(context, metadataPrefix, {});
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
