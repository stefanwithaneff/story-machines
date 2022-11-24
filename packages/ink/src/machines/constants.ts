export const INK_STORY = "INK_STORY";

export interface InkExternalFunction {
  name: string;
  isGeneral: boolean;
  fn: (...args: any) => any;
}
