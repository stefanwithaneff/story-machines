import { StoryMachine } from "../machines/base-classes/story-machine";

export function isOfType(machine: StoryMachine, type: symbol): boolean {
  console.log(machine.machineTypes);
  console.log(type);
  return machine.machineTypes.includes(type);
}
