import { Context, ElementTree, Result, SaveData } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { createDevErrorEffect } from "../effects";
import { addEffectToOutput } from "../../utils/effects";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";
import { getFileFromContext } from "./utils";
import { createLoadFileEffect } from "./load-file";

interface ImportMachineAttributes extends StoryMachineAttributes {
  src: string;
  runtime: StoryMachineRuntime;
}

@StaticImplements<StoryMachineClass>()
export class ImportMachine extends StoryMachine<ImportMachineAttributes> {
  private machine: StoryMachine | undefined;
  private saveData: SaveData | undefined;

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { src } = tree.attributes;
    return new ImportMachine({ ...tree.attributes, src, runtime });
  }

  init(): void {
    this.machine = undefined;
    this.saveData = undefined;
  }

  save(saveData: SaveData): void {
    if (this.machine) {
      this.machine.save(saveData);
    }
  }

  load(saveData: SaveData): void {
    // Store the saveData on the class because the imported machine has not been compiled yet
    // We could keep the machine contents in save data, but that makes it impossible to
    // update the machine once it is saved
    this.saveData = saveData;
  }

  process(context: Context): Result {
    const { src } = this.attrs;

    if (this.machine) {
      return this.machine.process(context);
    }

    const fileContents = getFileFromContext(context, src);

    if (!fileContents) {
      addEffectToOutput(context, createLoadFileEffect({ src }));
      return { status: "Running" };
    }

    const machine = this.attrs.runtime.compileXML(fileContents);

    if (!(machine instanceof StoryMachine)) {
      createDevErrorEffect({ message: "Specified file is not a StoryMachine" });
      return { status: "Terminated" };
    }

    this.machine = machine;

    // Load save data to imported machine if necessary
    if (this.saveData) {
      this.machine.load(this.saveData);
    }

    return this.machine.process(context);
  }
}
