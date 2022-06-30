import Parsimmon, { Parser } from "parsimmon";
import { STATE } from "../machines/state";
import { Context } from "../types";
import { getFromContext } from "./scope";

export interface Expression {
  calc(context: Context): any;
}

type ExpressionClass = new (...args: any[]) => Expression;

class Constant implements Expression {
  constructor(private val: string | number | boolean | null) {}
  calc() {
    return this.val;
  }
}

class VariableRef implements Expression {
  constructor(
    private target: "$ctx" | "$state",
    private expressions: Expression[]
  ) {}
  calc(context: Context) {
    const path = this.expressions.map((expr) => expr.calc(context));
    if (this.target === "$ctx") {
      return getFromContext(context, path);
    } else if (this.target === "$state") {
      return getFromContext(context, [STATE, ...path]);
    }
  }
}

class List implements Expression {
  constructor(private items: Expression[]) {}
  calc(context: Context) {
    const list: any[] = [];
    for (const item of this.items) {
      const val = item.calc(context);
      list.push(val);
    }
    return list;
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
      case "%":
        return leftResult % rightResult;
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

    // Short circuit logic for AND/OR operators

    if (this.operator === "and" && !leftResult) {
      return false;
    }

    if (this.operator === "or" && leftResult) {
      return true;
    }

    const rightResult = this.rightOp.calc(context);
    switch (this.operator.toLowerCase()) {
      case "lt":
        return leftResult < rightResult;
      case "gt":
        return leftResult > rightResult;
      case "lte":
        return leftResult <= rightResult;
      case "gte":
        return leftResult >= rightResult;
      case "eq":
        return leftResult === rightResult;
      case "neq":
        return leftResult != rightResult;
      case "or":
        return leftResult || rightResult;
      case "and":
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
const StringParser = Parsimmon.alt(
  Parsimmon.string('"'),
  Parsimmon.string("'"),
  Parsimmon.string("`")
).chain((start) => {
  return Parsimmon.takeWhile((char) => char !== start).skip(
    Parsimmon.string(start)
  );
});
const NumberParser = Parsimmon.regexp(/-?[0-9]+(\.[0-9]+)?/).map((res) =>
  Number(res)
);

const ConstantParser = Parsimmon.alt(
  StringParser,
  NumberParser,
  BooleanParser,
  NullParser
).map((val) => new Constant(val));

const AccessorParser = Parsimmon.lazy(() =>
  Parsimmon.seq(Parsimmon.string("["), ExpressionParser, Parsimmon.string("]"))
    .map(([_, expr]) => expr)
    .many()
);

const VariableRefParser = Parsimmon.seqMap(
  Parsimmon.alt(Parsimmon.string("$ctx"), Parsimmon.string("$state")),
  AccessorParser,
  (target, expressions) => new VariableRef(target, expressions)
);

const ListParser = Parsimmon.lazy(() =>
  Parsimmon.seq(
    Parsimmon.string("["),
    ExpressionParser.sepBy(Parsimmon.string(",")),
    Parsimmon.string("]")
  ).map(([_, items]) => new List(items))
);

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
  ParentheticalParser,
  NegationParser,
  FunctionCallParser,
  ListParser,
  VariableRefParser,
  ConstantParser
).trim(Parsimmon.optWhitespace);

function binaryOpChain(
  parser: Parser<Expression>,
  op: Parser<string>,
  exprClass: ExpressionClass
): Parser<Expression> {
  const opPairs = Parsimmon.seq(op, parser).many();

  return Parsimmon.seq(parser, opPairs).map(([firstExpr, opPairs]) => {
    let leftExpr = firstExpr;

    for (const [op, rightExpr] of opPairs) {
      leftExpr = new exprClass(op, leftExpr, rightExpr);
    }

    return leftExpr;
  });
}

const MultDivParser: Parser<Expression> = binaryOpChain(
  ExpressionAtomParser,
  Parsimmon.oneOf("*/%"),
  Math
);

const PlusMinusParser: Parser<Expression> = binaryOpChain(
  Parsimmon.alt(MultDivParser, ExpressionAtomParser),
  Parsimmon.oneOf("+-"),
  Math
);

const MathParser: Parser<Expression> = Parsimmon.alt(
  PlusMinusParser,
  MultDivParser
);

const InequalityParser: Parser<Expression> = binaryOpChain(
  Parsimmon.alt(MathParser, ExpressionAtomParser),
  Parsimmon.alt(
    Parsimmon.regexp(/gte/i),
    Parsimmon.regexp(/lte/i),
    Parsimmon.regexp(/lt/i),
    Parsimmon.regexp(/gt/i)
  ),
  Logic
);

const EqualityParser: Parser<Expression> = binaryOpChain(
  Parsimmon.alt(InequalityParser, MathParser, ExpressionAtomParser),
  Parsimmon.alt(Parsimmon.regexp(/eq/i), Parsimmon.regexp(/neq/i)),
  Logic
);

const AndParser: Parser<Expression> = binaryOpChain(
  Parsimmon.alt(
    EqualityParser,
    InequalityParser,
    MathParser,
    ExpressionAtomParser
  ),
  Parsimmon.regexp(/and/i),
  Logic
);

const OrParser: Parser<Expression> = binaryOpChain(
  Parsimmon.alt(
    AndParser,
    EqualityParser,
    InequalityParser,
    MathParser,
    ExpressionAtomParser
  ),
  Parsimmon.regexp(/or/i),
  Logic
);

const LogicParser: Parser<Expression> = Parsimmon.alt(
  OrParser,
  AndParser,
  EqualityParser,
  InequalityParser
);

const TernaryParser: Parser<Expression> = Parsimmon.lazy(() =>
  Parsimmon.seq(
    Parsimmon.alt(LogicParser, MathParser, ExpressionAtomParser),
    Parsimmon.string("?"),
    ExpressionParser,
    Parsimmon.string(":"),
    ExpressionParser
  ).map(
    ([condition, _1, trueExpr, _2, falseExpr]) =>
      new Ternary(condition, trueExpr, falseExpr)
  )
);

export const ExpressionParser: Parser<Expression> = Parsimmon.lazy(() =>
  Parsimmon.alt(TernaryParser, LogicParser, MathParser, ExpressionAtomParser)
);

const templateExpressionRegex = /{{(.*?)}}/g;

export function evalAndReplace(context: Context, text: string) {
  return text.replace(templateExpressionRegex, (_, match) =>
    ExpressionParser.tryParse(match).calc(context)
  );
}

export function parseAll(text?: string): Expression[] {
  if (!text) {
    return [];
  }
  return Array.from(
    text.matchAll(templateExpressionRegex),
    ([_, matchedText]) => ExpressionParser.tryParse(matchedText)
  );
}

export function replaceWithParsedExpressions(
  context: Context,
  expressions: Expression[],
  text: string
): string {
  let i = 0;
  const evalText = text.replace(templateExpressionRegex, (_, match) => {
    const evalResult = expressions[i].calc(context);
    i++;
    return evalResult;
  });

  return evalText;
}
