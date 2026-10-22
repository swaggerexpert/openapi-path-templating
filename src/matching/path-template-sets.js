/**
 * Relations between sets of concrete paths matched by path templates.
 */

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
const isSegmentSubset = (tokens1, tokens2) =>
  intersects(
    tokens1.map((token) => (token === TEMPLATE_EXPRESSION ? FRESH_CHAR : token)),
    tokens2,
  );

/**
 * Pairs tokenized path segments of path templates with the same number of segments and trailing slash;
 * other path templates never match the same concrete path.
 */
const pairSegments = (ast1, ast2) => {
  if (ast1.trailingSlash !== ast2.trailingSlash) return null;
  if (ast1.segments.length !== ast2.segments.length) return null;

  return ast1.segments.map((segment, index) => [tokenize(segment), tokenize(ast2.segments[index])]);
};

/**
 * Determines whether there is a concrete path matched by both path templates.
 */
export const overlaps = (ast1, ast2) => {
  const segments = pairSegments(ast1, ast2);
  return segments !== null && segments.every(([tokens1, tokens2]) => intersects(tokens1, tokens2));
};

/**
 * Determines whether every concrete path matched by ast1 is matched by ast2 as well.
 */
export const isSubset = (ast1, ast2) => {
  const segments = pairSegments(ast1, ast2);
  return (
    segments !== null && segments.every(([tokens1, tokens2]) => isSegmentSubset(tokens1, tokens2))
  );
};
