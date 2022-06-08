import { Context, Result } from "../../types";
import { ChoiceBuilder } from "./choice-builder";

export class ChoiceMetadata extends ChoiceBuilder {
  process(context: Context): Result {
    return { status: "Terminated" };
  }
}
