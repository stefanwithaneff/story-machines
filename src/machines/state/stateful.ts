import { StoryMachineRuntime } from "../../runtime";
import { HandlerMap, SaveData } from "../../types";
import {
  createConditionalMachine,
  createStoryMachine,
} from "../../utils/create-story-machine";
import { handleEffects } from "../../utils/effects";
import { getFromContext } from "../../utils/scope";
import { isOfType } from "../../utils/tree-utils";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Fallback } from "../base-machines/fallback";
import { ImmediateSequence } from "../base-machines/immediate-sequence";
import { MemorySequence } from "../base-machines/memory-sequence";
import { Sequence } from "../base-machines/sequence";
import { Scoped } from "../context/scoped";
import { SetContextInternal } from "../context/set-context";
import {
  HandlerEntry,
  HANDLERS,
  INITIAL_STATE,
  STATE,
  STATE_BUILDER,
} from "./constants";

interface StatefulAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
}

// TODO: Figure out a way to combine State and Stateful
export class Stateful extends ProcessorMachine<StatefulAttributes> {
  private initialized: boolean = false;
  private state: Record<string, any> = {};
  private handlers: HandlerMap = {};

  init() {
    this.initialized = false;
    this.state = {};
    this.handlers = {};
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      state: this.state,
    };
    super.save(saveData);
  }

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    const { state } = saveData[this.id];
    this.state = state;
    super.load(saveData, runtime);
  }

  private createInitializerProcessor(): StoryMachine {
    // Initialize state if it hasn't been already
    return new Scoped({
      child: new Fallback({
        children: [
          createConditionalMachine(() => this.initialized),
          new Sequence({
            children: [
              ...this.attrs.builders,
              createStoryMachine((context) => {
                const state = getFromContext(context, INITIAL_STATE);
                const handlers: HandlerEntry[] =
                  getFromContext(context, HANDLERS) ?? [];

                if (!state) {
                  return { status: "Terminated" };
                }

                this.state = { ...state, ...this.state };
                for (const { type, handler } of handlers) {
                  this.handlers[type] = handler;
                }
                this.initialized = true;
                return { status: "Completed" };
              }),
            ],
          }),
        ],
      }),
    });
  }

  private createNodesProcessor(): StoryMachine {
    // Expose State via Context, run the children, and handle any effects
    return new Scoped({
      child: new ImmediateSequence({
        children: [
          new SetContextInternal({ key: STATE, valFn: () => this.state }),
          new MemorySequence({
            id: this.generateId("memory_seq"),
            children: this.attrs.nodes,
          }),
          createStoryMachine((context) => {
            try {
              handleEffects(context, this.handlers);
              return { status: "Completed" };
            } catch (e) {
              return { status: "Terminated" };
            }
          }),
        ],
      }),
    });
  }

  protected createProcessor() {
    return new Sequence({
      children: [
        this.createInitializerProcessor(),
        this.createNodesProcessor(),
      ],
    });
  }
}

export const StatefulCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    const builders = children.filter((child) => isOfType(child, STATE_BUILDER));
    const nodes = children.filter((child) => !isOfType(child, STATE_BUILDER));

    return new Stateful({ ...tree.attributes, builders, nodes });
  },
};
