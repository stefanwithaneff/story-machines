import { Context, Input, Output } from "@story-machines/core";

export interface ChoiceInput extends Input {
  type: "Choice";
  payload: {
    id: string;
  };
}

export interface Choice {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

export interface ChoiceOutput extends Output {
  choices: Choice[];
}

export interface ChoiceContext extends Context {
  output: ChoiceOutput;
}
