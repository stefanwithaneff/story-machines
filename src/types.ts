export type StoryMachineStatus = "Running" | "Completed" | "Terminated";

export type Metadata = Record<string, any>;

export interface Passage {
  text: string;
  metadata: Metadata;
}

export interface Choice {
  id: string;
  text: string;
  metadata: Metadata;
}

export interface Effect<T extends Record<string, any> = Record<string, any>> {
  type: string;
  payload: T;
}

export interface ChoiceInput {
  type: "Choice";
  payload: {
    id: string;
  };
}

export type Input = ChoiceInput;

export interface Output {
  passages: Passage[];
  choices: Choice[];
  effects: Effect[];
}

export interface Context extends Record<string, any> {
  output: Output;
  input?: Input;
}

export interface Result {
  status: StoryMachineStatus;
}

export interface ElementTree {
  type: string;
  attributes: Record<string, any>;
  elements: ElementTree[];
}

export type SaveData = Record<string, any>;

export type ProcessFn = (context: Context) => Result;

export type ProcessorFactory<A extends any[] = []> = (
  ...args: [...A]
) => ProcessFn;
export type DecoratorFactory<A extends any[] = []> = (
  fn: ProcessFn,
  ...args: [...A]
) => ProcessFn;
export type CompositeFactory<A extends any[] = []> = (
  fns: ProcessFn[],
  ...args: [...A]
) => ProcessFn;

export type EffectHandlerFn = (context: Context, effect: Effect) => Effect[];
