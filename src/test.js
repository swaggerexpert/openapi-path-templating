import parse from './parse/index.js';
import templateExpressionNames, { hasRepeatedNames } from './template-expression-names.js';

/**
 * Test if a string is a path template.
 *
 * @param {string} pathTemplate
 * @param {Object} [options={}] - An object.
 * @param {boolean} [options.strict=true] - A boolean indicating presence of at least one `template-expression` AST node.
 * @returns {boolean}
 */
const test = (pathTemplate, { strict = false } = {}) => {
  try {
    const parseResult = parse(pathTemplate);

    if (!parseResult.result.success) return false;

    const names = templateExpressionNames(parseResult.tree);

    // each template expression must not appear more than once in a path template
    if (hasRepeatedNames(names)) return false;

    return !strict || names.length > 0;
  } catch {
    return false;
  }
};

export default test;
