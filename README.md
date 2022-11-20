# Story Machines

This library provides a set of behavior tree-based abstractions and a runtime for creating Interactive Fiction. The project is still very much a work-in-progress.

Refer to the subpackages to learn more about the different components:

- [The Core library](story-machines/packages/core)
- [The Passages extension](story-machines/packages/passages) for text output
- [The Choices extension](story-machines/packages/choices) for choice-based input
- [The Ink extension](story-machines/packages/ink) for interoperability with the Ink scripting language
- [The Web Player library](story-machines/packages/web-player) provides React components for displaying Story Machine output in a browser

To see an example of a functioning Story Machine game, download the code and run the following commands in a command line:

[Requires Node.js and NPM to run](https://nodejs.org/en/download/)

```bash
# Install dependencies
npm install

# Run the test file
npm run cli -- test.xml
```
