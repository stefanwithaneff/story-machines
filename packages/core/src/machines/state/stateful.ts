import { ElementTree, HandlerMap, SaveData } from "../../types";
import {
  createConditionalMachine,
  createStoryMachine,
} from "../../utils/create-story-machine";
import { handleEffects } from "../../utils/effects";
import {
  ProcessorMachine,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { Fallback } from "../fallback";
import { ImmediateSequence } from "../immediate-sequence";
import { MemorySequence } from "../memory-sequence";
import { Sequence } from "../sequence";
import { Scoped, SetContextInternal } from "../context";
import { HandlerEntry, STATE } from "./constants";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";
import { recursivelyCalculateExpressions } from "../../utils/expression-parser";

interface StatefulAttributes extends StoryMachineAttributes {
  children: StoryMachine[];
  initialState: Record<string, any>;
  effectHandlers: HandlerEntry[];
}

@StaticImplements<StoryMachineClass>()
export class Stateful extends ProcessorMachine<StatefulAttributes> {
  private initialized: boolean = false;
  private state: Record<string, any> = {};
  private handlers: HandlerMap = this.getHandlerMap();

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children, data } = runtime.compileChildElements(tree.elements);

    const initialState = data.initialState ?? {};
    const effectHandlers = data.effectHandlers ?? [];

    return new Stateful({
      ...tree.attributes,
      children,
      effectHandlers,
      initialState,
    });
  }

  init() {
    this.initialized = false;
    this.state = {};
    this.handlers = this.getHandlerMap();
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      state: this.state,
    };
    super.save(saveData);
  }

  load(saveData: SaveData) {
    const { state } = saveData[this.id];
    this.state = state;
    super.load(saveData);
  }

  private getHandlerMap(): HandlerMap {
    return Object.fromEntries(
      this.attrs.effectHandlers.map(({ type, handler }) => [type, handler])
    );
  }

  private createInitializerProcessor(): StoryMachine {
    // Initialize state if it hasn't been already
    return new Scoped({
      child: new Fallback({
        children: [
          createConditionalMachine(() => this.initialized),
          createStoryMachine((context) => {
            const initialState = recursivelyCalculateExpressions(
              context,
              this.attrs.initialState
            );
            // Patch existing state over initial state to allow loaded save data to override
            // existing state while still allowing new state keys to be filled in
            this.state = { ...initialState, ...this.state };
            this.initialized = true;
            return { status: "Completed" };
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
            children: this.attrs.children,
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
