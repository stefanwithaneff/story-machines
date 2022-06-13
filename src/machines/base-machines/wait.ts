import { Context, Result, SaveData } from "../../types";
import { StoryMachine } from "../base-classes/story-machine";

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
    const { hasRun } = saveData[this.id];

    this.hasRun = hasRun;
  }

  process(_: Context): Result {
    if (this.hasRun) {
      return { status: "Completed" };
    }
    this.hasRun = true;
    return { status: "Running" };
  }
}
