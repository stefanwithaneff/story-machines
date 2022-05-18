import { ElementTree } from "../types";

export function getAllDirectDescendentsOfType(
  tree: ElementTree,
  typename: string | string[]
): ElementTree[] {
  const typenames = Array.isArray(typename) ? typename : [typename];
  return tree.elements.filter((element) => typenames.includes(element.type));
}

export function getDirectDescendentOfType(
  tree: ElementTree,
  typename: string | string[]
): ElementTree | undefined {
  const typenames = Array.isArray(typename) ? typename : [typename];
  return tree.elements.find((element) => typenames.includes(element.type));
}
