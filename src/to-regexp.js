import parse from './parse/index.js';
import OpenAPIPathTemplatingParseError from './errors/OpenAPIPathTemplatingParseError.js';

/**
 * Template expression matches one or more characters except `/`, `?` and `#`.
 * Percent-encoded octet is matched as a whole.
 */
const TEMPLATE_EXPRESSION = '((?:%[0-9A-Fa-f]{2}|[^/?#%])+)';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * Hexadecimal digits of percent-encoded octet are case-insensitive.
 */
const hexDigitToRegExp = (digit) =>
  /[A-Fa-f]/.test(digit) ? `[${digit.toUpperCase()}${digit.toLowerCase()}]` : digit;

const literalToRegExp = (value) =>
  value
    .match(/%[0-9A-Fa-f]{2}|[\s\S]/gu)
    .map((char) =>
      char.length === 3
        ? `%${hexDigitToRegExp(char[1])}${hexDigitToRegExp(char[2])}`
        : escapeRegExp(char),
    )
    .join('');

const toRegExp = (
  pathTemplate,
  { prefix = false, optionalTrailingSlash = false, caseSensitive = true } = {},
) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid path template: "${pathTemplate}"`, {
      pathTemplate,
    });
  }

  const { segments, trailingSlash } = parseResult.tree;
  const parameters = [];
  const source = segments
    .map((segment) =>
      segment.parts
        .map((part) => {
          if (part.type === 'PathLiteral') return literalToRegExp(part.value);
          parameters.push(part.name);
          return TEMPLATE_EXPRESSION;
        })
        .join(''),
    )
    .join('\\/');

  const isRoot = segments.length === 0;
  const endsWithSlash = isRoot || (trailingSlash && !optionalTrailingSlash);
  let pattern = `^\\/${source}`;

  if (!isRoot && optionalTrailingSlash) {
    pattern += '\\/?';
  } else if (!isRoot && trailingSlash) {
    pattern += '\\/';
  }

  if (!prefix) {
    pattern += '$';
  } else if (!endsWithSlash) {
    // prefix match must end at segment boundary
    pattern += '(?=\\/|$)';
  }

  return {
    regExp: new RegExp(pattern, caseSensitive ? '' : 'i'),
    parameters,
  };
};

export default toRegExp;
