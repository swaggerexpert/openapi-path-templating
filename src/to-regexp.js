import parse from './parse/index.js';
import OpenAPIPathTemplatingParseError from './errors/OpenAPIPathTemplatingParseError.js';

/**
 * Character matched by template expression: any character except `/`, `?` and `#`.
 * Percent-encoded octet is matched as a whole.
 */
const CHAR = '(?:%[0-9A-Fa-f]{2}|[^/?#%])';

/**
 * Escapes path literal; hexadecimal digits of percent-encoded octets are case-insensitive.
 */
const literalToRegExp = (literal) =>
  literal
    .replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
    .replace(/%[0-9A-Fa-f]{2}/g, (octet) =>
      octet.replace(/[A-Fa-f]/g, (digit) => `[${digit.toUpperCase()}${digit.toLowerCase()}]`),
    );

/**
 * Template expressions never backtrack, so matching takes linear time:
 *  - template expression followed by another template expression matches single character
 *  - template expression followed by path literal and another template expression matches
 *    up to the first occurrence of the path literal (lookahead with backreference acts as atomic group)
 *  - last template expression in path segment matches greedily
 */
const segmentToRegExp = ({ parts }, groupCounter) =>
  parts
    .map((part, index) => {
      if (part.type === 'PathLiteral') return literalToRegExp(part.value);

      groupCounter.value += 1;
      const next = parts[index + 1];

      if (next?.type === 'TemplateExpression') return `(${CHAR})`;
      if (next && parts[index + 2]) {
        return `(?=(${CHAR}+?)${literalToRegExp(next.value)})(?:\\${groupCounter.value})`;
      }
      return `(${CHAR}+)`;
    })
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
  const isRoot = segments.length === 0;
  const groupCounter = { value: 0 }; // backreferences need capturing group numbers
  let source = `^\\/${segments.map((segment) => segmentToRegExp(segment, groupCounter)).join('\\/')}`;

  if (!isRoot && optionalTrailingSlash) {
    // prefix match consumes trailing slash when present
    source += prefix ? '(?:\\/|(?=[/?#]|$))' : '\\/?';
  } else if (!isRoot && trailingSlash) {
    source += '\\/';
  } else if (!isRoot && prefix) {
    // prefix match ends at path segment boundary, query or fragment
    source += '(?=[/?#]|$)';
  }

  if (!prefix) source += '$';

  return new RegExp(source, caseSensitive ? '' : 'i');
};

export default toRegExp;
