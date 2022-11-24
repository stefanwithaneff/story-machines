import { StoryMachineRuntime } from "../../runtime";
import { Expression } from "../../utils/expression-parser";

const runtime = new StoryMachineRuntime();

describe("Value", () => {
  it("returns a key-value pair where the value is parsed", () => {
    const xml = `<Value key="test">4</Value>`;
    const result = runtime.compileXML(xml) as Record<string, any>;
    expect(result.test).toEqual(expect.any(Expression));
    expect(result.test.calc({})).toEqual(4);
  });

  it("fills in a random key if not provided", () => {
    const xml = `<Value>4</Value>`;
    const obj = runtime.compileXML(xml);
    expect(Object.keys(obj)[0]).toEqual(expect.any(String));

    const val = Object.values(obj)[0];
    expect(val.calc({})).toEqual(4);
  });
});
