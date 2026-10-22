import parse from './parse/index.js';
import OpenAPIPathTemplatingParseError from './errors/OpenAPIPathTemplatingParseError.js';

/**
 * Converts template expression name into URI Template variable name,
 * percent-encoding characters not allowed in variable names.
 * https://spec.openapis.org/oas/v3.2.0.html#illegal-variable-names-as-parameter-names
 */
const toVariableName = (name) =>
  encodeURIComponent(name).replace(
    /[^A-Za-z0-9_%]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
  );

/**
 * Converts path Parameter Object serialization fields into URI Template operator and modifier.
 * https://spec.openapis.org/oas/v3.2.0.html#equivalences-between-fields-and-rfc6570-operators
 */
const toExpression = (
  variableName,
  { style = 'simple', explode = false, allowReserved = false },
) => {
  const modifier = explode ? '*' : '';

  switch (style) {
    case 'simple':
      return `{${allowReserved ? '+' : ''}${variableName}${modifier}}`;
    case 'label':
      return `{.${variableName}${modifier}}`;
    case 'matrix':
      return `{;${variableName}${modifier}}`;
    default:
      throw new TypeError(`Unsupported style of path parameter: "${style}"`);
  }
};

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
 * Creates function converting template expression names into URI Template expressions.
 */
export const createExpressionConverter = (parameterObjects = []) => {
  const pathParameters = toPathParameters(parameterObjects);

  return (name) => {
    const variableName = toVariableName(name);
    return { variableName, expression: toExpression(variableName, pathParameters.get(name) ?? {}) };
  };
};

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

  const toURITemplateExpression = createExpressionConverter(parameterObjects);
  const { segments, trailingSlash } = parseResult.tree;
  const uriTemplateSegments = segments.map(({ parts }) =>
    parts
      // path literals consist of characters allowed in URI Template literals
      .map((part) =>
        part.type === 'PathLiteral' ? part.value : toURITemplateExpression(part.name).expression,
      )
      .join(''),
  );

  return `/${uriTemplateSegments.join('/')}${trailingSlash && segments.length > 0 ? '/' : ''}`;
};

export default toURITemplate;
