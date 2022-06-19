import { Context, Result, SaveData } from "../types";
import { StoryMachine, StoryMachineCompiler } from "../base-classes";

export class Wait extends StoryMachine {
  private hasRun: boolean = false;

  init() {
    this.hasRun = false;
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      hasRun: this.hasRun,
    };
  }

  load(saveData: SaveData) {
    const data = saveData[this.id];

    this.hasRun = data?.hasRun ?? false;
  }

  process(_: Context): Result {
    if (this.hasRun) {
      return { status: "Completed" };
    }
    this.hasRun = true;
    return { status: "Running" };
  }
}

export const WaitCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Wait({ ...tree.attributes });
  },
};
