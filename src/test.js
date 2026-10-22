import parse from './parse/index.js';
import ListTranslator from './parse/translators/ListTranslator.js';

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
    const parseResult = parse(pathTemplate, { translator: strict ? new ListTranslator() : null });

    if (!parseResult.result.success) return false;
    if (!strict) return true;

    return parseResult.tree.some(([type]) => type === 'template-expression');
  } catch {
    return false;
  }
};

export default test;
