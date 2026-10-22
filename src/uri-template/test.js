import parse from './parse.js';
import OPERATORS from './operators.js';

/**
 * Tests if a string is a URI Template that can be expanded.
 * Operators reserved for future extensions are not supported.
 */
const test = (uriTemplate) => {
  try {
    const parseResult = parse(uriTemplate);

    if (!parseResult.result.success) return false;

    return parseResult.tree.parts.every(
      (part) =>
        part.type === 'Literal' || Object.prototype.hasOwnProperty.call(OPERATORS, part.operator),
    );
  } catch {
    return false;
  }
};

export default test;
