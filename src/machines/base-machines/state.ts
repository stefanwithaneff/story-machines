import { getOutputBuilder } from "../../utils/output-builder";
import { Context, ProcessFn, Result, Effect, EffectHandler } from "../../types";
import { EffectHandlerMachine } from "../base-classes/effect-handler-machine";

const INITIALIZE_STATE = "@State/INITIALIZE_STATE";
const SET_STATE = "@State/SET_STATE";

// TODO: Implement State

// export class State extends EffectHandlerMachine {
//   private state: any = {};
//   protected handlers = handlers;

//   private initializeState(effect: Effect): Effect[] {

//   }
// }
