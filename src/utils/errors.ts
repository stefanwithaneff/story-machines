export class ValidationError extends Error {}
export class XMLParseError extends Error {
  constructor(msg: string) {
    super(`XMLParseError: ${msg}`);
  }
}
