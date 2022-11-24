import { StoryMachine } from "../../base-classes";
import { StoryMachineRuntime } from "../../runtime";

const runtime = new StoryMachineRuntime();

describe("Machine", () => {
  it("returns a key-machine pair", () => {
    const xml = `
      <Machine key="test">
        <Completed />
      </Machine>
    `;

    const result = runtime.compileXML(xml);
    expect(result).toEqual({ test: expect.any(StoryMachine) });
  });
});
