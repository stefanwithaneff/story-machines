import { StoryMachineRuntime } from "../../runtime";
import { TestPlayer } from "../../test-player";
import { createEmptyContext } from "../../utils/create-empty-context";

const runtime = new StoryMachineRuntime();

describe("Leaf machines", () => {
  describe("Status machines", () => {
    it("returns a completed status", () => {
      const story = `<Completed />`;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("returns a terminated status", () => {
      const story = `<Terminated />`;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
    });
  });
  describe("Condition", () => {
    it("completes if the provided expression is true", () => {
      const story = `<Condition>5 gt 3</Condition>`;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("terminates if the provided expression is false", () => {
      const story = `<Condition>5 lt 3</Condition>`;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
    });
    it("terminates and provides an error if the provided expression is a non-boolean value", () => {
      const story = `<Condition>"Not a boolean"</Condition>`;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentOutput?.effects[0].payload).toEqual({
        message: expect.stringContaining("Non-boolean value"),
      });
    });
  });
  describe("DevLog", () => {
    let originalLog: any;
    beforeAll(() => {
      originalLog = console.log;
      console.log = jest.fn();
    });
    afterAll(() => {
      console.log = originalLog;
    });
    it("logs the output of the provided expression", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="num">7</SetGlobalContext>
          <DevLog>Adding 3: {{$ctx.num + 3}}</DevLog>
        </Sequence>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(console.log).toHaveBeenCalledWith("Adding 3: 10");
    });
    it("logs an empty string if there is no text content", () => {
      const story = "<DevLog />";
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(console.log).toHaveBeenCalledWith("");
    });
  });
  describe("Wait", () => {
    it("returns Running on its first tick and Completed on the second tick", () => {
      const story = "<Wait />";
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("loads from save data", () => {
      const story = "<Wait />";
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");

      const saveData = {};
      player.save(saveData);

      player.init().load(saveData).tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("defaults to initial state when loading save data that is missing its data", () => {
      const story = "<Wait />";
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.load({}).tick();
      expect(player.currentStatus).toEqual("Running");
    });
  });
});
