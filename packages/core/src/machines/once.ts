import { DecoratorMachine, StoryMachineCompiler } from "../base-classes";
import { Context, Result, SaveData, StoryMachineStatus } from "../types";

export class Once extends DecoratorMachine {
  private status: StoryMachineStatus = "Running";

  save(saveData: SaveData) {
    saveData[this.id] = {
      status: this.status,
    };

    if (this.status === "Running") {
      super.save(saveData);
    }
  }

  load(saveData: SaveData) {
    const { status } = saveData[this.id];
    this.status = status;

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

export const OnceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const [child] = runtime.compileChildElements(tree.elements);
    return new Once({ ...tree.attributes, child });
  },
};
