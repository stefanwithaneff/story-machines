import { parseXMLToTree } from "./utils/parse-xml-to-tree";
import { StoryMachine, StoryMachineCompiler } from "./base-classes";
import { ElementTree } from "./types";
import {
  CompletedCompiler,
  ConditionCompiler,
  DevLogCompiler,
  EffectCompiler,
  EffectHandlerCompiler,
  FallbackCompiler,
  ImmediateFallbackCompiler,
  ImmediateSequenceCompiler,
  InitStateCompiler,
  ListCompiler,
  NotCompiler,
  ObjectCompiler,
  OnceCompiler,
  ReturnedEffectCompiler,
  SequenceCompiler,
  SetContextCompiler,
  SetGlobalContextCompiler,
  SetStateCompiler,
  StatefulCompiler,
  TerminatedCompiler,
  ValueCompiler,
  WaitCompiler,
} from "./machines";

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
      if (Array.isArray(machine)) {
        childMachines.push(...machine);
      } else {
        childMachines.push(machine);
      }
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
    const machine = compiler.compile(this, tree);

    if (Array.isArray(machine)) {
      throw new Error("Compilation resulted in multiple root elements");
    }

    return machine;
  }
}

const baseElements: Record<string, StoryMachineCompiler> = {
  Completed: CompletedCompiler,
  Condition: ConditionCompiler,
  DevLog: DevLogCompiler,
  Effect: EffectCompiler,
  EffectHandler: EffectHandlerCompiler,
  ImmediateFallback: ImmediateFallbackCompiler,
  ImmediateSequence: ImmediateSequenceCompiler,
  InitState: InitStateCompiler,
  List: ListCompiler,
  Not: NotCompiler,
  Object: ObjectCompiler,
  Once: OnceCompiler,
  ReturnedEffect: ReturnedEffectCompiler,
  Fallback: FallbackCompiler,
  Sequence: SequenceCompiler,
  SetContext: SetContextCompiler,
  SetGlobalContext: SetGlobalContextCompiler,
  SetState: SetStateCompiler,
  Stateful: StatefulCompiler,
  Terminated: TerminatedCompiler,
  Value: ValueCompiler,
  Wait: WaitCompiler,
};
