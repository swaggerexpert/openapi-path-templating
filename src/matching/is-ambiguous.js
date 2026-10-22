import parse from '../parse/index.js';
import normalize from '../normalization/index.js';

/**
 * Template expression matches one or more characters.
 * It never matches `/`, so path templates are compared segment by segment.
 */
const TEMPLATE_EXPRESSION = Symbol('template-expression');
/**
 * Character that never appears in a path literal.
 */
const FRESH_CHAR = Symbol('fresh-char');

/**
 * Converts path segment into a sequence of characters and template expressions.
 * Percent-encoded octet is a single character.
 */
const tokenize = (segment) =>
  segment.parts.flatMap((part) => {
    if (part.type === 'TemplateExpression') return [TEMPLATE_EXPRESSION];
    return part.value
      .match(/%[0-9A-Fa-f]{2}|./gsu)
      .map((char) => (char.length === 3 ? char.toUpperCase() : char));
  });

/**
 * Determines whether there is a value matched by both token sequences.
 * Every step consumes one character; template expression either continues or ends.
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

    const isExpression1 = tokens1[i] === TEMPLATE_EXPRESSION;
    const isExpression2 = tokens2[j] === TEMPLATE_EXPRESSION;

    if (!isExpression1 && !isExpression2 && tokens1[i] !== tokens2[j]) continue;

    for (const nextI of isExpression1 ? [i, i + 1] : [i + 1]) {
      for (const nextJ of isExpression2 ? [j, j + 1] : [j + 1]) {
        stack.push([nextI, nextJ]);
      }
    }
  }

  return false;
};

/**
 * Determines whether every value matched by tokens1 is matched by tokens2 as well.
 * Template expressions in tokens1 are replaced by a fresh character, which tokens2 can match
 * only by a template expression, and template expression matches any of its expansions.
 */
const isSubset = (tokens1, tokens2) =>
  intersects(
    tokens1.map((token) => (token === TEMPLATE_EXPRESSION ? FRESH_CHAR : token)),
    tokens2,
  );

const isAmbiguous = (pathTemplate1, pathTemplate2, { normalizer = normalize } = {}) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(normalizer(pathTemplate1));
  const parseResult2 = parse(normalizer(pathTemplate2));

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  const ast1 = parseResult1.tree;
  const ast2 = parseResult2.tree;

  if (ast1.trailingSlash !== ast2.trailingSlash) return false;
  if (ast1.segments.length !== ast2.segments.length) return false;

  const segments = ast1.segments.map((segment, index) => [
    tokenize(segment),
    tokenize(ast2.segments[index]),
  ]);

  if (!segments.every(([tokens1, tokens2]) => intersects(tokens1, tokens2))) return false;

  const isSubset1 = segments.every(([tokens1, tokens2]) => isSubset(tokens1, tokens2));
  const isSubset2 = segments.every(([tokens1, tokens2]) => isSubset(tokens2, tokens1));

  return !isSubset1 && !isSubset2;
};

export default isAmbiguous;
