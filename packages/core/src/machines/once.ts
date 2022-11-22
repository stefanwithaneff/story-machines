import { DecoratorMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import {
  Context,
  ElementTree,
  Result,
  SaveData,
  StoryMachineStatus,
} from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<StoryMachineClass>()
export class Once extends DecoratorMachine {
  private status: StoryMachineStatus = "Running";

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new Once({ ...tree.attributes, child: children[0] });
  }

  init() {
    this.status = "Running";
    super.init();
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      status: this.status,
    };

    if (this.status === "Running") {
      super.save(saveData);
    }
  }

  load(saveData: SaveData) {
    const data = saveData[this.id];
    this.status = data?.status ?? "Running";

    if (this.status === "Running") {
      super.load(saveData);
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
