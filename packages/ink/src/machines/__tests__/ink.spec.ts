import { ChoiceTestPlayer } from "@story-machines/choices";
import { SaveData, StoryMachineRuntime } from "@story-machines/core";
import { InkElements } from "../..";

const runtime = new StoryMachineRuntime();
runtime.registerMachines(InkElements);

describe("Ink machines", () => {
  it("compiles and runs an Ink story", () => {
    const story = `
      <Ink id="ink">
        <InkStory>
          # @effect TEST_EFFECT key:"value"
          You are at a fork in the road. Which way do you go?
          + Go left
            You continue walking along the left path.
            -> END
          + Go right 
        </InkStory>
      </Ink>
    `;

    const player = new ChoiceTestPlayer(runtime, story);
    player.tick();
    expect(player.currentOutput).toEqual({
      passages: [
        {
          text: expect.stringContaining(
            "You are at a fork in the road. Which way do you go?"
          ),
          metadata: {},
        },
      ],
      effects: [{ type: "TEST_EFFECT", payload: { key: "value" } }],
      choices: [
        { id: "ink#0", text: "Go left", metadata: {} },
        { id: "ink#1", text: "Go right", metadata: {} },
      ],
    });
    player.chooseNthChoice(0);
    expect(player.currentOutput?.passages).toEqual([
      {
        text: expect.stringContaining("Go left"),
        metadata: {},
      },
    ]);
    player.tick();
    expect(player.currentOutput?.passages).toEqual([
      {
        text: expect.stringContaining(
          "You continue walking along the left path."
        ),
        metadata: {},
      },
    ]);
    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });

  it("loads from a previous save", () => {
    const story = `
      <Ink id="ink">
        <InkStory id="story">
          You are at a fork in the road. Which way do you go?
          + Go left
            You continue walking along the left path.
            -> END
          + Go right 
        </InkStory>
      </Ink>
    `;

    const player = new ChoiceTestPlayer(runtime, story);
    const saveData: SaveData = {};
    player.tick().chooseNthChoice(0).save(saveData);
    expect(saveData).toEqual({
      story: { json: expect.any(String) },
      __CHOICE_TEST_PLAYER_SAVE_DATA__: expect.any(Object),
    });
    player.init().load(saveData).tick();
    expect(player.currentOutput?.passages).toEqual([
      {
        text: expect.stringContaining(
          "You continue walking along the left path."
        ),
        metadata: {},
      },
    ]);
    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });
  it("syncs state with external values", () => {
    const story = `
      <StatefuL>
        <InitState>
          <NestedValue key="playerName">"Test Player"</NestedValue>
        </InitState>
        <Ink id="ink">
          <InkSyncState key="name">$state["playerName"]</InkSyncState>
          <InkStory id="story">
            VAR name = "Sam"
            Hello, {name}! Goodbye!
            -> END
          </InkStory>
        </Ink>
      </Stateful>
    `;

    const player = new ChoiceTestPlayer(runtime, story);
    player.tick();
    expect(player.currentOutput?.passages).toEqual([
      {
        text: expect.stringContaining("Hello, Test Player! Goodbye!"),
        metadata: {},
      },
    ]);
    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });
  it("binds externally defined functions to the Ink story", () => {
    const story = `
      <Ink id="ink">
        <InkExternalFunc name="exp">$ctx["exp"]</InkExternalFunc>
        <InkExternalFunc name="printList" isGeneral="true">$ctx["printList"]</InkExternalFunc>
        <InkStory id="story">
          EXTERNAL exp(base, exponent)
          EXTERNAL printList(list)
          Math time! 2 ^ 3 equals {exp(2, 3)}
          -> END
        </InkStory>
      </Ink>
    `;

    const player = new ChoiceTestPlayer(runtime, story);
    const externalContext = {
      exp(x: number, y: number) {
        return x ** y;
      },
      // TODO: Figure out how to test General functions
      // There's no documentation, so I'm not sure how they're actually supposed to work
      printList(list: any[]) {
        return list.join(",");
      },
    };
    player.tick(externalContext);
    expect(player.currentStatus).toEqual("Running");
    expect(player.currentOutput?.passages).toEqual([
      {
        text: expect.stringContaining("Math time! 2 ^ 3 equals 8"),
        metadata: {},
      },
    ]);
    player.tick();
    expect(player.currentStatus).toEqual("Completed");
  });
  it("does not parse an effect tag with a syntax error", () => {
    const story = `
      <Ink id="ink">
        <InkStory id="story">
          # @effect BAD_EFFECT badKey:badValue
          # @effect TEST_EFFECT key:"value"
          Test text, please ignore.
          -> END
        </InkStory>
      </Ink>
    `;

    const player = new ChoiceTestPlayer(runtime, story);
    player.tick();
    expect(player.currentOutput?.effects).toEqual([
      { type: "TEST_EFFECT", payload: { key: "value" } },
    ]);
    expect(player.currentStatus).toEqual("Running");
  });
});
