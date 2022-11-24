import { Context, ElementTree, Result, SaveData } from "../types";
import { StoryMachine, StoryMachineClass } from "../base-classes";
import { StaticImplements } from "../utils/static-implements";
import { StoryMachineRuntime } from "../runtime";

@StaticImplements<StoryMachineClass>()
export class Wait extends StoryMachine {
  private hasRun: boolean = false;

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    return new Wait({ ...tree.attributes });
  }

  init() {
    // Initing wait
    this.hasRun = false;
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      hasRun: this.hasRun,
    };
  }

  load(saveData: SaveData) {
    // Loading wait
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
