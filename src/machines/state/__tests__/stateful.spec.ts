import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";

const runtime = new StoryMachineRuntime();

function createTestPlayer(story: string): TestPlayer {
  return new TestPlayer(runtime, story);
}

describe("Stateful", () => {
  describe("Initialization", () => {
    it("initializes state using the specified elements", () => {
      const story = `
        <Stateful>
          <InitState>
            <Object key="testValues">
              <Value key="val">"abc123"</Value>
              <Object key="obj">
                <Value key="nestedVal">456</Value>
                <Value key="otherVal">true</Value>
              </Object>
              <List key="list">
                <Value>"item 1"</Value>
                <Object>
                  <Value key="listObjVal">null</Value>
                </Object>
              </List>
            </Object>
          </InitState>
          <SetContext key="actualState">$state.testValues</SetContext>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentContext?.actualState).toEqual({
        val: "abc123",
        obj: {
          nestedVal: 456,
          otherVal: true,
        },
        list: ["item 1", { listObjVal: null }],
      });
    });
  });
  describe("Effect Handling", () => {
    it("creates an effect handler that can alter state", () => {});
    it("creates an effect handler that can return new effects", () => {});
    it("prevents state from being altered outside an effect handler", () => {});
    it("can add new keys to objects or new elements to arrays", () => {});
  });
  describe("Saving and loading", () => {});
  describe("Nesting", () => {});
});
