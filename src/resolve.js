import parse from './parse/index.js';
import { createExpressionConverter } from './to-uri-template.js';
import expandURITemplate from './uri-template/expand.js';

const isEncoded = (pathSegment) => {
  try {
    return typeof pathSegment === 'string' && decodeURIComponent(pathSegment) !== pathSegment;
  } catch {
    return false;
  }
};

export const encodePathComponent = (pathSegment) => {
  if (isEncoded(pathSegment)) {
    return pathSegment;
  }

  return encodeURIComponent(pathSegment).replace(/%5B/g, '[').replace(/%5D/g, ']');
};

/**
 * Serializes parameter value using its Parameter Object, as defined by RFC 6570.
 * https://spec.openapis.org/oas/v3.2.0.html#appendix-c-using-rfc6570-based-serialization
 */
const createSerializer = (parameterObjects) => {
  const toURITemplateExpression = createExpressionConverter(parameterObjects);

  return (parameterValue, parameterName) => {
    const { variableName, expression } = toURITemplateExpression(parameterName);
    return expandURITemplate(expression, { [variableName]: parameterValue });
  };
};

const resolve = (pathTemplate, parameters, options = {}) => {
  const { parameterObjects } = options;

  if (parameterObjects !== undefined && options.encoder !== undefined) {
    throw new TypeError('Options encoder and parameterObjects cannot be used together');
  }

  const encoder =
    parameterObjects !== undefined
      ? createSerializer(parameterObjects)
      : (options.encoder ?? encodePathComponent);
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const { segments, trailingSlash } = parseResult.tree;
  const resolvedSegments = segments.map(({ parts }) =>
    parts
      .map((part) => {
        if (part.type === 'PathLiteral') return part.value;

        return Object.prototype.hasOwnProperty.call(parameters, part.name)
          ? encoder(parameters[part.name], part.name)
          : `{${part.name}}`;
      })
      .join(''),
  );

  return `/${resolvedSegments.join('/')}${trailingSlash && segments.length > 0 ? '/' : ''}`;
};

export default resolve;
