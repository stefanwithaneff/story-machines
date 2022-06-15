import { Story } from "inkjs/engine/Story";
import * as Ink from "inkjs";
import { Context, Result, SaveData } from "../../types";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { InitScopeInternal } from "../base-machines/init-scope";
import { INK_INITIALIZER, INK_STORY } from "./constants";

export class InkStory extends ProcessorMachine {
  private story: Story;
  machineTypes: symbol[] = [INK_INITIALIZER];

  constructor(attrs: StoryMachineAttributes) {
    super(attrs);
    this.story = new Ink.Compiler(this.attrs.textContent ?? "").Compile();
  }

  init() {
    this.story = new Ink.Compiler(this.attrs.textContent ?? "").Compile();
  }
  save(saveData: SaveData) {
    saveData[this.id] = {
      json: this.story.state.ToJson(),
    };
  }
  load(saveData: SaveData) {
    const { json } = saveData[this.id];

    this.story.state.LoadJson(json);
  }
  protected createProcessor() {
    return new InitScopeInternal({
      key: INK_STORY,
      getter: () => this.story,
    });
  }
}

export const InkStoryCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new InkStory({ ...tree.attributes });
  },
};
