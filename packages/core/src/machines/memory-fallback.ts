import { CompositeMachine, StoryMachineCompiler } from "../base-classes";
import { Context, Result, SaveData, StoryMachineStatus } from "../types";

export class MemoryFallback extends CompositeMachine {
  private index = 0;
  private status: StoryMachineStatus = "Running";

  init() {
    super.init();
    this.index = 0;
    this.status = "Running";
  }

  save(saveData: SaveData): void {
    const currentChild = this.children[this.index];
    saveData[this.id] = {
      currentId: currentChild.id,
      status: this.status,
    };

    if (this.status === "Running") {
      currentChild.save(saveData);
    }
  }

  load(saveData: SaveData): void {
    const data = saveData[this.id];
    const currentIndex = this.children.findIndex(
      (child) => child.id === data?.currentId
    );
    this.index = currentIndex !== -1 ? currentIndex : 0;
    this.status = data?.status ?? "Running";

    if (this.status === "Running") {
      this.children[this.index].load(saveData);
    }
  }

  _process(context: Context): Result {
    for (; this.index < this.children.length; this.index++) {
      const child = this.children[this.index];
      const result = child.process(context);

      if (result.status === "Running" || result.status === "Completed") {
        return result;
      }
    }
    return { status: "Terminated" };
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

export const MemoryFallbackCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new MemoryFallback({ ...tree.attributes, children });
  },
};
