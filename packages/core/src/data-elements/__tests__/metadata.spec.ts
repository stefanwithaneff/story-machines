import { StoryMachineRuntime } from "../../runtime";
import { Expression } from "../../utils/expression-parser";

const runtime = new StoryMachineRuntime();

describe("Metadata", () => {
  it("returns a metadata payload", () => {
    const xml = `
      <Metadata>
        <Value key="num">30</Value>
        <Object key="obj">
          <Value key="str">"abc"</Value>
        </Object>
      </Metadata>
    `;

    const result = runtime.compileXML(xml);

    expect(result).toEqual({
      metadata: {
        num: expect.any(Expression),
        obj: {
          str: expect.any(Expression),
        },
      },
    });
  });
});
