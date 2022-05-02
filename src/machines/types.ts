export type StoryMachineStatus =
  | "Uninitialized"
  | "Active"
  | "Idle"
  | "Transitioning"
  | "Done";

export interface StoryMachine<Input, Output, ExternalState, InternalState> {
  internalState: InternalState;

  start(externalState: ExternalState): Output;
  next(externalState: ExternalState, input?: Input): Output;
  getCurrentOutput(): Output;
  save(): any;
  load(savedState: any): void;
}

export interface Choice {
  key: number | string | Symbol;
  description: string;
  metadata: object;
}

export interface Effect<T = {}> {
  type: string | Symbol;
  payload: T;
}

export interface ChoiceBasedStoryResult {
  status: StoryMachineStatus;
  passages: string[];
  choices: Choice[];
  effects: Effect[];
}

export type ChoiceBasedStoryMachine<
  ExternalState = any,
  InternalState = any
> = StoryMachine<Choice, ChoiceBasedStoryResult, ExternalState, InternalState>;
