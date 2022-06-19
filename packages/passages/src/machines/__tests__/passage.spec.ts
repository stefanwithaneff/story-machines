import {
  StoryMachineRuntime,
  TestPlayer,
  createEmptyContext,
} from "@story-machines/core";
import { Passage } from "../../types";
import { PassageElements } from "../..";
import { AddPassageInternal } from "../add-passage";
import { PASSAGE_TEXT } from "../constants";

const runtime = new StoryMachineRuntime();
runtime.registerMachines(PassageElements);

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

    expect(player.currentOutput?.passages).toEqual(undefined);
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

  it("adds a passage that is provided directly to the internal version of Passages", () => {
    const passage: Passage = {
      text: "test",
      metadata: {},
    };

    const context = createEmptyContext();
    const machine = new AddPassageInternal({ passageFn: () => passage });
    machine.process(context);
    expect(context.output.passages).toEqual([passage]);
  });

  it("allows for direct usage of the AddPassage element", () => {
    const story = `
      <Sequence>
        <SetGlobalContext key="${PASSAGE_TEXT}">"test"</SetGlobalContext>
        <AddPassage />
      </Sequence>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentOutput?.passages).toEqual([
      { text: "test", metadata: {} },
    ]);
  });
});
