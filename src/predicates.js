import parse from './parse/index.js';

export const isIdentical = (pathTemplate1, pathTemplate2) => {
  if (typeof pathTemplate1 !== 'string') return false;
  if (typeof pathTemplate2 !== 'string') return false;

  const parseResult1 = parse(pathTemplate1);
  const parseResult2 = parse(pathTemplate2);
  const parts1 = [];
  const parts2 = [];

  if (!parseResult1.result.success) return false;
  if (!parseResult2.result.success) return false;

  parseResult1.ast.translate(parts1);
  parseResult2.ast.translate(parts2);

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
