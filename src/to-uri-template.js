import parse from './parse/index.js';
import OpenAPIPathTemplatingParseError from './errors/OpenAPIPathTemplatingParseError.js';

/**
 * Converts template expression name into URI Template variable name,
 * percent-encoding characters not allowed in variable names.
 * Dot is allowed between other characters of variable name.
 * https://spec.openapis.org/oas/v3.2.0.html#illegal-variable-names-as-parameter-names
 */
const toVariableName = (name) =>
  encodeURIComponent(name)
    .replace(
      /[^A-Za-z0-9_%.]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
    )
    .replace(/^\.|\.(?=\.|$)/g, '%2E');

/**
 * Path Parameter Objects by name; parameters are path parameters, unless their location says otherwise.
 */
const toPathParameters = (parameterObjects) => {
  const pathParameters = new Map();

  parameterObjects
    .filter(
      (parameter) =>
        typeof parameter?.name === 'string' &&
        (parameter.in === undefined || parameter.in === 'path'),
    )
    .forEach((parameter) => {
      if (!pathParameters.has(parameter.name)) pathParameters.set(parameter.name, parameter);
    });

  return pathParameters;
};

/**
 * Converts path Parameter Object serialization fields into URI Template operator.
 * https://spec.openapis.org/oas/v3.2.0.html#equivalences-between-fields-and-rfc6570-operators
 */
const toOperator = ({ style = 'simple', allowReserved = false }) => {
  switch (style) {
    case 'simple':
      return allowReserved ? '+' : '';
    case 'label':
      return '.';
    case 'matrix':
      return ';';
    default:
      throw new TypeError(`Unsupported style of path parameter: "${style}"`);
  }
};

/**
 * Creates function converting template expression names into URI Template expression nodes,
 * using path Parameter Objects.
 */
export const createExpressionFactory = (parameterObjects) => {
  const pathParameters = toPathParameters(parameterObjects ?? []);

  return (name) => {
    const parameterObject = pathParameters.get(name) ?? {};

    return {
      type: 'Expression',
      operator: toOperator(parameterObject),
      variables: [{ name, prefix: undefined, explode: Boolean(parameterObject.explode) }],
    };
  };
};

const stringifyExpression = ({ operator, variables: [{ name, explode }] }) =>
  `{${operator}${toVariableName(name)}${explode ? '*' : ''}}`;

/**
 * Converts path template into URI Template using path Parameter Objects.
 */
const toURITemplate = (pathTemplate, parameterObjects = []) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid path template: "${pathTemplate}"`, {
      pathTemplate,
    });
  }

  const toExpression = createExpressionFactory(parameterObjects);
  const { segments, trailingSlash } = parseResult.tree;

  try {
    const uriTemplateSegments = segments.map(({ parts }) =>
      parts
        // path literals consist of characters allowed in URI Template literals
        .map((part) =>
          part.type === 'PathLiteral' ? part.value : stringifyExpression(toExpression(part.name)),
        )
        .join(''),
    );

    return `/${uriTemplateSegments.join('/')}${trailingSlash ? '/' : ''}`;
  } catch (error) {
    // lone surrogates can't be percent-encoded
    if (error instanceof URIError) {
      throw new OpenAPIPathTemplatingParseError(
        `Malformed Unicode in template expression name of path template: "${pathTemplate}"`,
        { cause: error, pathTemplate },
      );
    }
    throw error;
  }
};

export default toURITemplate;
