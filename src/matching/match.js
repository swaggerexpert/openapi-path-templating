import parse from '../parse/index.js';
import toRegExp from '../to-regexp.js';
import identityNormalizer from '../normalization/identity.js';
import { isSubset } from './path-template-sets.js';

const decodeIdentity = (value) => value;

/**
 * Path template is more concrete when it matches a strict subset of concrete paths of the other one.
 */
const isMoreConcrete = (candidate, other) =>
  isSubset(candidate.ast, other.ast) && !isSubset(other.ast, candidate.ast);

const compile = (pathTemplate, { normalizer, prefix, optionalTrailingSlash, caseSensitive }) => {
  if (typeof pathTemplate !== 'string') {
    throw new TypeError('Path template must be a string');
  }

  const normalized = normalizer(pathTemplate);
  const regExp = toRegExp(normalized, { prefix, optionalTrailingSlash, caseSensitive });
  const { tree: ast } = parse(normalized);
  const names = ast.segments
    .flatMap(({ parts }) => parts)
    .filter(({ type }) => type === 'TemplateExpression')
    .map(({ name }) => name);

  return { pathTemplate, regExp, ast, names };
};

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

  const toResult = (candidate, matchResult) => {
    const parameters = Object.create(null);

    try {
      candidate.names.forEach((name, index) => {
        parameters[name] = decodeValue(matchResult[index + 1]);
      });
    } catch {
      return null; // malformed percent-encoding
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
        const matchResult = candidate.regExp.exec(normalizedPath);
        if (matchResult !== null) return toResult(candidate, matchResult);
      }
      return null;
    }

    const matches = new Map();
    compiled.forEach((candidate, index) => {
      const matchResult = candidate.regExp.exec(normalizedPath);
      if (matchResult !== null) matches.set(index, matchResult);
    });

    // most concrete matching path template wins; list order breaks ties
    for (const [index, matchResult] of matches) {
      if (!moreConcrete[index].some((other) => matches.has(other))) {
        return toResult(compiled[index], matchResult);
      }
    }

    return null;
  };
};

export default match;
