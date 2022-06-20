import { parseXMLToTree } from "../parse-xml-to-tree";
import { ElementTree } from "../../types";
import { XMLParseError } from "../errors";

describe("XML parsing", () => {
  const xmlSpecs: Record<string, [string, ElementTree]> = {
    "parses a single element": [
      "<Node />",
      { type: "Node", attributes: {}, elements: [] },
    ],
    "ignores top-level comments": [
      `
          <!-- Comment -->
          <Node />
        `,
      { type: "Node", attributes: {}, elements: [] },
    ],
    "adds attributes to an element": [
      `<Node test="value" />`,
      { type: "Node", attributes: { test: "value" }, elements: [] },
    ],
    "adds text as a `textContent` attribute": [
      `
        <Node>
          Text content
        </Node>
      `,
      {
        type: "Node",
        attributes: { textContent: "Text content" },
        elements: [],
      },
    ],
    "supports child elements": [
      `
        <Node>
          <Child1 attr="test" />
          <Child2>
            <More />
            <Hierarchy />
          </Child2>
          <Child3>Test content, please ignore!</Child3>
        </Node>
      `,
      {
        type: "Node",
        attributes: {},
        elements: [
          { type: "Child1", attributes: { attr: "test" }, elements: [] },
          {
            type: "Child2",
            attributes: {},
            elements: [
              { type: "More", attributes: {}, elements: [] },
              { type: "Hierarchy", attributes: {}, elements: [] },
            ],
          },
          {
            type: "Child3",
            attributes: { textContent: "Test content, please ignore!" },
            elements: [],
          },
        ],
      },
    ],
  };
  for (const [specName, [xml, tree]] of Object.entries(xmlSpecs)) {
    it(specName, () => {
      const result = parseXMLToTree(xml);
      expect(result).toEqual(tree);
    });
  }

  it("throws an error if multiple root nodes are provided", () => {
    const xml = `
      <Root>
        <Child />
      </Root>
      <Root>
        <OtherChild />
      </Root>
    `;

    expect(() => parseXMLToTree(xml)).toThrowError(XMLParseError);
  });
  it("throws an error if no root node is found", () => {
    const xml = `
      <!-- Just a commment and nothing else -->
    `;

    expect(() => parseXMLToTree(xml)).toThrowError(XMLParseError);
  });
});
