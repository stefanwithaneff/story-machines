import { StoryMachineRuntime } from "../../runtime";
import { Expression } from "../../utils/expression-parser";

const runtime = new StoryMachineRuntime();

describe("Object", () => {
  it("returns a key-object pair", () => {
    const xml = `
      <Object key="test">
        <Value key="num">4</Value>
        <Object key="obj">
          <Value key="str">"abc"</Value>
        </Object>
      </Object>
    `;

    const result = runtime.compileXML(xml);

    expect(result).toEqual({
      test: {
        num: expect.any(Expression),
        obj: {
          str: expect.any(Expression),
        },
      },
    });
  });
});
