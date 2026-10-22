import { Parser } from 'apg-lite';

import Grammar from '../grammar.js';
import parse from '../parse/index.js';
import stringify, { stringifyPart } from '../stringify.js';

/**
 * Implementation of https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.2
 */

const grammar = new Grammar();
const parser = new Parser();

const percentEndingNormalizer = (pathTemplate) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  return stringify(parseResult.tree, (part) => {
    if (part.type !== 'PathLiteral') return stringifyPart(part);

    return part.value.replace(/%[0-9a-fA-F]{2}/g, (match) => {
      try {
        const char = decodeURIComponent(match);
        const { success } = parser.parse(grammar, 'unreserved', char);

        return success ? char : match;
      } catch {
        return match;
      }
    });
  });
};

export default percentEndingNormalizer;
