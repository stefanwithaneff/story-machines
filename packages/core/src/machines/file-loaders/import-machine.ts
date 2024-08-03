import { Context, ElementTree, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { updateContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { createDevErrorEffect } from "../effects";
import { GLOBAL_FILES_CONTEXT_KEY } from "./constants";
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
  private machineContents: string | undefined;
  private machine: StoryMachine | undefined;

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { src } = tree.attributes;
    return new ImportMachine({ ...tree.attributes, src, runtime });
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
    return this.machine.process(context);
  }
}
