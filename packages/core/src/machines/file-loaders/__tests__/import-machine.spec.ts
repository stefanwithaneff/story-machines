import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { LOAD_FILE } from "../load-file";
import { GLOBAL_FILES_CONTEXT_KEY } from "../constants";
import { SaveData } from "../../../types";

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

  it("saves the data of the imported machine and loads it to the imported machine", () => {
    const story = `<ImportMachine src="/test/machine" />`;
    const importedMachine = `
        <Stateful id="stateful">
          <InitialState>
            <Object key="values">
              <Value key="testNum">5</Value>
              <Value key="testStr">"hello"</Value>
            </Object>
          </InitialState>
          <EffectHandlers>
            <EffectHandler type="changeNum" payloadKey="payload">
              <SetState key="values.testNum">$ctx["payload"]["val"]</SetState>
            </EffectHandler>
          </EffectHandlers>
          <Effect type="changeNum">
            <Value key="val">18</Value>
          </Effect>
          <Wait id="stateful_wait" />
          <SetGlobalContext key="actualState">$state["values"]</SetGlobalContext>
        </Stateful>
      `;

    const expectedState = { values: { testNum: 18, testStr: "hello" } };

    const fileContext = {
      [GLOBAL_FILES_CONTEXT_KEY]: { "/test/machine": importedMachine },
    };

    const player = new TestPlayer(runtime, story);

    // Run one effect, Save data and check that it matches
    const saveData: SaveData = {};
    player.tick(fileContext).save(saveData);

    expect(player.currentStatus).toEqual("Running");
    expect(saveData["stateful"]).toEqual({
      state: expectedState,
    });

    // Init the story, Load data back in, and see if it picks up where it left off
    player.init().load(saveData).tick(fileContext);
    expect(player.currentStatus).toEqual("Completed");
    expect(player.currentContext?.actualState).toEqual(expectedState.values);
  });

  it("saves nothing if the machine has not been imported yet", () => {
    const story = `<ImportMachine src="/test/machine" />`;
    const importedMachine = `
        <Stateful id="stateful">
          <InitialState>
            <Object key="values">
              <Value key="testNum">5</Value>
              <Value key="testStr">"hello"</Value>
            </Object>
          </InitialState>
          <EffectHandlers>
            <EffectHandler type="changeNum" payloadKey="payload">
              <SetState key="values.testNum">$ctx["payload"]["val"]</SetState>
            </EffectHandler>
          </EffectHandlers>
          <Effect type="changeNum">
            <Value key="val">18</Value>
          </Effect>
          <Wait id="stateful_wait" />
          <SetGlobalContext key="actualState">$state["values"]</SetGlobalContext>
        </Stateful>
      `;
    const player = new TestPlayer(runtime, story);

    // Run one effect, Save data and check that it matches
    const saveData: SaveData = {};
    player.tick().save(saveData);

    expect(saveData).toEqual({});
  });
});
