import { StoryMachineRuntime, TestPlayer } from "@story-machines/core";
import { ChoiceElements } from "../..";
import { ChoiceTestPlayer } from "../../utils/choice-test-player";
import { ChoiceInput } from "../../types";

const runtime = new StoryMachineRuntime();
runtime.registerElements(ChoiceElements);

describe("Choice machines", () => {
  it("adds a set of choices to the machine output", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Metadata>
            <Value key="meta">1234</Value>
          </Metadata>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    player.tick();
    expect(player.currentStatus).toBe("Running");
    expect(player.currentOutput?.choices).toEqual([
      { id: "choice1", text: "Choice 1", metadata: {} },
      { id: "choice2", text: "Choice 2", metadata: { meta: 1234 } },
    ]);
  });
  it("runs until a matching input has been provided", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Metadata>
            <Value key="meta">1234</Value>
          </Metadata>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    player.tick().tick();
    expect(player.currentStatus).toBe("Running");
    expect(player.currentOutput?.choices).toBe(undefined);

    player.chooseNthChoice(1);
    expect(player.currentStatus).toBe("Completed");
  });
  // TODO: Condition tests
  it("filters choices with Conditions", () => {});
  it("does not filter a choice that has already been chosen if the condition later becomes false", () => {});
  it("runs the children of the selected choice", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Choices>
            <Choice id="choice2a">
              <Text>Choice 2a</Text>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <Text>Choice 2b</Text>
          </Choices>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    player.tick().chooseNthChoice(1);
    expect(player.currentStatus).toBe("Running");
    expect(player.currentOutput?.choices).toEqual([
      { id: "choice2a", text: "Choice 2a", metadata: {} },
      { id: "choice2b", text: "Choice 2b", metadata: {} },
    ]);
    player.chooseNthChoice(0);
    expect(player.currentStatus).toBe("Completed");
    expect(player.currentContext?.foo).toEqual("bar");
  });
  it("terminates if the provided choice input does not match any children", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Metadata>
            <Value key="meta">1234</Value>
          </Metadata>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    const input: ChoiceInput = {
      type: "Choice",
      payload: {
        id: "noChoice",
      },
    };
    player.tick().tick({ input });
    expect(player.currentStatus).toBe("Terminated");
  });
  it("groups multiple choices together under a single choice", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <ChoiceGroup id="choice2">
          <Choice id="subChoice1">
            <Text>SubChoice 1</Text>
          </Choice>
          <Choice id="subChoice2">
            <Text>SubChoice 2</Text>
          </Choice>
          <Wait />
          <SetGlobalContext key="foo">"bar"</SetGlobalContext>
        </ChoiceGroup>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    player.tick();
    expect(player.currentChoices).toEqual([
      { id: "choice1", text: "Choice 1", metadata: {} },
      { id: "subChoice1", text: "SubChoice 1", metadata: {} },
      { id: "subChoice2", text: "SubChoice 2", metadata: {} },
    ]);
    player.chooseNthChoice(1).tick();
    expect(player.currentStatus).toBe("Completed");
    expect(player.currentContext?.foo).toEqual("bar");

    player.init().tick().chooseNthChoice(2).tick();
    expect(player.currentStatus).toBe("Completed");
    expect(player.currentContext?.foo).toEqual("bar");
  });
  it("loads from a previous save", () => {
    const story = `
      <Choices id="choices">
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <Text>Choice 2a</Text>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <Text>Choice 2b</Text>
            </Choice>
          </Choices>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    player.tick().chooseNthChoice(1);
    expect(player.currentStatus).toBe("Running");

    const saveData = {};
    player.save(saveData);
    expect(saveData).toEqual({
      __CHOICE_TEST_PLAYER_SAVE_DATA__: expect.any(Object),
      choices: {
        chosenId: "choice2",
        presentedChoices: ["choice1", "choice2"],
      },
      nestedChoices: {
        chosenId: null,
        presentedChoices: ["choice2a", "choice2b"],
      },
    });

    player.init().load(saveData).chooseNthChoice(0);
    expect(player.currentStatus).toBe("Completed");
    expect(player.currentContext?.foo).toEqual("bar");
  });
  it("does not present additional choices that are added after saving", () => {
    const story = `
      <Choices id="choices">
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <Text>Choice 2a</Text>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <Text>Choice 2b</Text>
            </Choice>
          </Choices>
        </Choice>
      </Choices>
    `;
    const player = new ChoiceTestPlayer(runtime, story);
    const saveData = {};
    player.tick().chooseNthChoice(1).save(saveData);

    const updatedStory = `
      <Choices id="choices">
        <Choice id="choice1">
          <Text>Choice 1</Text>
        </Choice>
        <Choice id="choice2">
          <Text>Choice 2</Text>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <Text>Choice 2a</Text>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <Text>Choice 2b</Text>
            </Choice>
            <Choice id="choice2c">
              <Text>Choice 2c</Text>
            </Choice>
          </Choices>
        </Choice>
        <Choice id="choice3">
          <Text>Choice 3</Text>
        </Choice>
      </Choices>
    `;

    player.loadStory(updatedStory).load(saveData).chooseNthChoice(0);

    expect(player.currentStatus).toEqual("Completed");
    expect(player.currentChoices).toBe(undefined);
    expect(player.currentContext?.foo).toEqual("bar");
  });
});
