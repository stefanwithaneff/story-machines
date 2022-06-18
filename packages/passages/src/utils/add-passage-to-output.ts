import { Context } from "@story-machines/core";
import { Passage } from "../types";

export function addPassageToOutput(context: Context, passage: Passage) {
  const passages: Passage[] | undefined = context.output.passages;

  if (!passages) {
    context.output.passages = [passage];
    return;
  }

  passages.push(passage);
}
