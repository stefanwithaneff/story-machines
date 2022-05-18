// import fs from "fs";
// import path from "path";
// import readline from "readline";
// import { Output, Choice } from "./machines/base-machines/story-machine";
// import { Ink } from "./machines/ink/ink";

// // TODO: Get Visualizer working again

// const rl = readline.createInterface(process.stdin, process.stdout);
// const inkJsonFilename = process.argv[2];

// if (!inkJsonFilename) {
//   console.error("No filename provided");
//   process.exit(1);
// }

// function displayOutput(result: Output) {
//   // Print passages
//   result.text.forEach((passage) => {
//     console.log(passage);
//   });

//   if (result.choices.length > 0) {
//     result.choices.forEach((choice, index) => {
//       console.log(`${index}. ${choice.text}`);
//     });
//   }
// }

// function promptUser(prompt: string): Promise<string> {
//   return new Promise((res) => {
//     rl.question(prompt, res);
//   });
// }

// async function promptForChoice(result: Output): Promise<Choice | undefined> {
//   const hasChoices = result.choices.length > 0;

//   const prompt = hasChoices
//     ? "What do you want to do?\n"
//     : "Press ENTER to continue\n";

//   const response = await promptUser(prompt);

//   if (!hasChoices) {
//     return undefined;
//   }

//   let choiceIndex = parseInt(response);

//   while (
//     isNaN(choiceIndex) ||
//     choiceIndex < 0 ||
//     choiceIndex >= result.choices.length
//   ) {
//     choiceIndex = parseInt(
//       await promptUser(
//         "Please enter the number of the choice you wish to choose:\n"
//       )
//     );
//   }

//   return result.choices[choiceIndex];
// }

// async function run() {
//   const externalState = {};
//   const inkJson = fs.readFileSync(
//     path.resolve(process.cwd(), inkJsonFilename),
//     { encoding: "utf8" }
//   );

//   const inkObj = JSON.parse(inkJson.trim());

//   const machine = new Ink(inkObj);

//   let output = machine.start(externalState);

//   do {
//     displayOutput(output);
//     const choice = await promptForChoice(output);
//     output = machine.next(externalState, choice);
//   } while (output.status !== "Done");

//   console.log("The end. Thanks for playing!");
//   process.exit(0);
// }

// try {
//   run();
// } catch (e) {
//   console.error(e.message);
//   process.exit(1);
// }