import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { SaveData } from "../../../types";
import { DEV_ERROR } from "../../effects";

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
            <NestedObject key="testValues">
              <NestedValue key="val">"abc123"</NestedValue>
              <NestedObject key="obj">
                <NestedValue key="nestedVal">456</NestedValue>
                <NestedValue key="otherVal">true</NestedValue>
              </NestedObject>
              <NestedList key="list">
                <Value>"item 1"</Value>
                <Object>
                  <NestedValue key="listObjVal">null</NestedValue>
                </Object>
              </NestedList>
            </NestedObject>
          </InitState>
          <SetGlobalContext key="actualState">$state["testValues"]</SetGlobalContext>
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
    it("terminates if the InitState element terminates", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="test">true</NestedValue>
            <Terminated />
          </InitState>
          <SetGlobalContext key="actualState">$state["testValues"]</SetGlobalContext>
        </Stateful>
      `;

      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Terminated");
    });
    it("terminates if no initial state is declared", () => {
      const story = `
        <Stateful>
          <Completed />
        </Stateful>
      `;

      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Terminated");
    });
  });
  describe("Effect Handling", () => {
    it("creates an effect handler that can alter state", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="test">"abc123"</NestedValue>
          </InitState>
          <EffectHandler type="testEffect">
            <SetState key="test">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</SetState>
          </EffectHandler>
          <SetGlobalContext key="actualState">$state["test"]</SetGlobalContext>
          <Wait />
          <Effect type="testEffect">
            <NestedValue key="val">"xyz456"</NestedValue>
          </Effect>
          <Wait />
          <SetGlobalContext key="actualState">$state["test"]</SetGlobalContext>
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
    it("creates multiple effect handlers if specified", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedObject key="values">
              <NestedValue key="test">"abc123"</NestedValue>
              <NestedValue key="test2">true</NestedValue>
            </NestedObject>
          </InitState>
          <EffectHandler type="testEffect">
            <SetState key="values.test">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</SetState>
          </EffectHandler>
          <EffectHandler type="testEffect2">
            <SetState key="values.test2">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</SetState>
          </EffectHandler>
          <Effect type="testEffect">
            <NestedValue key="val">"xyz456"</NestedValue>
          </Effect>
          <Effect type="testEffect2">
            <NestedValue key="val">7</NestedValue>
          </Effect>
          <Wait />
          <SetGlobalContext key="actualState">$state["values"]</SetGlobalContext>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick().tick();

      expect(player.currentContext?.actualState).toEqual({
        test: "xyz456",
        test2: 7,
      });
    });
    it("allows the specifying of the payload key for the incoming Effect", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedObject key="values">
              <NestedValue key="defaultKey">"abc123"</NestedValue>
              <NestedValue key="newKey">true</NestedValue>
            </NestedObject>
          </InitState>
          <EffectHandler type="testEffect" payloadKey="effectPayload">
            <SetState key="values.defaultKey">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</SetState>
            <SetState key="values.newKey">$ctx["effectPayload"]["val"]</SetState>
          </EffectHandler>
          <Effect type="testEffect">
            <NestedValue key="val">"testPayload"</NestedValue>
          </Effect>
          <Wait />
          <SetGlobalContext key="actualState">$state["values"]</SetGlobalContext>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick().tick();

      expect(player.currentContext?.actualState).toEqual({
        defaultKey: null,
        newKey: "testPayload",
      });
    });
    it("creates an effect handler that can return new effects", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="test">"abc123"</NestedValue>
          </InitState>
          <EffectHandler type="testEffect">
            <ReturnedEffect type="testReturn">
              <NestedValue key="payloadDump">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</NestedValue>
            </ReturnedEffect>
            <ReturnedEffect type="secondReturn">
              <NestedList key="list">
                <Value>$state["test"]</Value>
              </NestedList>
            </ReturnedEffect>
          </EffectHandler>
          <Effect type="testEffect">
            <NestedValue key="val">"xyz456"</NestedValue>
          </Effect>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentOutput?.effects).toEqual([
        { type: "testReturn", payload: { payloadDump: "xyz456" } },
        { type: "secondReturn", payload: { list: ["abc123"] } },
      ]);
    });
    it("terminates if a provided key does not exist in state", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="test">"abc123"</NestedValue>
          </InitState>
          <EffectHandler type="testEffect">
            <SetState key="missing">null</SetState>
          </EffectHandler>
          <Effect type="testEffect">
            <NestedValue key="val">"xyz456"</NestedValue>
          </Effect>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentOutput?.effects).toContainEqual({
        type: DEV_ERROR,
        payload: { message: expect.stringContaining("key does not exist") },
      });
    });
    it("terminates if a returned effect terminates", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="test">"abc123"</NestedValue>
          </InitState>
          <EffectHandler type="testEffect">
            <ReturnedEffect type="testReturn">
              <NestedValue key="payloadDump">$ctx["INCOMING_EFFECT_PAYLOAD"]["val"]</NestedValue>
              <Terminated />
            </ReturnedEffect>
          </EffectHandler>
          <Wait />
          <Effect type="testEffect">
            <Value key="val">"xyz456"</Value>
          </Effect>
        </Stateful>
      `;
      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Running");

      player.tick();

      expect(player.currentStatus).toEqual("Terminated");
    });
    it("can add new keys to objects", () => {});
    it("can add new elements to arrays", () => {});
  });
  describe("Saving and loading", () => {
    it("loads a save with the correct state", () => {
      const story = `
        <Stateful id="stateful">
          <InitState>
            <NestedObject key="values">
              <NestedValue key="testNum">5</NestedValue>
              <NestedValue key="testStr">"hello"</NestedValue>
            </NestedObject>
          </InitState>
          <EffectHandler type="changeNum" payloadKey="payload">
            <SetState key="values.testNum">$ctx["payload"]["val"]</SetState>
          </EffectHandler>
          <Effect type="changeNum">
            <NestedValue key="val">18</NestedValue>
          </Effect>
          <Wait id="stateful_wait" />
          <SetGlobalContext key="actualState">$state["values"]</SetGlobalContext>
        </Stateful>
      `;

      const expectedState = { values: { testNum: 18, testStr: "hello" } };

      const player = createTestPlayer(story);

      // Run one effect, Save data and check that it matches
      const saveData: SaveData = {};
      player.tick().save(saveData);

      expect(player.currentStatus).toEqual("Running");
      expect(saveData["stateful"]).toEqual({
        state: expectedState,
      });

      // Init the story, Load data back in, and see if it picks up where it left off
      player.init().load(saveData).tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext?.actualState).toEqual(expectedState.values);
    });

    it("initializes values that were added after a save has been created", () => {
      const story = `
        <Stateful id="stateful">
          <InitState>
            <NestedValue key="testNum">5</NestedValue>
          </InitState>
          <EffectHandler type="changeNum" payloadKey="payload">
            <SetState key="testNum">$ctx["payload"]["val"]</SetState>
          </EffectHandler>
          <Effect type="changeNum">
            <NestedValue key="val">18</NestedValue>
          </Effect>
          <Wait id="stateful_wait" />
          <SetGlobalContext key="actualState">$state["testNum"]</SetGlobalContext>
        </Stateful>
      `;

      const player = createTestPlayer(story);

      // Run one effect, Save data and check that it matches
      const saveData: SaveData = {};
      player.tick().save(saveData);

      const updatedStory = `
        <Stateful id="stateful">
          <InitState>
            <NestedValue key="testNum">5</NestedValue>
            <NestedValue key="testAddedVal">"new state"</NestedValue>
          </InitState>
          <EffectHandler type="changeNum" payloadKey="payload">
            <SetState key="testNum">$ctx["payload"]["val"]</SetState>
          </EffectHandler>
          <Effect type="changeNum">
            <NestedValue key="val">18</NestedValue>
          </Effect>
          <Wait id="stateful_wait" />
          <SetGlobalContext key="testNum">$state["testNum"]</SetGlobalContext>
          <SetGlobalContext key="testAddedVal">$state["testAddedVal"]</SetGlobalContext>
        </Stateful>
      `;

      const updatedPlayer = createTestPlayer(updatedStory);
      updatedPlayer.load(saveData).tick();

      expect(updatedPlayer.currentStatus).toEqual("Completed");
      expect(updatedPlayer.currentContext?.testNum).toEqual(18);
      expect(updatedPlayer.currentContext?.testAddedVal).toEqual("new state");
    });
  });
  describe("Nesting", () => {
    it("allows access to higher level state", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="val">5</NestedValue>
          </InitState>
          <Stateful>
            <InitState>
              <NestedValue key="otherVal">7</NestedValue>
            </InitState>
            <SetGlobalContext key="val">$state["val"]</SetGlobalContext>
            <SetGlobalContext key="otherVal">$state["otherVal"]</SetGlobalContext>
          </Stateful>
        </Stateful>
      `;

      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toEqual(
        expect.objectContaining({ val: 5, otherVal: 7 })
      );
    });
    it("shadows higher level state with more local state", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="val">5</NestedValue>
          </InitState>
          <Stateful>
            <InitState>
              <NestedValue key="val">7</NestedValue>
            </InitState>
            <SetGlobalContext key="val">$state["val"]</SetGlobalContext>
          </Stateful>
        </Stateful>
      `;

      const player = createTestPlayer(story);
      player.tick();

      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toEqual(
        expect.objectContaining({ val: 7 })
      );
    });
    it("passes non-matching effects up to higher level elements", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="val">5</NestedValue>
          </InitState>
          <EffectHandler type="update">
            <SetState key="val">13</SetState>
          </EffectHandler>
          <Stateful>
            <InitState>
              <NestedValue key="otherVal">7</NestedValue>
            </InitState>
            <EffectHandler type="change">
              <SetState key="otherVal">13</SetState>
            </EffectHandler>
            <Effect type="update"></Effect>
            <Wait />
            <SetGlobalContext key="val">$state["val"]</SetGlobalContext>
          </Stateful>
        </Stateful>
      `;

      const player = createTestPlayer(story);
      player.tick().tick();

      expect(player.currentContext?.val).toEqual(13);
    });
  });
});
