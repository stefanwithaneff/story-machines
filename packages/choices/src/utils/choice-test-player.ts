import { Context, Input, SaveData, TestPlayer } from "@story-machines/core";
import { ChoiceInput, Choice } from "../types";

const SAVE_DATA_KEY = "__CHOICE_TEST_PLAYER_SAVE_DATA__";

export class ChoiceTestPlayer extends TestPlayer {
  currentChoices: Choice[] | undefined;

  init() {
    super.init();
    this.currentChoices = undefined;
    return this;
  }

  save(saveData: SaveData) {
    super.save(saveData);
    saveData[SAVE_DATA_KEY] = {
      currentChoices: this.currentChoices,
    };

    return this;
  }

  load(saveData: SaveData) {
    super.load(saveData);
    const data = saveData[SAVE_DATA_KEY];
    this.currentChoices = data?.currentChoices;

    return this;
  }

  tick(externalContext?: Record<string, any>) {
    const input = externalContext?.input;
    if (input && input.type === "Choice") {
      this.currentChoices = undefined;
    }
    super.tick(externalContext);
    if (this.currentOutput?.choices) {
      this.currentChoices = this.currentOutput.choices;
    }
    return this;
  }

  chooseNthChoice(n: number) {
    const nthChoice = this.currentChoices?.[n];

    if (!nthChoice) {
      throw new Error(
        `Specified choice does not exist. Specified index: ${n} Choices: ${this.currentOutput?.choices}`
      );
    }

    const input: ChoiceInput = {
      type: "Choice",
      payload: {
        id: nthChoice.id,
      },
    };

    this.tick({ input });

    return this;
  }

  chooseRandomChoice() {
    const numChoices = this.currentOutput?.choices.length ?? 0;
    const choiceIndex = Math.floor(Math.random() * numChoices);
    const input: ChoiceInput | undefined =
      this.currentOutput && numChoices > 0
        ? {
            type: "Choice",
            payload: {
              id: this.currentOutput.choices[choiceIndex].id,
            },
          }
        : undefined;

    this.tick({ input });

    return this;
  }

  playRandomly(maxIterations: number) {
    for (let i = 0; i < maxIterations; i++) {
      this.chooseRandomChoice();
      if (this.currentStatus !== "Running") {
        return;
      }
    }
  }
}
