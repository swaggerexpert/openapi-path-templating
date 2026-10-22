import parse from '../parse/index.js';
import normalize from '../normalization/index.js';

/**
 * Template expression matches one or more characters except `/`.
 */
const TEMPLATE_EXPRESSION = Symbol('template-expression');
/**
 * Character that never appears in a path literal.
 */
const FRESH_CHAR = Symbol('fresh-char');

/**
 * Converts AST into a sequence of characters, percent-encoded octets and template expressions.
 * Percent-encoded octet is a single token, so template expression never matches part of it.
 */
const tokenize = (ast) => {
  const tokens = ['/'];

  ast.segments.forEach((segment, index) => {
    if (index > 0) tokens.push('/');
    segment.parts.forEach((part) => {
      if (part.type === 'PathLiteral') {
        const units = part.value.match(/%[0-9A-Fa-f]{2}|./gsu);
        tokens.push(...units.map((unit) => (unit.length === 3 ? unit.toUpperCase() : unit)));
      } else {
        tokens.push(TEMPLATE_EXPRESSION);
      }
    });
  });

  if (ast.trailingSlash) tokens.push('/');

  return tokens;
};

/**
 * Determines whether there is a concrete path matched by both token sequences.
 */
const intersects = (tokens1, tokens2) => {
  const visited = new Set();
  const stack = [[0, 0]];

  while (stack.length > 0) {
    const [i, j] = stack.pop();
    const key = i * (tokens2.length + 1) + j;

    if (visited.has(key)) continue;
    visited.add(key);

    if (i === tokens1.length && j === tokens2.length) return true;
    if (i === tokens1.length || j === tokens2.length) continue;

    const token1 = tokens1[i];
    const token2 = tokens2[j];
    const isExpression1 = token1 === TEMPLATE_EXPRESSION;
    const isExpression2 = token2 === TEMPLATE_EXPRESSION;

    if (!isExpression1 && !isExpression2) {
      if (token1 === token2) stack.push([i + 1, j + 1]);
    } else if (isExpression1 && isExpression2) {
      // both template expressions consume the same character and either may continue
      stack.push([i + 1, j], [i, j + 1], [i + 1, j + 1]);
    } else if (isExpression1 && token2 !== '/') {
      // template expression consumes the character and may continue
      stack.push([i, j + 1], [i + 1, j + 1]);
    } else if (isExpression2 && token1 !== '/') {
      stack.push([i + 1, j], [i + 1, j + 1]);
    }
  }

  return false;
};

/**
 * Determines whether every concrete path matched by tokens1 is matched by tokens2 as well.
 * Template expressions in tokens1 are replaced by a fresh character, which tokens2 can match
 * only by a template expression, and template expression matches any of its expansions.
 */
const isSubset = (tokens1, tokens2) => {
  const instance = tokens1.map((token) => (token === TEMPLATE_EXPRESSION ? FRESH_CHAR : token));
  return intersects(instance, tokens2);
};

const isAmbiguous = (pathTemplate1, pathTemplate2, { normalizer = normalize } = {}) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(normalizer(pathTemplate1));
  const parseResult2 = parse(normalizer(pathTemplate2));

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  const tokens1 = tokenize(parseResult1.tree);
  const tokens2 = tokenize(parseResult2.tree);

  if (!intersects(tokens1, tokens2)) return false;

  return !isSubset(tokens1, tokens2) && !isSubset(tokens2, tokens1);
};

export default isAmbiguous;
