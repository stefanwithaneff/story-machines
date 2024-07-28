import { StoryMachineRuntime, TestPlayer } from "@story-machines/core";
import { PassageElements } from "../..";

const runtime = new StoryMachineRuntime();
runtime.registerElements(PassageElements);

describe("Passage", () => {
  it("outputs the described text and metadata", () => {
    const story = `
      <Passage>
        <Text>test</Text>
        <Metadata>
          <Value key="testNum">7</Value>
          <Value key="testStr">"hello"</Value>
        </Metadata>
      </Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.passages).toEqual([
      { text: "test", metadata: { testNum: 7, testStr: "hello" } },
    ]);

    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });

  it("outputs the text even if it is provided as a direct child of Passage", () => {
    const story = `
      <Passage>
        <Metadata>
          <Value key="testNum">7</Value>
          <Value key="testStr">"hello"</Value>
        </Metadata>
        test
      </Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.passages).toEqual([
      { text: "test", metadata: { testNum: 7, testStr: "hello" } },
    ]);

    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });

  it("does not output a passage if no text is provided", () => {
    const story = `
      <Passage></Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentOutput?.passages).toEqual(undefined);
  });

  it("can load from saved data", () => {
    const story = `
      <Passage id="passage">
        <Text>test</Text>
        <Metadata>
          <Value key="testNum">7</Value>
          <Value key="testStr">"hello"</Value>
        </Metadata>
      </Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    const saveData = {};
    player.save(saveData);

    expect(saveData).toEqual({
      passage_wait: { hasRun: true },
      passage_once: { status: "Completed" },
    });

    player.init().load(saveData).tick();

    expect(player.currentStatus).toEqual("Completed");
  });

  it("can add multiple passages at the same time", () => {
    const story = `
      <ImmediateSequence>
        <Passage>test1</Passage>
        <Passage>test2</Passage>
      </ImmediateSequence>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentOutput?.passages).toEqual([
      { text: "test1", metadata: {} },
      { text: "test2", metadata: {} },
    ]);
  });
});
