import { DecoratorMachine } from "../base-classes/decorator-machine";
import { Context, Result, SaveData, StoryMachineStatus } from "../../types";

export class Once extends DecoratorMachine {
  private status: StoryMachineStatus = "Running";

  save(saveData: SaveData) {
    saveData[this.id] = {
      status: this.status,
    };

    if (this.status === "Running") {
      this.child.save(saveData);
    }
  }

  load(saveData: SaveData) {
    const { status } = saveData[this.id];
    this.status = status;

    if (this.status === "Running") {
      this.child.load(saveData);
    }
  }

  process(context: Context): Result {
    if (this.status === "Running") {
      const result = this.child.process(context);
      this.status = result.status;
      return result;
    }
    return { status: this.status };
  }
}
