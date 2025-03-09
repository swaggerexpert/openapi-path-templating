export { default as Grammar } from './path-templating.js';
export { default as test } from './test.js';
export { default as parse } from './parse/index.js';
export { default as resolve, encodePathComponent } from './resolve.js';
export {
  identityNormalizer,
  caseNormalizer,
  pathSegmentNormalizer,
  percentEndingNormalizer,
  default as normalize,
} from './normalization/index.js';
export { default as isIdentical } from './equivalence/is-identical.js';
