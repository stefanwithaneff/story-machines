import { StoryMachineRuntime, TestPlayer } from "@story-machines/core";
import { ChoiceElements } from "../..";
import { ChoiceTestPlayer } from "../../utils/choice-test-player";
import { ChoiceInput } from "../../types";

const runtime = new StoryMachineRuntime();
runtime.registerMachines(ChoiceElements);

describe("Choice machines", () => {
  it("adds a set of choices to the machine output", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <ChoiceMetadata>
            <NestedValue key="meta">1234</NestedValue>
          </ChoiceMetadata>
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
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <ChoiceMetadata>
            <NestedValue key="meta">1234</NestedValue>
          </ChoiceMetadata>
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
  it("runs the children of the selected choice", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <Choices>
            <Choice id="choice2a">
              <ChoiceText>Choice 2a</ChoiceText>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <ChoiceText>Choice 2b</ChoiceText>
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
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <ChoiceMetadata>
            <NestedValue key="meta">1234</NestedValue>
          </ChoiceMetadata>
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
    player.tick().tick(input);
    expect(player.currentStatus).toBe("Terminated");
  });
  it("groups multiple choices together under a single choice", () => {
    const story = `
      <Choices>
        <Choice id="choice1">
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <MultiChoice id="choice2">
          <Choice id="subChoice1">
            <ChoiceText>SubChoice 1</ChoiceText>
          </Choice>
          <Choice id="subChoice2">
            <ChoiceText>SubChoice 2</ChoiceText>
          </Choice>
          <Wait />
          <SetGlobalContext key="foo">"bar"</SetGlobalContext>
        </MultiChoice>
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
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <ChoiceText>Choice 2a</ChoiceText>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <ChoiceText>Choice 2b</ChoiceText>
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
      choices: {
        chosenId: "choice2",
      },
    });

    player.init().load(saveData).tick().chooseNthChoice(0);
    expect(player.currentStatus).toBe("Completed");
    expect(player.currentContext?.foo).toEqual("bar");
  });
  it("only presents the chosen child if additional choices are added after saving", () => {
    const story = `
      <Choices id="choices">
        <Choice id="choice1">
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <ChoiceText>Choice 2a</ChoiceText>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <ChoiceText>Choice 2b</ChoiceText>
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
          <ChoiceText>Choice 1</ChoiceText>
        </Choice>
        <Choice id="choice2">
          <ChoiceText>Choice 2</ChoiceText>
          <Choices id="nestedChoices">
            <Choice id="choice2a">
              <ChoiceText>Choice 2a</ChoiceText>
              <SetGlobalContext key="foo">"bar"</SetGlobalContext>
            </Choice>
            <Choice id="choice2b">
              <ChoiceText>Choice 2b</ChoiceText>
          </Choices>
        </Choice>
        <Choice id="choice3">
          <ChoiceText>Choice 3</ChoiceText>
        </Choice>
      </Choices>
    `;

    player.loadStory(updatedStory).load(saveData).tick();

    expect(player.currentChoices).toEqual([
      { id: "choice2a", text: "Choice 2a", metadata: {} },
      { id: "choice2b", text: "Choice 2b", metadata: {} },
    ]);
  });
});
