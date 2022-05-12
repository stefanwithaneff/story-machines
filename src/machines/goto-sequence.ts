import { getOutputBuilder } from "../utils/output-builder";
import {
  SimpleCompositeMachine,
  StoryMachine,
  StoryMachineRuntime,
} from "./base/story-machine";
import {
  CompositeFactory,
  ElementTree,
  ID,
  Effect,
  ProcessFn,
  Context,
  Result,
} from "./base/types";

// Harder to build with the functional pattern because no ID is available on the functions
// TODO: Should the functional version use some kind of factory that attaches the ID and other relevant context?
// TODO: How/where should effects be defined since they're likely exclusively related to the specific machine?
export class GotoSequence extends SimpleCompositeMachine {
  private currentNodeId: ID;

  constructor(tree: ElementTree) {
    super(tree);
    this.currentNodeId = this.nodes[0].id;
  }

  private handleEffect(effect: Effect): Effect[] {
    if (isGotoEffect(effect)) {
      this.currentNodeId = effect.payload.id;
      return [];
    }
    return [effect];
  }

  protected generateProcessFn(): ProcessFn {
    return (context: Context): Result => {
      const currentNode = this.nodes.find(
        (node) => node.id === this.currentNodeId
      );

      if (!currentNode) {
        return { status: "Terminated" };
      }

      const result = currentNode.process(context);
      const builder = getOutputBuilder(context);
      builder.processEffects(this.handleEffect.bind(this));
      return result;
    };
  }
}

export type GotoEffect = Effect<{ id: ID }>;

function isGotoEffect(effect: Effect): effect is GotoEffect {
  return effect.type === "GO_TO";
}

StoryMachineRuntime.registerMachines(GotoSequence);
