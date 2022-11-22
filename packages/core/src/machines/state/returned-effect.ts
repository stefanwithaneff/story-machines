import { Context, Effect, ElementTree, Result } from "../../types";
import { getFromContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { RETURNED_EFFECTS } from "./constants";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";
import { recursivelyCalculateExpressions } from "../../utils/expression-parser";

interface ReturnedEffectAttributes extends StoryMachineAttributes {
  type: string;
  data: Record<string, any>;
}

@StaticImplements<StoryMachineClass>()
export class ReturnedEffect extends StoryMachine<ReturnedEffectAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { type } = tree.attributes;
    const { data } = runtime.compileChildElements(tree.elements);

    return new ReturnedEffect({ ...tree.attributes, type, data });
  }

  process(context: Context): Result {
    const { type, data } = this.attrs;

    const returnedEffects: Effect[] = getFromContext(context, RETURNED_EFFECTS);

    returnedEffects.push({
      type,
      payload: recursivelyCalculateExpressions(context, data),
    });

    return { status: "Completed" };
  }
}
