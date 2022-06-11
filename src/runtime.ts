import { parseXMLToTree } from "./utils/parse-xml-to-tree";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "./machines/base-classes/story-machine";
import { ElementTree } from "./types";
import { ChoiceCompiler } from "./machines/choices/choice";
import { SequenceCompiler } from "./machines/base-machines/sequence";
import { TextCompiler } from "./machines/passages/text";
import { ChoiceTextCompiler } from "./machines/choices/choice-text";
import { ImmediateSequenceCompiler } from "./machines/base-machines/immediate-sequence";
import { ImmediateSelectorCompiler } from "./machines/base-machines/immediate-selector";
import { ConditionCompiler } from "./machines/base-machines/condition";
import { SelectorCompiler } from "./machines/base-machines/selector";
import { SetContextCompiler } from "./machines/base-machines/set-context";
import { PassageCompiler } from "./machines/passages/passage";
import { PassageTextCompiler } from "./machines/passages/passage-text";
import { PassageMetadataCompiler } from "./machines/passages/passage-metadata";
import { ChoiceMetadataCompiler } from "./machines/choices/choice-metadata";
import { MultiChoiceCompiler } from "./machines/choices/multi-choice";
import { ValueCompiler } from "./machines/object-builders/value";
import { ObjectCompiler } from "./machines/object-builders/object";
import { ListCompiler } from "./machines/object-builders/list";
import { StatefulCompiler } from "./machines/state/stateful";
import { InitStateCompiler } from "./machines/state/init-state";
import { EffectHandlerCompiler } from "./machines/state/effect-handler";
import { SetStateCompiler } from "./machines/state/set-state";
import { ReturnedEffectCompiler } from "./machines/state/returned-effect";
import { EffectCompiler } from "./machines/effects/effect";

export class StoryMachineRuntime {
  private registeredMachines: Map<string, StoryMachineCompiler> = new Map();

  constructor() {
    this.registerMachines(baseElements);
  }

  registerMachine(
    name: string | string[],
    compiler: StoryMachineCompiler
  ): void {
    const elementNames = Array.isArray(name) ? name : [name];
    for (const elName of elementNames) {
      this.registeredMachines.set(elName.toLowerCase(), compiler);
    }
  }

  registerMachines(machineDefs: Record<string, StoryMachineCompiler>): void {
    for (const [name, compiler] of Object.entries(machineDefs)) {
      this.registerMachine(name, compiler);
    }
  }

  getMachineCompilerForTypename(typename: string) {
    const compiler = this.registeredMachines.get(typename.toLowerCase());
    if (!compiler) {
      throw new Error(`Element type not supported: ${typename}`);
    }
    return compiler;
  }

  hasMachineCompilerForTypename(typename: string): boolean {
    return this.registeredMachines.has(typename.toLowerCase());
  }

  compileChildElements(elements: ElementTree[]): StoryMachine[] {
    const childMachines: StoryMachine[] = [];
    for (const element of elements) {
      const compiler = this.getMachineCompilerForTypename(element.type);
      const machine = compiler.compile(this, element);
      childMachines.push(machine);
    }
    return childMachines;
  }

  compileXML(xmlString: string): StoryMachine {
    const tree = parseXMLToTree(xmlString);
    return this.compileJSON(tree);
  }

  compileJSON(json: string | ElementTree): StoryMachine {
    let tree: ElementTree;
    if (typeof json === "string") {
      tree = JSON.parse(json);
    } else {
      tree = json;
    }

    const compiler = this.getMachineCompilerForTypename(tree.type);
    return compiler.compile(this, tree);
  }
}

const baseElements: Record<string, StoryMachineCompiler> = {
  Choice: ChoiceCompiler,
  ChoiceMetadata: ChoiceMetadataCompiler,
  Choices: ImmediateSelectorCompiler,
  ChoiceText: ChoiceTextCompiler,
  Condition: ConditionCompiler,
  Effect: EffectCompiler,
  EffectHandler: EffectHandlerCompiler,
  ImmediateSelector: ImmediateSelectorCompiler,
  ImmediateSequence: ImmediateSequenceCompiler,
  InitState: InitStateCompiler,
  List: ListCompiler,
  MultiChoice: MultiChoiceCompiler,
  Object: ObjectCompiler,
  Passage: PassageCompiler,
  PassageMetadata: PassageMetadataCompiler,
  PassageText: PassageTextCompiler,
  ReturnedEffect: ReturnedEffectCompiler,
  Selector: SelectorCompiler,
  Sequence: SequenceCompiler,
  SetContext: SetContextCompiler,
  SetState: SetStateCompiler,
  Stateful: StatefulCompiler,
  Text: TextCompiler,
  Value: ValueCompiler,
};
