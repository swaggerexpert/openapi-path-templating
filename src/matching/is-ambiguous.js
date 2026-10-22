import parse from '../parse/index.js';
import normalize from '../normalization/index.js';
import { overlaps, isSubset } from './path-template-sets.js';

const isAmbiguous = (pathTemplate1, pathTemplate2, { normalizer = normalize } = {}) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(normalizer(pathTemplate1));
  const parseResult2 = parse(normalizer(pathTemplate2));

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  const ast1 = parseResult1.tree;
  const ast2 = parseResult2.tree;

  return overlaps(ast1, ast2) && !isSubset(ast1, ast2) && !isSubset(ast2, ast1);
};

export default isAmbiguous;
