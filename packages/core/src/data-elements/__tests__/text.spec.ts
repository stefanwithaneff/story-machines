import { StoryMachineRuntime } from "../../runtime";
import { Expression } from "../../utils/expression-parser";

const runtime = new StoryMachineRuntime();

describe("Text", () => {
  it("returns the text content", () => {
    const xml = `
      <Text>This is a test.</Text>
    `;

    const result = runtime.compileXML(xml);

    expect(result).toEqual({ text: "This is a test." });
  });
  it("returns the parsed expressions from the text", () => {
    const xml = `
      <Text>Parsed expressions: {{ "expression 1" }} {{ "expression 2" }}</Text>
    `;

    const result = runtime.compileXML(xml);

    expect(result).toEqual({
      text: 'Parsed expressions: {{ "expression 1" }} {{ "expression 2" }}',
    });
  });
});
