import { parseXMLToTree } from "./utils/parse-xml-to-tree";
import { StoryMachine } from "./machines/base-classes/story-machine";
import { ElementTree } from "./types";

export interface StoryMachineClass {
  new (...args: ConstructorParameters<typeof StoryMachine>): StoryMachine;
  compileNodeFromTree(
    runtime: StoryMachineRuntime,
    tree: ElementTree
  ): StoryMachine;
}

interface RegisterMachineOptions {
  aliases?: string[];
}

export class StoryMachineRuntime {
  private registeredMachines: Map<string, StoryMachineClass> = new Map();

  constructor() {
    this.registerMachines(baseElements);
  }

  registerMachine(
    classVal: StoryMachineClass,
    opts: RegisterMachineOptions = {}
  ): void {
    this.registeredMachines.set(classVal.name.toLowerCase(), classVal);
    const aliases = opts.aliases ?? [];
    for (const alias of aliases) {
      this.registeredMachines.set(alias.toLowerCase(), classVal);
    }
  }

  registerMachines(classes: StoryMachineClass[]): void {
    for (const classVal of classes) {
      this.registeredMachines.set(classVal.name.toLowerCase(), classVal);
    }
  }

  getMachineClassForTypename(typename: string) {
    const typeClass = this.registeredMachines.get(typename.toLowerCase());
    if (!typeClass) {
      throw new Error(`Element type not supported: ${typename}`);
    }
    return typeClass;
  }

  hasMachineClassForTypename(typename: string): boolean {
    return this.registeredMachines.has(typename.toLowerCase());
  }

  compileChildElements(elements: ElementTree[]): StoryMachine[] {
    const childMachines: StoryMachine[] = [];
    for (const element of elements) {
      const typeClass = this.getMachineClassForTypename(element.type);
      const machine = typeClass.compileNodeFromTree(this, element);
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

    const typeClass = this.getMachineClassForTypename(tree.type);
    return typeClass.compileNodeFromTree(this, tree);
  }
}

const baseElements: StoryMachineClass[] = [];
