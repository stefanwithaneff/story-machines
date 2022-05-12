import {
  StoryMachine,
  ElementTree,
  Input,
  Output,
  StoryMachineClass,
} from "./story-machine";

export class Story extends StoryMachine {
  private currentNode: StoryMachine;

  constructor(tree: ElementTree) {
    super(tree);

    const { entrypoint } = tree.attributes;

    this.currentNode =
      this.nodes.find((node) => node.id === entrypoint) ?? this.nodes[0];
  }

  getChildren() {
    return [this.currentNode];
  }

  getChildState(externalState: any) {
    return externalState;
  }

  produceOutput(
    externalState: any,
    outputs: Output[],
    input?: Input | undefined
  ): Output {
    // TODO: Implement GOTO handling
    return outputs[0];
  }
}

StoryMachine.registerMachines(Story);
