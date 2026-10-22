import parse from './parse/index.js';
import OpenAPIPathTemplatingParseError from './errors/OpenAPIPathTemplatingParseError.js';

/**
 * Template expression matches one or more characters except `/`, `?` and `#`.
 * Percent-encoded octet is matched as a whole.
 */
const TEMPLATE_EXPRESSION = '((?:%[0-9A-Fa-f]{2}|[^/?#%])+)';

/**
 * Escapes path literal; hexadecimal digits of percent-encoded octets are case-insensitive.
 */
const literalToRegExp = (literal) =>
  literal
    .replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
    .replace(/%[0-9A-Fa-f]{2}/g, (octet) =>
      octet.replace(/[A-Fa-f]/g, (digit) => `[${digit.toUpperCase()}${digit.toLowerCase()}]`),
    );

const toRegExp = (
  pathTemplate,
  { prefix = false, optionalTrailingSlash = false, caseSensitive = true } = {},
) => {
  if (!parse(pathTemplate, { translator: null }).result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid path template: "${pathTemplate}"`, {
      pathTemplate,
    });
  }

  const hasOptionalTrailingSlash = optionalTrailingSlash && pathTemplate !== '/';
  const path = hasOptionalTrailingSlash ? pathTemplate.replace(/\/$/, '') : pathTemplate;
  // valid path template consists of template expressions and path literals only
  let source = path.replace(/\{[^}]+\}|[^{]+/g, (match) =>
    match.startsWith('{') ? TEMPLATE_EXPRESSION : literalToRegExp(match),
  );

  if (hasOptionalTrailingSlash) source += '\\/?';

  if (!prefix) {
    source += '$';
  } else if (!source.endsWith('\\/')) {
    // prefix match must end at segment boundary
    source += '(?=\\/|$)';
  }

  return new RegExp(`^${source}`, caseSensitive ? '' : 'i');
};

export default toRegExp;
