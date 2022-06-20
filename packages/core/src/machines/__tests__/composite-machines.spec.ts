import { StoryMachineRuntime } from "../../runtime";
import { TestPlayer } from "../../test-player";

const runtime = new StoryMachineRuntime();

describe("Composite machines", () => {
  describe("Sequence", () => {
    it("runs all children if every child completes", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });
    it("runs all children until one terminates", () => {
      const story = `
        <Sequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <Terminated />
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
      });
      expect(player.currentContext?.third).toBe(undefined);
    });
  });
  describe("Fallback", () => {
    it("runs all children if every child terminates", () => {
      const story = `
        <Fallback>
          <Not><SetGlobalContext key="first">"foo"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="second">"bar"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="third">"baz"</SetGlobalContext></Not>
        </Fallback>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });
    it("runs all children until one completes", () => {
      const story = `
        <Fallback>
          <Not><SetGlobalContext key="first">"foo"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="second">"bar"</SetGlobalContext></Not>
          <Completed />
          <Not><SetGlobalContext key="third">"baz"</SetGlobalContext></Not>
        </Fallback>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
      });
      expect(player.currentContext?.third).toBe(undefined);
    });
  });
  describe("ImmediateSequence", () => {
    it("runs all children at once and completes if they all complete", () => {
      const story = `
        <ImmediateSequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </ImmediateSequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });

    it("runs all children at once and terminates if any child terminates", () => {
      const story = `
        <ImmediateSequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <Terminated />
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </ImmediateSequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });

    it("returns Running if any child is running and no child has terminated", () => {
      const story = `
        <Sequence>
          <Completed />
          <Wait />
          <Completed />
        </Sequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
  });
  describe("ImmediateFallback", () => {
    it("runs all children at once and completes if any child completes", () => {
      const story = `
        <ImmediateFallback>
          <Not><SetGlobalContext key="first">"foo"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="second">"bar"</SetGlobalContext></Not>
          <Completed />
          <Not><SetGlobalContext key="third">"baz"</SetGlobalContext></Not>
        </ImmediateSequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });

    it("runs all children at once and terminates if every child terminates", () => {
      const story = `
        <ImmediateFallback>
          <Terminated />
          <Terminated />
          <Terminated />
        </ImmediateSequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
    });

    it("returns Running if any child is running and no child has completed", () => {
      const story = `
        <ImmediateFallback>
          <Terminated />
          <Wait />
          <Terminated />
        </ImmediateFallback>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
    });
  });
  describe("MemorySequence", () => {
    it("runs all children if every child completes", () => {
      const story = `
        <MemorySequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </MemorySequence>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).not.toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });
    it("runs all children until a child terminates", () => {
      const story = `
        <MemorySequence>
          <SetGlobalContext key="first">"foo"</SetGlobalContext>
          <SetGlobalContext key="second">"bar"</SetGlobalContext>
          <Terminated />
          <SetGlobalContext key="third">"baz"</SetGlobalContext>
        </MemorySequence>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
      });
      expect(player.currentContext?.third).toBe(undefined);
    });
    it("loads from a previous save", () => {
      const story = `
        <MemorySequence id="seq">
          <Completed />
          <Wait id="wait" />
          <Completed />
        </MemorySequence>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");

      const saveData = {};
      player.save(saveData);

      expect(saveData).toMatchObject({
        seq: { currentId: "wait", status: "Running" },
      });

      player.init().load(saveData).tick();
      expect(player.currentStatus).toEqual("Completed");
    });
    it("loads the correct child from a save even if the order of the children has changed", () => {
      const story = `
        <MemorySequence id="seq">
          <Completed />
          <Wait id="wait1" />
          <Completed />
          <Wait id="wait2" />
        </MemorySequence>
      `;
      const player = new TestPlayer(runtime, story);
      const saveData = {};
      player.tick().save(saveData);
      const rearrangedStory = `
        <MemorySequence id="seq">
          <Wait id="wait0" />
          <Completed />
          <Wait id="wait2" />
          <Completed />
          <Wait id="wait1" />
        </MemorySequence>
      `;
      player.loadStory(rearrangedStory).load(saveData).tick();

      expect(player.currentStatus).toEqual("Completed");
    });
    it("defaults to the first child if no saved data exists", () => {
      const story = `
        <MemorySequence id="seq">
          <Completed />
          <Wait id="wait1" />
          <Completed />
          <Wait id="wait2" />
        </MemorySequence>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick().load({}).tick();

      expect(player.currentStatus).toEqual("Running");
    });
  });
  describe("MemoryFallback", () => {
    it("runs all children if every child terminates", () => {
      const story = `
        <MemoryFallback>
          <Not><SetGlobalContext key="first">"foo"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="second">"bar"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="third">"baz"</SetGlobalContext></Not>
        </MemoryFallback>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
      player.tick();
      expect(player.currentStatus).toEqual("Terminated");
      expect(player.currentContext).not.toMatchObject({
        first: "foo",
        second: "bar",
        third: "baz",
      });
    });
    it("runs all children until a child completes", () => {
      const story = `
        <MemoryFallback>
          <Not><SetGlobalContext key="first">"foo"</SetGlobalContext></Not>
          <Not><SetGlobalContext key="second">"bar"</SetGlobalContext></Not>
          <Completed />
          <Not><SetGlobalContext key="third">"baz"</SetGlobalContext></Not>
        </MemoryFallback>
      `;

      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Completed");
      expect(player.currentContext).toMatchObject({
        first: "foo",
        second: "bar",
      });
      expect(player.currentContext?.third).toBe(undefined);
    });
    it("loads from a previous save", () => {
      const story = `
        <MemoryFallback id="fallback">
          <Terminated />
          <Not id="not"><Wait id="wait" /></Not>
          <Terminated />
        </MemoryFallback>
      `;
      const player = new TestPlayer(runtime, story);
      player.tick();
      expect(player.currentStatus).toEqual("Running");

      const saveData = {};
      player.save(saveData);

      expect(saveData).toMatchObject({
        fallback: { currentId: "not", status: "Running" },
      });

      player.init().load(saveData).tick();
      expect(player.currentStatus).toEqual("Terminated");
    });
    it("loads the correct child from a save even if the order of the children has changed", () => {
      const story = `
        <MemoryFallback id="fallback">
          <Terminated />
          <Wait id="wait1" />
          <Terminated />
          <Wait id="wait2" />
        </MemoryFallback>
      `;
      const player = new TestPlayer(runtime, story);
      const saveData = {};
      player.tick().save(saveData);
      const rearrangedStory = `
        <MemoryFallback id="fallback">
          <Wait id="wait0" />
          <Terminated />
          <Wait id="wait2" />
          <Terminated />
          <Wait id="wait1" />
        </MemoryFallback>
      `;
      player.loadStory(rearrangedStory).load(saveData).tick();

      expect(player.currentStatus).toEqual("Completed");
    });
    it("defaults to the first child if no saved data exists", () => {
      const story = `
        <MemoryFallback id="fallback">
          <Terminated />
          <Wait id="wait1" />
          <Terminated />
          <Wait id="wait2" />
        </MemoryFallback>
      `;
      const player = new TestPlayer(runtime, story);
      player.load({}).tick();

      expect(player.currentStatus).toEqual("Running");
    });
  });
});
