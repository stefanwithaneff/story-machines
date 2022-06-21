export class XMLParseError extends Error {
  constructor(msg: string) {
    super(`XMLParseError: ${msg}`);
  }
}
