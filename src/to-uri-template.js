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
 * Converts path template into URI Template using path Parameter Objects.
 */
const toURITemplate = (pathTemplate, parameters = []) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid path template: "${pathTemplate}"`, {
      pathTemplate,
    });
  }

  const pathParameters = new Map();
  parameters
    // parameters are path parameters, unless their location says otherwise
    .filter(
      (parameter) =>
        typeof parameter?.name === 'string' &&
        (parameter.in === undefined || parameter.in === 'path'),
    )
    .forEach((parameter) => {
      if (!pathParameters.has(parameter.name)) pathParameters.set(parameter.name, parameter);
    });

  const variables = {};
  const { segments, trailingSlash } = parseResult.tree;
  const uriTemplateSegments = segments.map(({ parts }) =>
    parts
      .map((part) => {
        // path literals consist of characters allowed in URI Template literals
        if (part.type === 'PathLiteral') return part.value;

        const variableName = toVariableName(part.name);
        variables[part.name] = variableName;
        return toExpression(variableName, pathParameters.get(part.name) ?? {});
      })
      .join(''),
  );

  return {
    uriTemplate: `/${uriTemplateSegments.join('/')}${trailingSlash && segments.length > 0 ? '/' : ''}`,
    variables,
  };
};

export default toURITemplate;
