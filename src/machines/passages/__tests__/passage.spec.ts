import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";

const runtime = new StoryMachineRuntime();

describe("Passage", () => {
  it("outputs the described text and metadata", () => {
    const story = `
      <Passage>
        <PassageText>test</PassageText>
        <PassageMetadata>
          <Value key="testNum">7</Value>
          <Value key="testStr">"hello"</Value>
        </PassageMetadata>
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
  it("terminates if the metadata builders terminate", () => {
    const story = `
      <Passage>
        <PassageText>test</PassageText>
        <PassageMetadata>
          <Value key="testNum">7</Value>
          <Terminated />
        </PassageMetadata>
      </Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toEqual("Terminated");
  });
  it("does not output a passage if only an empty PassageText is provided", () => {
    const story = `
      <Passage>
        <PassageText></PassageText>
      </Passage>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentOutput?.passages).toEqual([]);
  });

  it("can load from saved data", () => {
    const story = `
      <Passage id="passage">
        <PassageText>test</PassageText>
        <PassageMetadata>
          <Value key="testNum">7</Value>
          <Value key="testStr">"hello"</Value>
        </PassageMetadata>
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
        <Text>test</Text>
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
        <Text id="text">test</Text>
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
});
