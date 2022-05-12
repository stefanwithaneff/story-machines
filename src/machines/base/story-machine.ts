import { nanoid } from "nanoid";
import {
  ElementTree,
  StoryMachineStatus,
  Context,
  Result,
  ProcessFn,
  ProcessorFactory,
  CompositeFactory,
  DecoratorFactory,
} from "./types";

export type StoryMachineClass = new (
  ...args: ConstructorParameters<typeof StoryMachine>
) => StoryMachine;

export class StoryMachineRuntime {
  private static registeredMachines: Map<string, StoryMachineClass> = new Map();

  static registerMachines(...classVal: StoryMachineClass[]): void {
    // Adds all machines by their lowercased class names to help with case-insensitive lookups
    for (const val of classVal) {
      StoryMachineRuntime.registeredMachines.set(val.name.toLowerCase(), val);
    }
  }

  static getMachineClassForTypename(typename: string) {
    return StoryMachineRuntime.registeredMachines.get(typename.toLowerCase());
  }

  static hasMachineClassForTypename(typename: string): boolean {
    return StoryMachineRuntime.registeredMachines.has(typename.toLowerCase());
  }
}

export abstract class StoryMachine {
  protected tree: ElementTree;
  process: ProcessFn;
  id: string;

  constructor(tree: ElementTree) {
    if (tree.type.toLowerCase() !== this.constructor.name.toLowerCase()) {
      throw new Error(
        `Mismatch between provided element type ${tree.type} and class ${this.constructor.name}`
      );
    }

    this.id = tree.attributes.id ?? nanoid();
    this.tree = tree;
    this.process = this.generateProcessFn().bind(this);
  }

  protected abstract generateProcessFn(): ProcessFn;
}

export abstract class SimpleCompositeMachine extends StoryMachine {
  protected nodes: StoryMachine[];

  constructor(tree: ElementTree) {
    super(tree);

    this.nodes = tree.elements.map(
      (element) =>
        new (StoryMachineRuntime.getMachineClassForTypename(
          element.type
        ) as StoryMachineClass)(element)
    );
  }
}

export abstract class DecoratorMachine extends StoryMachine {
  protected node: StoryMachine;

  constructor(tree: ElementTree) {
    super(tree);

    const childElement = tree.elements[0];

    this.node = new (StoryMachineRuntime.getMachineClassForTypename(
      childElement.type
    ) as StoryMachineClass)(childElement);
  }
}
