import parse from './parse/index.js';
import { createExpressionFactory } from './to-uri-template.js';
import { expandExpression, toValue } from './uri-template/expand.js';
import OpenAPIPathTemplatingError from './errors/OpenAPIPathTemplatingError.js';

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
 * Resolves template expression using encoder; template expression without value is kept.
 */
const createEncoderResolver = (encoder) => (parameters, name) =>
  Object.prototype.hasOwnProperty.call(parameters, name)
    ? encoder(parameters[name], name)
    : `{${name}}`;

/**
 * Resolves template expression by serializing its value using Parameter Object, as defined by RFC 6570.
 * Template expression without value, or with undefined value as defined by RFC 6570, is kept.
 * https://spec.openapis.org/oas/v3.2.0.html#appendix-c-using-rfc6570-based-serialization
 */
const createSerializerResolver = (parameterObjects, pathTemplate) => {
  const toExpression = createExpressionFactory(parameterObjects);

  return (parameters, name) => {
    const value = Object.prototype.hasOwnProperty.call(parameters, name)
      ? parameters[name]
      : undefined;

    if (toValue(value) === undefined) return `{${name}}`;

    try {
      return expandExpression(toExpression(name), { [name]: value }, pathTemplate);
    } catch (error) {
      // lone surrogates can't be percent-encoded
      if (error instanceof URIError) {
        throw new OpenAPIPathTemplatingError('Malformed Unicode in path parameter serialization', {
          cause: error,
          pathTemplate,
        });
      }
      throw error;
    }
  };
};

const resolve = (pathTemplate, parameters, options = {}) => {
  const { parameterObjects, encoder } = options;
  const hasParameterObjects = parameterObjects !== undefined && parameterObjects !== null;

  if (hasParameterObjects && encoder !== undefined) {
    throw new TypeError('Options encoder and parameterObjects cannot be used together');
  }

  const resolveExpression = hasParameterObjects
    ? createSerializerResolver(parameterObjects, pathTemplate)
    : createEncoderResolver(encoder ?? encodePathComponent);
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const { segments, trailingSlash } = parseResult.tree;
  const resolvedSegments = segments.map(({ parts }) =>
    parts
      .map((part) =>
        part.type === 'PathLiteral' ? part.value : resolveExpression(parameters, part.name),
      )
      .join(''),
  );

  return `/${resolvedSegments.join('/')}${trailingSlash ? '/' : ''}`;
};

export default resolve;
