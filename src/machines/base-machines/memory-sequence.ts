import { CompositeMachine } from "../base-classes/composite-machine";
import { Context, Result, SaveData, StoryMachineStatus } from "../../types";

export class MemorySequence extends CompositeMachine {
  private index = 0;
  private status: StoryMachineStatus = "Running";

  init() {
    super.init();
    this.index = 0;
    this.status = "Running";
  }

  save(saveData: SaveData): void {
    saveData[this.id] = {
      index: this.index,
      status: this.status,
    };

    if (this.status === "Running") {
      this.children[this.index].save(saveData);
    }
  }

  load(saveData: SaveData): void {
    const data = saveData[this.id];
    this.index = data?.index ?? 0;
    this.status = data?.status ?? "Running";

    if (this.status === "Running") {
      this.children[this.index].load(saveData);
    }
  }

  _process(context: Context): Result {
    for (; this.index < this.children.length; this.index++) {
      const child = this.children[this.index];
      const result = child.process(context);

      if (result.status === "Running" || result.status === "Terminated") {
        return result;
      }
    }
    return { status: "Completed" };
  }
  process(context: Context): Result {
    if (this.status !== "Running") {
      return { status: this.status };
    }
    const result = this._process(context);
    this.status = result.status;
    return result;
  }
}
