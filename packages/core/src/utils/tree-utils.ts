import { StoryMachine } from "../base-classes";
import { SaveData } from "../types";

export function isOfType(machine: StoryMachine, type: symbol): boolean {
  return machine.machineTypes.includes(type);
}
