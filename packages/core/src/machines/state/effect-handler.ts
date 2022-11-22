import { Context, Effect, ElementTree } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  CompositeMachineAttributes,
  DataElementClass,
  ProcessorMachine,
  StoryMachine,
  StoryMachineClass,
} from "../../base-classes";
import { Sequence } from "../sequence";
import {
  RETURNED_EFFECTS,
  HandlerEntry,
  INCOMING_EFFECT_PAYLOAD,
} from "./constants";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";

interface EffectHandlerAttributes extends CompositeMachineAttributes {
  type: string;
  payloadKey?: string;
}

function createEffectHandler(
  attributes: EffectHandlerAttributes,
  processor: StoryMachine
) {
  return (context: Context, effect: Effect): Effect[] => {
    setOnContext(
      context,
      attributes.payloadKey ?? INCOMING_EFFECT_PAYLOAD,
      effect.payload
    );
    setOnContext(context, RETURNED_EFFECTS, []);
    const result = processor.process(context);
    if (result.status === "Terminated") {
      throw new Error("Effect handler failed to execute");
    }
    return getFromContext(context, RETURNED_EFFECTS);
  };
}

@StaticImplements<DataElementClass>()
export class EffectHandlers {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);

    const handlerMachines = children.filter(
      (child) => child instanceof EffectHandler
    ) as EffectHandler[];

    const effectHandlers: HandlerEntry[] = handlerMachines.map((handler) => ({
      type: handler.attrs.type,
      handler: createEffectHandler(handler.attrs, handler),
    }));

    return { effectHandlers };
  }
}

@StaticImplements<StoryMachineClass>()
export class EffectHandler extends ProcessorMachine<EffectHandlerAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { type, payloadKey } = tree.attributes;
    const { children } = runtime.compileChildElements(tree.elements);

    return new EffectHandler({
      ...tree.attributes,
      type,
      payloadKey,
      children,
    });
  }

  protected createProcessor() {
    return new Sequence({ children: this.attrs.children });
  }
}
