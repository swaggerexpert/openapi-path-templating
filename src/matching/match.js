import parse from '../parse/index.js';
import { astToRegExp } from '../to-regexp.js';
import identityNormalizer from '../normalization/identity.js';
import OpenAPIPathTemplatingParseError from '../errors/OpenAPIPathTemplatingParseError.js';
import templateExpressionNames, { hasRepeatedNames } from '../template-expression-names.js';

const decodeIdentity = (value) => value;

/**
 * Concrete paths standing for all concrete paths matched by path template.
 * Template expressions are replaced by `{`, a single character that only template expressions
 * of other path templates match, and template expression matching it matches any value.
 */
const toInstances = ({ segments, trailingSlash }, { optionalTrailingSlash }) => {
  const path = segments
    .map(({ parts }) =>
      parts.map((part) => (part.type === 'TemplateExpression' ? '{' : part.value)).join(''),
    )
    .join('/');
  const instance = `/${path}${trailingSlash ? '/' : ''}`;

  if (!optionalTrailingSlash || segments.length === 0) return [instance];
  return [`/${path}`, `/${path}/`];
};

const compile = (pathTemplate, options) => {
  if (typeof pathTemplate !== 'string') {
    throw new TypeError('Path template must be a string');
  }

  const parseResult = parse(options.normalizer(pathTemplate));

  if (!parseResult.result.success) {
    throw new OpenAPIPathTemplatingParseError(`Invalid path template: "${pathTemplate}"`, {
      pathTemplate,
    });
  }

  const ast = parseResult.tree;
  const names = templateExpressionNames(ast);

  if (hasRepeatedNames(names)) {
    throw new OpenAPIPathTemplatingParseError(
      `Repeated template expression name in path template: "${pathTemplate}"`,
      { pathTemplate },
    );
  }

  return {
    pathTemplate,
    names,
    regExp: astToRegExp(ast, options),
    instances: toInstances(ast, options),
  };
};

/**
 * Every concrete path matched by candidate is matched by other.
 * Both are compiled with the same options, so it holds for matching with these options.
 */
const isCovered = (candidate, other) =>
  candidate.instances.every((instance) => other.regExp.test(instance));

const isMoreConcrete = (candidate, other) =>
  isCovered(candidate, other) && !isCovered(other, candidate);

/**
 * Creates function matching concrete paths against path templates.
 */
const match = (
  pathTemplates,
  {
    precedence = 'concrete',
    decode = decodeURIComponent,
    normalizer = identityNormalizer,
    prefix = false,
    optionalTrailingSlash = false,
    caseSensitive = true,
  } = {},
) => {
  if (precedence !== 'concrete' && precedence !== 'order') {
    throw new TypeError(`Unsupported precedence: "${precedence}"`);
  }
  if (decode !== false && typeof decode !== 'function') {
    throw new TypeError('Decode must be a function or false');
  }

  const options = { normalizer, prefix, optionalTrailingSlash, caseSensitive };
  const compiled = (Array.isArray(pathTemplates) ? pathTemplates : [pathTemplates]).map(
    (pathTemplate) => compile(pathTemplate, options),
  );
  const decodeValue = decode === false ? decodeIdentity : decode;
  // for every path template, indexes of path templates that are more concrete
  const moreConcrete = compiled.map((candidate) =>
    precedence === 'concrete'
      ? compiled.flatMap((other, index) => (isMoreConcrete(other, candidate) ? [index] : []))
      : [],
  );

  /**
   * Path template with malformed percent-encoding in template expression values doesn't match.
   */
  const toResult = (candidate, path) => {
    const matchResult = candidate.regExp.exec(path);
    if (matchResult === null) return null;

    const parameters = Object.create(null);

    try {
      candidate.names.forEach((name, index) => {
        parameters[name] = decodeValue(matchResult[index + 1]);
      });
    } catch (error) {
      if (error instanceof URIError) return null;
      throw error;
    }

    return { pathTemplate: candidate.pathTemplate, parameters };
  };

  return (path) => {
    if (typeof path !== 'string') return null;

    // query and fragment are not part of the path
    const pathOnly = path.split(/[?#]/, 1)[0];

    if (!pathOnly.startsWith('/')) return null;

    const normalizedPath = normalizer(pathOnly);

    if (precedence === 'order') {
      for (const candidate of compiled) {
        const result = toResult(candidate, normalizedPath);
        if (result !== null) return result;
      }
      return null;
    }

    const results = new Map();
    compiled.forEach((candidate, index) => {
      const result = toResult(candidate, normalizedPath);
      if (result !== null) results.set(index, result);
    });

    // most concrete matching path template wins; list order breaks ties
    for (const [index, result] of results) {
      if (!moreConcrete[index].some((other) => results.has(other))) return result;
    }

    return null;
  };
};

export default match;
