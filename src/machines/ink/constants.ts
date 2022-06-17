export const INK_EXTERNAL_FUNCS = "INK_EXTERNAL_FUNCS";
export const INK_STORY = "INK_STORY";
export const INK_INITIALIZER = Symbol("INK_INITIALIZER");
export const INK_PREPROCESSER = Symbol("INK_PREPROCESSER");
export const INK_POSTPROCESSER = Symbol("INK_POSTPROCESSER");

export interface InkExternalFunction {
  name: string;
  isGeneral: boolean;
  fn: (...args: any) => any;
}
