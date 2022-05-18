import { getOutputBuilder } from "../utils/output-builder";
import {
  SimpleCompositeAttributes,
  CompositeMachine,
} from "./base-classes/composite-machine";
import { ElementTree, Effect, ProcessFn, Context, Result } from "../types";

// TODO: How to implement a EffectHandler on a sequence?
// TODO How to implement an Effect as a Node?

// TODO: How/where should effects be defined since they're likely exclusively related to the specific machine?
/**
 * Allows for explicit traversal of Nodes in the sequence using a GO_TO effect
 */
export class GotoSequence extends CompositeMachine {
  private currentNodeId: string;

  constructor(attrs: SimpleCompositeAttributes) {
    super(attrs);
    this.currentNodeId = this.children[0].id;
  }

  private handleEffect(effect: Effect): Effect[] {
    if (isGotoEffect(effect)) {
      this.currentNodeId = effect.payload.id;
      return [];
    }
    return [effect];
  }

  process(context: Context): Result {
    const currentNode = this.children.find(
      (node) => node.id === this.currentNodeId
    );

    if (!currentNode) {
      return { status: "Terminated" };
    }

    const result = currentNode.process(context);
    const builder = getOutputBuilder(context);
    builder.processEffects(this.handleEffect.bind(this));
    return result;
  }
}

export type GotoEffect = Effect<{ id: string }>;

function isGotoEffect(effect: Effect): effect is GotoEffect {
  return effect.type === "@Goto/GO_TO";
}
