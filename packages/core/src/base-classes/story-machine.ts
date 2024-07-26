import { nanoid } from "nanoid";
import { StoryMachineRuntime } from "../runtime";
import { Context, Result, ElementTree, SaveData } from "../types";

export interface StoryMachineAttributes {
  id?: string;
  textContent?: string;
  metadata?: Record<string, any>;
}

export type StoryMachineMetadata<A extends StoryMachineAttributes> =
  A["metadata"];

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
  getData(): StoryMachineMetadata<A> {
    // Deconstruct metadata into a new object to avoid allowing edits to original attributes object
    return { ...this.attrs.metadata };
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
