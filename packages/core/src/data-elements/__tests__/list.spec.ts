import { StoryMachineRuntime } from "../../runtime";
import { Expression } from "../../utils/expression-parser";

const runtime = new StoryMachineRuntime();

describe("List", () => {
  it("returns a key-list pair", () => {
    const xml = `
      <List key="test">
        <Value>4</Value>
        <Value>"abc"</Value>
        <Value>false</Value>
      </List>
    `;

    const result = runtime.compileXML(xml) as Record<string, any>;
    expect(result.test).toEqual([
      expect.any(Expression),
      expect.any(Expression),
      expect.any(Expression),
    ]);

    expect(result.test[0].calc({})).toEqual(4);
    expect(result.test[1].calc({})).toEqual("abc");
    expect(result.test[2].calc({})).toEqual(false);
  });
});
