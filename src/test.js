import parse from './parse/index.js';

const test = (str) => {
  try {
    const parseResult = parse(str);

    if (!parseResult.result.success) return false;

    const parts = [];
    parseResult.ast.translate(parts);
    return parts.some(([type]) => type === 'path-template')
  } catch {
    return false;
  }
};

export default test;

