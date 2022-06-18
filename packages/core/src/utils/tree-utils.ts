import { StoryMachine } from "../base-classes";
import { SaveData } from "../types";

export function isOfType(machine: StoryMachine, type: symbol): boolean {
  return machine.machineTypes.includes(type);
}

export function initAll(machines: StoryMachine[]) {
  for (const machine of machines) {
    machine.init();
  }
}

export function saveAll(saveData: SaveData, machines: StoryMachine[]) {
  for (const machine of machines) {
    machine.save(saveData);
  }
}

export function loadAll(saveData: SaveData, machines: StoryMachine[]) {
  for (const machine of machines) {
    machine.load(saveData);
  }
}
