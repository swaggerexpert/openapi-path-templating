import parse from '../parse/index.js';
import normalize from '../normalization/index.js';

const isIdentical = (pathTemplate1, pathTemplate2, { normalizer = normalize } = {}) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(normalizer(pathTemplate1));
  const parseResult2 = parse(normalizer(pathTemplate2));

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  const parts1 = parseResult1.tree;
  const parts2 = parseResult2.tree;

  if (parts1.length !== parts2.length) return false;

  for (let i = 1; i < parts1.length; i++) {
    const [type1, value1] = parts1[i];
    const [type2, value2] = parts2[i];

    if (type1 !== type2) return false;
    if (type1 === 'template-expression' || type1 === 'template-expression-param-name') continue;
    if (value1 !== value2) return false;
  }

  return true;
};

export default isIdentical;
