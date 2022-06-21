import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { KEY_PREFIX } from "../constants";

const runtime = new StoryMachineRuntime();

describe("Object builders", () => {
  describe("Values", () => {
    it("sets the value on context using the available key prefix", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <Value>"bar"</Value>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo).toEqual("bar");
    });

    it("allows nesting in objects by defining a key", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <Object>
            <NestedValue key="bar">"baz"</NestedValue>
          </Object>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo.bar).toEqual("baz");
    });

    it("terminates if no key prefix has been defined", () => {
      const story = `
          <Value>"bar"</Value>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Terminated");

      const nestedStory = `
        <NestedValue key="foo">"bar"</NestedValue>
      `;
      player.loadStory(nestedStory).tick();

      expect(player.currentStatus).toBe("Terminated");
    });
  });
  describe("Lists", () => {
    it("creates a list in context using the available key prefix", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <List>
            <Value>"bar"</Value>
            <Value>"baz"</Value>
          </List>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo).toEqual(["bar", "baz"]);
    });

    it("allows nesting in objects by defining a key", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <Object>
            <NestedList key="bar">
              <Value>"baz"</Value>
            </NestedList>
          </Object>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo.bar).toEqual(["baz"]);
    });

    it("terminates if no key prefix has been defined", () => {
      const story = `
          <List>
            <Value>"bar"</Value>
          </List>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Terminated");

      const nestedStory = `
        <NestedList key="foo">
          <Value>"bar"</Value>
        </NestedList>
      `;
      player.loadStory(nestedStory).tick();

      expect(player.currentStatus).toBe("Terminated");
    });

    it("terminates if one of its children terminates", () => {
      const story = `
      <Sequence>
        <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
        <List>
          <Terminated />
        </List>
      </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Terminated");
    });
  });
  describe("Objects", () => {
    it("creates an object in context using the available key prefix", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <Object>
            <NestedValue key="bar">"baz"</NestedValue>
            <NestedValue key="fizz">"buzz"</NestedValue>
          </Object>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo).toEqual({ bar: "baz", fizz: "buzz" });
    });

    it("allows nesting in objects by defining a key", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
          <Object>
            <NestedObject key="bar">
              <NestedValue key="baz">"test"</NestedValue>
            </NestedObject>
          </Object>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Completed");
      expect(player.currentContext?.foo).toEqual({ bar: { baz: "test" } });
    });

    it("terminates if no key prefix has been defined", () => {
      const story = `
          <Object>
            <NestedValue key="foo">"bar"</NestedValue>
          </Object>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Terminated");

      const nestedStory = `
        <NestedObject key="foo">
          <NestedValue key="bar">"baz"</NestedValue>
        </NestedObject>
      `;
      player.loadStory(nestedStory).tick();

      expect(player.currentStatus).toBe("Terminated");
    });

    it("terminates if one of its children terminates", () => {
      const story = `
      <Sequence>
        <SetGlobalContext key="${KEY_PREFIX}">["foo"]</SetGlobalContext>
        <Object>
          <Terminated />
        </Object>
      </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toBe("Terminated");
    });
  });
});
