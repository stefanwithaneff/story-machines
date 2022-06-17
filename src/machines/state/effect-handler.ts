import { Context, Effect, EffectHandlerFn, Result } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  CompositeMachine,
  CompositeMachineAttributes,
} from "../base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Sequence } from "../base-machines/sequence";
import {
  CAN_ALTER_STATE,
  HANDLERS,
  RETURNED_EFFECTS,
  STATE_BUILDER,
  HandlerEntry,
  INCOMING_EFFECT_PAYLOAD,
} from "./constants";

interface EffectHandlerAttributes extends CompositeMachineAttributes {
  type: string;
  payloadKey?: string;
}

export function createEffectHandler(
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
    setOnContext(context, CAN_ALTER_STATE, true);
    const result = processor.process(context);
    setOnContext(context, CAN_ALTER_STATE, false);
    if (result.status === "Terminated") {
      throw new Error("Effect handler failed to execute");
    }
    return getFromContext(context, RETURNED_EFFECTS);
  };
}

export class EffectHandler extends CompositeMachine<EffectHandlerAttributes> {
  machineTypes: symbol[] = [STATE_BUILDER];
  private handler: EffectHandlerFn;
  constructor(attrs: EffectHandlerAttributes) {
    super(attrs);

    const processor = new Sequence({
      children: this.children,
    });

    this.handler = createEffectHandler(this.attrs, processor);
  }
  process(context: Context): Result {
    const handlerList: HandlerEntry[] = getFromContext(context, HANDLERS);

    const handlerEntry: HandlerEntry = {
      type: this.attrs.type,
      handler: this.handler,
    };

    if (handlerList) {
      handlerList.push(handlerEntry);
    } else {
      setOnContext(context, HANDLERS, [handlerEntry]);
    }

    return { status: "Completed" };
  }
}

export const EffectHandlerCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { type, payloadKey } = tree.attributes;
    const children = runtime.compileChildElements(tree.elements);

    return new EffectHandler({
      ...tree.attributes,
      type,
      payloadKey,
      children,
    });
  },
};
