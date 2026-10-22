import parse from '../parse/index.js';
import normalize from '../normalization/index.js';

/**
 * Reconstructs path template from AST with template expressions replaced by `{}`.
 * Path literals never contain `{`, `}` or `/`, so different shapes never produce the same string.
 */
const toShape = (ast) => {
  const segments = ast.segments.map((segment) =>
    segment.parts.map((part) => (part.type === 'TemplateExpression' ? '{}' : part.value)).join(''),
  );
  return `/${segments.join('/')}${ast.trailingSlash ? '/' : ''}`;
};

const isIdentical = (pathTemplate1, pathTemplate2, { normalizer = normalize } = {}) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(normalizer(pathTemplate1));
  const parseResult2 = parse(normalizer(pathTemplate2));

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  return toShape(parseResult1.tree) === toShape(parseResult2.tree);
};

export default isIdentical;
