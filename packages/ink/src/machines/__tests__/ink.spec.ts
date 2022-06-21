import { StoryMachineRuntime } from "@story-machines/core";
import { InkElements } from "../..";

const runtime = new StoryMachineRuntime();
runtime.registerMachines(InkElements);

describe("Ink machines", () => {});
