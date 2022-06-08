import { Context, Result } from "../../types";
import { PassageBuilder } from "./passage-builder";

export class PassageMetadata extends PassageBuilder {
  process(context: Context): Result {
    return { status: "Terminated" };
  }
}
