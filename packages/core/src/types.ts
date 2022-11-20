export type StoryMachineStatus = "Running" | "Completed" | "Terminated";

type AnyRecord = Record<string, any>;

interface TypedPayload<T extends AnyRecord> {
  type: string;
  payload: T;
}

export type Effect<T extends AnyRecord = AnyRecord> = TypedPayload<T>;
export type Input<T extends AnyRecord = AnyRecord> = TypedPayload<T>;

export interface Output extends Record<string, any> {
  effects: Effect[];
}

export interface Scope {
  id: string;
  scope: Record<string, any>;
}

export interface Context extends AnyRecord {
  output: Output;
  input?: Input;
  __SCOPES__: Scope[];
}

export interface Result {
  status: StoryMachineStatus;
}

export interface ElementTree {
  type: string;
  attributes: AnyRecord;
  elements: ElementTree[];
}

export type SaveData = AnyRecord;

export type ProcessFn = (context: Context) => Result;

export type EffectHandlerFn = (context: Context, effect: Effect) => Effect[];
export type HandlerMap = Record<string, EffectHandlerFn | undefined>;
