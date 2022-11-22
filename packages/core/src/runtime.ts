import { parseXMLToTree } from "./utils/parse-xml-to-tree";
import { Compilable, CompilationResult, StoryMachine } from "./base-classes";
import { ElementTree } from "./types";
import {
  Completed,
  Condition,
  DevLog,
  EffectHandler,
  EffectHandlers,
  EffectMachine,
  Fallback,
  ImmediateFallback,
  ImmediateSequence,
  InitialState,
  LoopTilTerminated,
  MemoryFallback,
  MemorySequence,
  Not,
  Once,
  ReturnedEffect,
  Running,
  Scoped,
  Sequence,
  SetContext,
  SetGlobalContext,
  SetStateCompiler,
  Stateful,
  Terminated,
  Wait,
} from "./machines";
import {
  List,
  Machine,
  Metadata,
  ObjectElement,
  Text,
  Value,
} from "./data-elements";

export class StoryMachineRuntime {
  private registeredElements: Map<string, Compilable> = new Map();

  constructor() {
    this.registerElements(baseElements);
  }

  registerElement(name: string | string[], compiler: Compilable): void {
    const elementNames = Array.isArray(name) ? name : [name];
    for (const elName of elementNames) {
      this.registeredElements.set(elName.toLowerCase(), compiler);
    }
  }

  registerElements(machineDefs: Record<string, Compilable>): void {
    for (const [name, compiler] of Object.entries(machineDefs)) {
      this.registerElement(name, compiler);
    }
  }

  getCompilerForTypename(typename: string) {
    const compiler = this.registeredElements.get(typename.toLowerCase());
    if (!compiler) {
      throw new Error(`Element type not supported: ${typename}`);
    }
    return compiler;
  }

  hasCompilerForTypename(typename: string): boolean {
    return this.registeredElements.has(typename.toLowerCase());
  }

  compileChildElements(elements: ElementTree[]): {
    children: StoryMachine[];
    data: Record<string, any>;
  } {
    const children: StoryMachine[] = [];
    let data: Record<string, any> = {};
    for (const element of elements) {
      const compiler = this.getCompilerForTypename(element.type);
      const machineOrData = compiler.compile(this, element);
      if (machineOrData instanceof StoryMachine) {
        children.push(machineOrData);
      } else {
        data = { ...data, ...machineOrData };
      }
    }
    return { children, data };
  }

  compileXML(xmlString: string): CompilationResult {
    const tree = parseXMLToTree(xmlString);
    return this.compileJSON(tree);
  }

  compileJSON(json: string | ElementTree): CompilationResult {
    let tree: ElementTree;
    if (typeof json === "string") {
      tree = JSON.parse(json);
    } else {
      tree = json;
    }

    const compiler = this.getCompilerForTypename(tree.type);
    const result = compiler.compile(this, tree);

    return result;
  }
}

const baseElements: Record<string, Compilable> = {
  Completed,
  Condition,
  DevLog,
  Effect: EffectMachine,
  EffectHandler,
  EffectHandlers,
  Fallback,
  ImmediateFallback,
  ImmediateSequence,
  InitialState,
  List,
  LoopTilTerminated,
  Machine,
  Metadata,
  MemoryFallback,
  MemorySequence,
  Not,
  Object: ObjectElement,
  Once,
  ReturnedEffect,
  Running,
  Scoped,
  Sequence,
  SetContext,
  SetGlobalContext,
  SetState: SetStateCompiler,
  Stateful,
  Terminated,
  Text,
  Value,
  Wait,
};
