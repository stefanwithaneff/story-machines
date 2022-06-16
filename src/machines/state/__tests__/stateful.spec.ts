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
          <SetGlobalContext key="actualState">$state.testValues</SetGlobalContext>
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
    it("creates an effect handler that can alter state", () => {
      const story = `
        <Stateful>
          <InitState>
            <Value key="test">"abc123"</Value>
          </InitState>
          <EffectHandler type="testEffect">
            <SetState key="test">$ctx.INCOMING_EFFECT_PAYLOAD.val</SetState>
          </EffectHandler>
          <SetGlobalContext key="actualState">$state.test</SetGlobalContext>
          <Wait />
          <Effect type="testEffect">
            <Value key="val">"xyz456"</Value>
          </Effect>
          <Wait />
          <SetGlobalContext key="actualState">$state.test</SetGlobalContext>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toBe("Running");
      expect(player.currentContext?.actualState).toEqual("abc123");

      player.tick();

      expect(player.currentStatus).toBe("Running");

      player.tick();

      expect(player.currentContext?.actualState).toEqual("xyz456");
    });
    it("creates multiple effect handlers if specified", () => {});
    it("allows the specifying of the payload key for the incoming Effect", () => {});
    it("creates an effect handler that can return new effects", () => {});
    it("prevents state from being altered outside an effect handler", () => {});
    it("can add new keys to objects or new elements to arrays", () => {});
  });
  describe("Saving and loading", () => {
    it("loads a save with the correct state", () => {});
    it("initializes values that were added after a save has been created", () => {});
  });
  describe("Nesting", () => {});
});
