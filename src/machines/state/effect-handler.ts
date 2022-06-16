import {
  Context,
  Effect,
  EffectHandlerFn,
  ElementTree,
  Result,
} from "../../types";
import { getFromScope, initScope, setOnScope } from "../../utils/scope";
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
  RETURNED_EFFECT_PAYLOAD,
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
  return (context: Context, effect: Effect) => {
    initScope(
      context,
      attributes.payloadKey ?? INCOMING_EFFECT_PAYLOAD,
      effect.payload
    );
    initScope(context, RETURNED_EFFECTS, []);
    initScope(context, CAN_ALTER_STATE, true);
    processor.process(context);
    setOnScope(context, CAN_ALTER_STATE, false);
    return getFromScope(context, RETURNED_EFFECTS);
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
    const handlerList: HandlerEntry[] =
      getFromScope(context, HANDLERS) ?? context[HANDLERS];

    const handlerEntry: HandlerEntry = {
      type: this.attrs.type,
      handler: this.handler,
    };

    if (handlerList) {
      handlerList.push(handlerEntry);
    } else {
      try {
        initScope(context, HANDLERS, [handlerEntry]);
      } catch (e) {
        return { status: "Terminated" };
      }
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
