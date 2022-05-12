export type StoryMachineStatus = "Running" | "Completed" | "Terminated";

export type ID = number | string | Symbol;

export type Metadata = Record<string, any>;

export interface Choice {
  id: ID;
  text: string;
  metadata: Metadata;
}

export interface Effect<T = any> {
  type: string | Symbol;
  payload: T;
}

export interface ChoiceInput {
  type: "Choice";
  payload: {
    id: ID;
  };
}

export type Input = ChoiceInput;

export interface Output {
  text: string[];
  choices: Choice[];
  effects: Effect[];
  metadata: Metadata;
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
