import parse from './parse.js';
import OPERATORS from './operators.js';
import OpenAPIPathTemplatingError from '../errors/OpenAPIPathTemplatingError.js';
import OpenAPIPathTemplatingParseError from '../errors/OpenAPIPathTemplatingParseError.js';

/**
 * Encodes every character that is not unreserved.
 */
const encodeUnreserved = (value) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

/**
 * Encodes every character that is neither unreserved nor reserved, keeping percent-encoded octets.
 */
const encodeReserved = (value) =>
  value
    .split(/(%[0-9A-Fa-f]{2})/g)
    .map((part) =>
      /%[0-9A-Fa-f]{2}/.test(part)
        ? part
        : encodeURI(part).replace(/%5B/g, '[').replace(/%5D/g, ']'),
    )
    .join('');

const isDefined = (value) => value !== undefined && value !== null;

const isPlainObject = (value) => {
  if (typeof value !== 'object' || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Normalizes variable value: strings, lists, associative arrays or undefined.
 * Only plain objects are associative arrays, other values are converted to strings.
 * https://datatracker.ietf.org/doc/html/rfc6570#section-2.3
 */
export const toValue = (value) => {
  if (!isDefined(value)) return undefined;
  if (Array.isArray(value)) {
    const list = value.filter(isDefined).map(String);
    return list.length === 0 ? undefined : list;
  }
  if (isPlainObject(value)) {
    const pairs = Object.entries(value)
      .filter(([, member]) => isDefined(member))
      .map(([key, member]) => [key, String(member)]);
    return pairs.length === 0 ? undefined : pairs;
  }
  return String(value);
};

const expandVariable = ({ name, prefix, explode }, value, operator, uriTemplate) => {
  const { sep, named, ifemp, allowReserved } = operator;
  const encode = allowReserved ? encodeReserved : encodeUnreserved;
  // variable name is encoded as literal, names of associative array pairs as values
  const varname = encodeReserved(name);
  const withName = (encodedName, member) =>
    member === '' ? `${encodedName}${ifemp}` : `${encodedName}=${member}`;

  if (typeof value === 'string') {
    const truncated = prefix === undefined ? value : Array.from(value).slice(0, prefix).join('');
    return named ? withName(varname, encode(truncated)) : encode(truncated);
  }

  if (prefix !== undefined) {
    throw new OpenAPIPathTemplatingError(
      `Prefix modifier is not applicable to composite value of variable "${name}"`,
      { uriTemplate },
    );
  }

  const isList = typeof value[0] === 'string';

  if (!explode) {
    const members = isList
      ? value.map(encode)
      : value.flatMap(([key, member]) => [encode(key), encode(member)]);
    return named ? withName(varname, members.join(',')) : members.join(',');
  }

  if (isList) {
    return value
      .map((member) => (named ? withName(varname, encode(member)) : encode(member)))
      .join(sep);
  }

  return value
    .map(([key, member]) =>
      named ? withName(encode(key), encode(member)) : `${encode(key)}=${encode(member)}`,
    )
    .join(sep);
};

/**
 * Expands single expression of URI Template.
 */
export const expandExpression = (
  { operator: symbol, variables: varspecs },
  variables,
  uriTemplate,
) => {
  const operator = OPERATORS[symbol];

  if (operator === undefined) {
    throw new OpenAPIPathTemplatingParseError(
      `Unsupported operator "${symbol}" in URI Template: "${uriTemplate}"`,
      { uriTemplate },
    );
  }

  const expansions = varspecs.flatMap((variable) => {
    const value = Object.prototype.hasOwnProperty.call(variables, variable.name)
      ? toValue(variables[variable.name])
      : undefined;
    return value === undefined ? [] : [expandVariable(variable, value, operator, uriTemplate)];
  });

  return expansions.length === 0 ? '' : `${operator.first}${expansions.join(operator.sep)}`;
};

/**
 * Expands URI Template with variables.
 * https://datatracker.ietf.org/doc/html/rfc6570#section-3
 */
const expand = (uriTemplate, variables = {}) => {
  const parseResult = parse(uriTemplate);

  if (!parseResult.result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid URI Template: "${uriTemplate}"`, {
      uriTemplate,
    });
  }

  try {
    return parseResult.tree.parts
      .map((part) =>
        part.type === 'Literal'
          ? encodeReserved(part.value)
          : expandExpression(part, variables ?? {}, uriTemplate),
      )
      .join('');
  } catch (error) {
    // lone surrogates can't be encoded as UTF-8
    if (error instanceof URIError) {
      throw new OpenAPIPathTemplatingError('Malformed Unicode in URI Template expansion', {
        cause: error,
        uriTemplate,
      });
    }
    throw error;
  }
};

export default expand;
