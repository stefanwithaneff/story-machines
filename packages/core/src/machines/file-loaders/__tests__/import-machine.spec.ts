import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { LOAD_FILE } from "../load-file";
import { GLOBAL_FILES_CONTEXT_KEY } from "../constants";

const runtime = new StoryMachineRuntime();

describe("ImportMachine", () => {
  it("runs until the expected machine contents have been loaded", () => {
    const story = `<ImportMachine src="/test/machine" />`;
    const importedMachine = `<SetGlobalContext key="test">"abc"</SetGlobalContext>`;

    const player = new TestPlayer(runtime, story);
    player.tick();
    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.effects).toContainEqual({
      type: LOAD_FILE,
      payload: { src: "/test/machine" },
    });

    player.tick();
    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.effects).toContainEqual({
      type: LOAD_FILE,
      payload: { src: "/test/machine" },
    });

    player.tick({
      [GLOBAL_FILES_CONTEXT_KEY]: { "/test/machine": importedMachine },
    });
    expect(player.currentStatus).toEqual("Completed");
    expect(player.currentContext?.test).toEqual("abc");
  });

  it("does not produce a LOAD_FILE effect if the file content is already available in the context", () => {
    const story = `<ImportMachine src="/test/machine" />`;
    const importedMachine = `<SetGlobalContext key="test">"abc"</SetGlobalContext>`;

    const player = new TestPlayer(runtime, story);
    player.tick({
      [GLOBAL_FILES_CONTEXT_KEY]: { "/test/machine": importedMachine },
    });
    expect(player.currentStatus).toEqual("Completed");
    expect(player.currentContext?.test).toEqual("abc");
  });
});
