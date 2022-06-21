import { StoryMachineRuntime } from "../../runtime";
import { TestPlayer } from "../../test-player";

const runtime = new StoryMachineRuntime();

describe("Decorator machines", () => {
  describe("LoopTilTerminated", () => {
    it("runs until its child terminates", () => {
      const story = `
        <Stateful>
          <InitState>
            <NestedValue key="count">1</NestedValue>
          </InitState>
          <LoopTilTerminated>
            <Sequence>
              <Condition>$state.count lt 3</Condition>
              <SetState key="count">$state.count + 1</SetState>
            </Sequence>
          </LoopTilTerminated>
        </Stateful>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
  });
  describe("Not", () => {
    it("completes if its child terminates", () => {
      const story = `
        <Not>
          <Terminated />
        </Not>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("terminates if its child completes", () => {
      const story = `
        <Not>
          <Completed />
        </Not>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
    });
    it("returns Running if its child is still running", () => {
      const story = `
        <Not>
          <Wait />
        </Not>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
    });
  });
  describe("Once", () => {
    it("runs its child until it either completes or terminates", () => {
      const story = `
        <Once>
          <LoopTilTerminated>
            <Sequence>
              <Condition>$ctx.input.type neq "Break"</Condition>
            </Sequence>
          </LoopTilTerminated>
        </Once>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick({ input: { type: "Break", payload: {} } });
      expect(player.currentStatus).toEqual("Completed");
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });

    it("loads its own state and child state from a previous save", () => {
      const story = `
        <Once id="once">
          <Wait id="wait" />
        </Once>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();

      const saveData = {};
      player.save(saveData);
      expect(saveData).toEqual({
        once: { status: "Running" },
        wait: { hasRun: true },
      });

      player.init().load(saveData);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });

    it("does not save child state if the Once element has already completed or terminated", () => {
      const story = `
        <Once id="once">
          <Wait id="wait" />
        </Once>
      `;

      const player = new TestPlayer(runtime, story);

      const saveData = {};
      player.tick().tick().save(saveData);

      expect(saveData).toEqual({ once: { status: "Completed" } });
    });
  });
});
