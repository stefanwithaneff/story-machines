import Parsimmon from "parsimmon";

const EffectDecoratorParser = Parsimmon.string("@effect");
const NameParser = Parsimmon.regexp(/[^\s]+/);
const KeyParser = Parsimmon.regexp(/[a-z0-9_]+/i);

const StringParser = Parsimmon.seq(
  Parsimmon.string('"'),
  Parsimmon.regexp(/[^"]*/),
  Parsimmon.string('"')
).map(([_, str, _2]) => str);
const FloatParser = Parsimmon.seq(
  Parsimmon.digits,
  Parsimmon.string("."),
  Parsimmon.digits
).tieWith("");
const NumberParser = Parsimmon.alt(FloatParser, Parsimmon.digits).map(Number);
const NegativeNumberParser = Parsimmon.seq(
  Parsimmon.string("-"),
  NumberParser
).map(([_, num]) => -1 * num);
const BooleanParser = Parsimmon.alt(
  Parsimmon.string("true"),
  Parsimmon.string("false")
).map((bool) => bool === "true");

const PrimitiveParser = Parsimmon.alt(
  BooleanParser,
  StringParser,
  NegativeNumberParser,
  NumberParser
);

const CommaDelimited = Parsimmon.regexp(/\s*,\s*/);

const ArrayParser = Parsimmon.seq(
  Parsimmon.string("["),
  PrimitiveParser.sepBy(CommaDelimited),
  Parsimmon.string("]")
).map(([_, arr, _2]) => arr);

const ValueParser = Parsimmon.alt(ArrayParser, PrimitiveParser);

const KeyValueParser = Parsimmon.seq(
  KeyParser,
  Parsimmon.string(":"),
  ValueParser
).map(([key, _, val]) => [key, val]);

const ParamlessEffectParser = Parsimmon.seq(
  EffectDecoratorParser,
  Parsimmon.whitespace,
  NameParser
).map(([_, _2, type]) => ({ type, payload: {} }));

const EffectWithParamsParser = Parsimmon.seq(
  EffectDecoratorParser,
  Parsimmon.whitespace,
  NameParser,
  Parsimmon.whitespace,
  Parsimmon.sepBy(KeyValueParser, Parsimmon.string(" "))
).map(([_, _2, type, _3, keyValPairs]) => ({
  type,
  payload: Object.fromEntries(keyValPairs),
}));

export const EffectParser = Parsimmon.alt(
  EffectWithParamsParser,
  ParamlessEffectParser
);
