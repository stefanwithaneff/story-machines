import { nanoid } from "nanoid";
import { StoryMachineRuntime } from "../runtime";
import { Context, Result, ElementTree, SaveData } from "../types";

export interface StoryMachineAttributes {
  id?: string;
  textContent?: string;
}

export abstract class StoryMachine<
  A extends StoryMachineAttributes = StoryMachineAttributes
> {
  id: string;
  attrs: A;
  machineTypes: symbol[] = [];

  constructor(attributes: A) {
    this.id = attributes.id ?? nanoid();
    this.attrs = attributes;
  }

  abstract process(context: Context): Result;
  init(): void {}
  save(saveData: SaveData): void {}
  load(saveData: SaveData): void {}
  getData(): A {
    return this.attrs;
  }
}

export interface CompilableClass {
  compile(runtime: StoryMachineRuntime, tree: ElementTree): any;
}

export interface StoryMachineClass extends CompilableClass {
  compile(runtime: StoryMachineRuntime, tree: ElementTree): StoryMachine;
}

export interface DataElementClass extends CompilableClass {
  compile(runtime: StoryMachineRuntime, tree: ElementTree): Record<string, any>;
}

export type Compilable = StoryMachineClass | DataElementClass;

export type CompilationResult = ReturnType<Compilable["compile"]>;

export interface StoryMachineCompiler {
  compile(
    runtime: StoryMachineRuntime,
    tree: ElementTree
  ): StoryMachine<any> | StoryMachine<any>[];
}
