import {
  StoryMachine,
  StoryMachineRuntime,
  ElementTree,
  Input,
  Output,
  StoryMachineStatus,
} from "./story-machine";

export class ChoiceText extends StoryMachine {
  private status: StoryMachineStatus | undefined;
  private text: string;

  constructor(tree: ElementTree) {
    super(tree);

    // TODO: Shore up the definition of text nodes in the element tree
    this.text = tree.attributes.text;
  }

  private _process(externalState: any, input?: Input): Output {
    switch (this.status) {
      case undefined:
        return {
          status: "Running",
          text: [],
          effects: [],
          choices: [{ id: this.id, text: this.text, metadata: {} }],
        };
      case "Running":
        if (!input || input.type !== "Choice") {
          return RunningOutput;
        }
        if (input.payload.id === this.id) {
          return CompletedOutput;
        }
        return TerminatedOutput;
      case "Completed":
        return CompletedOutput;
      case "Terminated":
        return TerminatedOutput;
    }
  }

  process(externalState: any, input?: Input): Output {
    const output = this._process(externalState, input);
    this.status = output.status;
    return output;
  }
}

StoryMachineRuntime.registerMachines(ChoiceText);
