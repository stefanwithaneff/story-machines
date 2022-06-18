import { Context, Output } from "@story-machines/core";

export interface Passage {
  text: string;
  metadata: Record<string, any>;
}

export interface PassageOutput extends Output {
  passages: Passage[];
}

export interface PassageContext extends Context {
  output: PassageOutput;
}
