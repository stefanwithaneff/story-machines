import { XMLParser } from "fast-xml-parser";
import { ElementTree } from "../types";
import { XMLParseError } from "./errors";

const ATTR_GROUP_NAME = ":@";
const COMMENT_NAME = "#comment";
const TEXT_NAME = "#text";

const xmlParser = new XMLParser({
  preserveOrder: true,
  commentPropName: COMMENT_NAME,
  attributeNamePrefix: "",
  ignoreAttributes: false,
});

function extractText(parsedXML: Record<string, any>[]): {
  text?: string;
  children: Record<string, any>[];
} {
  const children = parsedXML.filter(
    (el) => !(TEXT_NAME in el) && !(COMMENT_NAME in el)
  );
  const text = parsedXML.find((el) => TEXT_NAME in el)?.[TEXT_NAME];
  return { children, text };
}

function restructureParsedXML(parsedXML: Record<string, any>[]): ElementTree[] {
  if (parsedXML.length === 0) {
    return [];
  }
  return parsedXML.map((el) => {
    const attributes = el[ATTR_GROUP_NAME] ?? {};
    const type = Object.keys(el).filter((key) => key !== ATTR_GROUP_NAME)[0];
    const { text, children } = extractText(el[type]);
    if (text) {
      attributes.textContent = text;
    }
    const elements: ElementTree[] = restructureParsedXML(children);
    return {
      type,
      attributes,
      elements,
    };
  });
}

export function parseXMLToTree(xmlString: string): ElementTree {
  const parsedXML = xmlParser.parse(xmlString);

  const restructuredParsedXML = restructureParsedXML(parsedXML);

  const nodes = restructuredParsedXML.filter(
    (tree) => tree.type !== COMMENT_NAME
  );

  if (nodes.length > 1) {
    throw new XMLParseError("Multiple root nodes defined");
  } else if (nodes.length === 0) {
    throw new XMLParseError("No root node defined");
  }

  return nodes[0];
}
