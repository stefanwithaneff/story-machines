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

  it("does not output a passage if only an empty PassageText is provided", () => {
    const story = `
      <Passage>
        <Text></Text>
      </Passage>
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

  it("can display text in a simpler form using the Text element", () => {
    const story = `
        <PassageText>test</PassageText>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.passages).toEqual([
      { text: "test", metadata: {} },
    ]);

    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });
  it("loads a save for the simplified Text form", () => {
    const story = `
        <PassageText id="text">test</PassageText>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    const saveData = {};
    player.save(saveData);

    expect(saveData).toEqual({
      text_passage_wait: { hasRun: true },
      text_passage_once: { status: "Completed" },
    });

    player.init().load(saveData).tick();

    expect(player.currentStatus).toEqual("Completed");
  });

  it("can add multiple passages at the same time", () => {
    const story = `
      <ImmediateSequence>
        <Passage>
          <PassageText>test1</PassageText>
        </Passage>
        <Passage>
          <PassageText>test2</PassageText>
        </Passage>
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
