import { get } from "lodash";
import Parsimmon, { Parser } from "parsimmon";
import { Context } from "../types";

interface Expression {
  calc(context: Context): any;
}

class Constant implements Expression {
  constructor(private val: string | number | boolean | null) {}
  calc() {
    return this.val;
  }
}

class ContextRef implements Expression {
  constructor(private dotAccessor: string) {}
  calc(context: Context) {
    return get(context, this.dotAccessor);
  }
}

class FunctionCall implements Expression {
  constructor(private variableRef: Expression, private args: Expression[]) {}
  calc(context: Context) {
    const func = this.variableRef.calc(context);
    const args = this.args.map((arg) => arg.calc(context));

    return func(...args);
  }
}

class Negation implements Expression {
  constructor(private expr: Expression) {}
  calc(context: Context) {
    return !this.expr.calc(context);
  }
}

class Math implements Expression {
  constructor(
    private operator: string,
    private leftOp: Expression,
    private rightOp: Expression
  ) {}
  calc(context: Context) {
    const leftResult = this.leftOp.calc(context);
    const rightResult = this.rightOp.calc(context);
    switch (this.operator) {
      case "+":
        return leftResult + rightResult;
      case "-":
        return leftResult - rightResult;
      case "*":
        return leftResult * rightResult;
      case "/":
        return leftResult / rightResult;
    }
  }
}

class Logic implements Expression {
  constructor(
    private operator: string,
    private leftOp: Expression,
    private rightOp: Expression
  ) {}
  calc(context: Context) {
    const leftResult = this.leftOp.calc(context);
    const rightResult = this.rightOp.calc(context);
    switch (this.operator) {
      case "<":
        return leftResult < rightResult;
      case ">":
        return leftResult > rightResult;
      case "<=":
        return leftResult <= rightResult;
      case ">=":
        return leftResult >= rightResult;
      case "==":
        return leftResult === rightResult;
      case "!=":
        return leftResult != rightResult;
      case "||":
        return leftResult || rightResult;
      case "&&":
        return leftResult && rightResult;
    }
  }
}

class Ternary implements Expression {
  constructor(
    private condition: Expression,
    private trueExpr: Expression,
    private falseExpr: Expression
  ) {}
  calc(context: Context) {
    const conditionResult = this.condition.calc(context);

    if (conditionResult) {
      return this.trueExpr.calc(context);
    } else {
      return this.falseExpr.calc(context);
    }
  }
}

const NullParser = Parsimmon.regexp(/null/i).map(() => null);
const BooleanParser = Parsimmon.alt(
  Parsimmon.string("true"),
  Parsimmon.string("false")
).map((str) => str === "true");
const StringParser = Parsimmon.string('"')
  .then(Parsimmon.takeWhile((char) => char !== '"'))
  .skip(Parsimmon.string('"'));
const NumberParser = Parsimmon.regexp(/-?[0-9]+(\.[0-9]+)?/).map((res) =>
  Number(res)
);

const ConstantParser = Parsimmon.alt(
  StringParser,
  NumberParser,
  BooleanParser,
  NullParser
).map((val) => new Constant(val));

const DotAccessorParser = Parsimmon.regexp(/(\.[a-zA-Z0-9_]+)*/i).map(
  (accessPath) => accessPath.slice(1) // Remove the leading '.' for easier usage
);

const ContextRefParser = Parsimmon.seqMap(
  Parsimmon.string("$ctx"),
  DotAccessorParser,
  (_, dotAccessor) => new ContextRef(dotAccessor)
);
const VariableRefParser: Parser<Expression> = Parsimmon.alt(ContextRefParser);

const FunctionCallParser: Parser<Expression> = Parsimmon.lazy(() =>
  Parsimmon.seq(
    VariableRefParser,
    Parsimmon.string("("),
    ExpressionParser.sepBy(Parsimmon.string(",")),
    Parsimmon.string(")")
  ).map(
    ([variableRef, _1, expressions, _2]) =>
      new FunctionCall(variableRef, expressions)
  )
);

const ParentheticalParser: Parser<Expression> = Parsimmon.lazy(() =>
  ExpressionParser.wrap(Parsimmon.string("("), Parsimmon.string(")"))
);

const NegationParser: Parser<Expression> = Parsimmon.lazy(() =>
  Parsimmon.seq(Parsimmon.string("!"), ExpressionAtomParser)
).map(([_, expr]) => new Negation(expr));

const ExpressionAtomParser: Parser<Expression> = Parsimmon.alt(
  NegationParser,
  ParentheticalParser,
  FunctionCallParser,
  VariableRefParser,
  ConstantParser
).trim(Parsimmon.optWhitespace);

const MathParser: Parser<Expression> = Parsimmon.seq(
  ExpressionAtomParser,
  Parsimmon.oneOf("+-*/"),
  ExpressionAtomParser
).map(([leftOp, operator, rightOp]) => new Math(operator, leftOp, rightOp));

const LogicParser: Parser<Expression> = Parsimmon.seq(
  ExpressionAtomParser,
  Parsimmon.alt(
    Parsimmon.string(">="),
    Parsimmon.string("<="),
    Parsimmon.string(">"),
    Parsimmon.string("<"),
    Parsimmon.string("=="),
    Parsimmon.string("!="),
    Parsimmon.string("||"),
    Parsimmon.string("&&")
  ),
  ExpressionAtomParser
).map(([leftOp, operator, rightOp]) => new Logic(operator, leftOp, rightOp));

const TernaryParser: Parser<Expression> = Parsimmon.seq(
  ExpressionAtomParser,
  Parsimmon.string("?"),
  ExpressionAtomParser,
  Parsimmon.string(":"),
  ExpressionAtomParser
).map(
  ([condition, _1, trueExpr, _2, falseExpr]) =>
    new Ternary(condition, trueExpr, falseExpr)
);

export const ExpressionParser: Parser<Expression> = Parsimmon.lazy(() =>
  Parsimmon.alt(TernaryParser, MathParser, LogicParser, ExpressionAtomParser)
);

export const WrappedExpressionParser: Parser<Expression> =
  ExpressionParser.trim(Parsimmon.optWhitespace).wrap(
    Parsimmon.string("{{"),
    Parsimmon.string("}}")
  );

export const ManyExpressionParser = ExpressionParser.many();
