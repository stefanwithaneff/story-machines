import fs from "fs";
import path from "path";
import readline from "readline";
import { isEmpty } from "lodash";
import { isDevErrorEffect } from "./machines/effects/dev-error";
import { isDevWarnEffect } from "./machines/effects/dev-warn";
import { StoryMachineRuntime } from "./runtime";
import { Output, Context, Input, ChoiceInput } from "./types";

const rl = readline.createInterface(process.stdin, process.stdout);
const xmlFilename = process.argv[2];

if (!xmlFilename) {
  console.error("No filename provided");
  process.exit(1);
}

function displayOutput(result: Output) {
  // Print warnings and errors
  result.effects.forEach((effect) => {
    if (isDevWarnEffect(effect)) {
      console.warn("[WARN] ", effect.payload.message);
    } else if (isDevErrorEffect(effect)) {
      console.error("[ERROR] ", effect.payload.message);
      process.exit(1);
    }
  });

  // Print passages
  result.passages.forEach((passage) => {
    if (passage.metadata && !isEmpty(passage.metadata)) {
      console.log("META ", passage.metadata);
      console.log("===");
    }
    console.log(passage.text);
  });

  // Print choices
  if (result.choices.length > 0) {
    result.choices.forEach((choice, index) => {
      if (!isEmpty(choice.metadata)) {
        console.log("CHOICE META ", choice.metadata);
      }
      console.log(`${index + 1}. ${choice.text}`);
    });
  }
}

function promptUser(prompt: string): Promise<string> {
  return new Promise((res) => {
    rl.question(prompt, res);
  });
}

async function promptForChoice(
  result: Output
): Promise<ChoiceInput | undefined> {
  const hasChoices = result.choices.length > 0;

  const prompt = hasChoices
    ? "What do you want to do?\n"
    : "Press ENTER to continue\n";

  const response = await promptUser(prompt);

  if (!hasChoices) {
    return undefined;
  }

  let choiceIndex = parseInt(response) - 1;

  while (
    isNaN(choiceIndex) ||
    choiceIndex < 0 ||
    choiceIndex >= result.choices.length
  ) {
    choiceIndex =
      parseInt(
        await promptUser(
          "Please enter the number of the choice you wish to choose:\n"
        )
      ) - 1;
  }

  return {
    type: "Choice",
    payload: {
      id: result.choices[choiceIndex].id,
    },
  };
}

function getEmptyContext(input?: Input): Context {
  return {
    originalInput: input,
    input,
    output: {
      passages: [],
      choices: [],
      effects: [],
    },
  };
}

async function run() {
  const runtime = new StoryMachineRuntime();
  const xmlString = fs.readFileSync(path.resolve(process.cwd(), xmlFilename), {
    encoding: "utf8",
  });

  const machine = runtime.compileXML(xmlString);
  let context: Context = getEmptyContext();
  let result = machine.process(context);

  // Run empty context through machine with optional input
  do {
    displayOutput(context.output);
    const input = await promptForChoice(context.output);
    context = getEmptyContext(input);
    result = machine.process(context);
  } while (result.status === "Running");

  displayOutput(context.output);

  if (result.status === "Completed") {
    console.log("The end. Thanks for playing!");
  } else {
    console.error("An error occurred while playing the story");
  }
  process.exit(0);
}

try {
  run();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
