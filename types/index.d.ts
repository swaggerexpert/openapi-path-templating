type PathTemplate = string;
type ResolvedPath = string;

/**
 * Parsing
 */
export function parse(
  pathTemplate: PathTemplate,
  options?: ParseOptions & { readonly translator?: ASTTranslator },
): ParseResult<ASTNode>;
export function parse<TTree>(
  pathTemplate: PathTemplate,
  options: ParseOptions & { readonly translator: Translator<TTree> },
): ParseResult<TTree>;
export function parse(
  pathTemplate: PathTemplate,
  options: ParseOptions & { readonly translator: null },
): ParseResult<undefined>;

export interface ParseOptions {
  readonly translator?: Translator | null;
  readonly stats?: boolean;
  readonly trace?: boolean;
}

/**
 * Translators are apg-lite AST instances. Custom translators must extend
 * one of the provided translator classes rather than implement this interface from scratch.
 */
export interface Translator<TTree = unknown> {
  getTree(): TTree;
  init(rules: unknown, udts: unknown, chars: unknown): void;
  ruleDefined(index: number): boolean;
  udtDefined(index: number): boolean;
  down(callbackIndex: number, name: string): void;
  up(callbackIndex: number, name: string, phraseIndex: number, phraseLength: number): void;
  translate(data: unknown): void;
  setLength(length: number): void;
  getLength(): number;
  toXml(): string;
}

declare abstract class AST<TTree> implements Translator<TTree> {
  abstract getTree(): TTree;
  init(rules: unknown, udts: unknown, chars: unknown): void;
  ruleDefined(index: number): boolean;
  udtDefined(index: number): boolean;
  down(callbackIndex: number, name: string): void;
  up(callbackIndex: number, name: string, phraseIndex: number, phraseLength: number): void;
  translate(data: unknown): void;
  setLength(length: number): void;
  getLength(): number;
  toXml(): string;
}

export declare class ListTranslator extends AST<ListTree> {
  getTree(): ListTree;
  /**
   * @deprecated use `getTree()` instead
   */
  translate(parts: unknown[]): void;
}
export declare class CSTTranslator extends AST<CSTNode> {
  getTree(): CSTNode;
}
export declare class ASTTranslator extends AST<ASTNode> {
  getTree(): ASTNode;
}
export declare class XMLTranslator extends AST<XMLTree> {
  getTree(): XMLTree;
}

export type ListEntryType =
  | 'path-template'
  | 'slash'
  | 'path-literal'
  | 'template-expression'
  | 'template-expression-param-name';
export type ListEntry = [ListEntryType, string];
export type ListTree = ListEntry[];

export interface CSTNode {
  readonly type: ListEntryType | 'path-segment';
  readonly text: string;
  readonly start: number;
  readonly length: number;
  readonly children: CSTNode[];
}

export interface PathLiteralNode {
  readonly type: 'PathLiteral';
  readonly value: string;
}
export interface TemplateExpressionNode {
  readonly type: 'TemplateExpression';
  readonly name: string;
}
export interface PathSegmentNode {
  readonly type: 'PathSegment';
  readonly parts: Array<PathLiteralNode | TemplateExpressionNode>;
}
export interface PathTemplateNode {
  readonly type: 'PathTemplate';
  readonly segments: PathSegmentNode[];
  readonly trailingSlash: boolean;
}
export type ASTNode = PathTemplateNode;

export type XMLTree = string;

export interface ParseResult<TTree = ASTNode> {
  readonly result: {
    readonly success: boolean;
    readonly state: number;
    readonly stateName: string;
    readonly length: number;
    readonly matched: number;
    readonly maxMatched: number;
    readonly maxTreeDepth: number;
    readonly nodeHits: number;
  };
  readonly tree?: TTree;
  readonly stats?: Stats;
  readonly trace?: Trace;
  /**
   * @deprecated retained for backward compatibility, use `tree` instead
   */
  readonly ast: ListTranslator;
}

export interface Stats {
  displayStats(): string;
  displayHits(): string;
}

export declare class Trace {
  displayTrace(): string;
  inferExpectations(): Expectations;
}

export interface Expectations extends Array<string> {
  toString(): string;
}

/**
 * Validation
 */
export function test(pathTemplate: PathTemplate, options?: TestOptions): boolean;

interface TestOptions {
  readonly strict?: boolean;
}

/**
 * Resolving
 */
export function resolve(pathTemplate: PathTemplate, parameters: Parameters, options?: ResolveOptions): ResolvedPath;
export function encodePathComponent(parameterValue: string): string;

interface Parameters {
  [key: string]: any;
}

interface ResolveOptions {
  encoder: (paramterValue: string, parameterName?: string) => string;
}

/**
 * Regular expression
 */
export function toRegExp(pathTemplate: PathTemplate, options?: ToRegExpOptions): RegExp;

export interface ToRegExpOptions {
  readonly prefix?: boolean;
  readonly optionalTrailingSlash?: boolean;
  readonly caseSensitive?: boolean;
}

/**
 * Equivalence
 */
export function isIdentical(pathTemplate1: PathTemplate, pathTemplate2: PathTemplate, options?: EquivalenceOptions): boolean;

export interface EquivalenceOptions {
  normalizer?: Normalizer;
}

/**
 * Ambiguity
 */
export function isAmbiguous(pathTemplate1: PathTemplate, pathTemplate2: PathTemplate, options?: AmbiguityOptions): boolean;

export interface AmbiguityOptions {
  normalizer?: Normalizer;
}

/**
 * Matching
 */
export function match(pathTemplates: PathTemplate | readonly PathTemplate[], options?: MatchOptions): MatchFunction;

export interface MatchOptions extends ToRegExpOptions {
  readonly precedence?: 'concrete' | 'order';
  readonly decode?: ((value: string) => string) | false;
  readonly normalizer?: Normalizer;
}

export type MatchFunction = (path: string) => MatchResult | null;

export interface MatchResult {
  readonly pathTemplate: PathTemplate;
  readonly parameters: Record<string, string>;
}

/**
 * Normalization
 */
export function normalize(pathTemplate: PathTemplate): PathTemplate;
export const identityNormalizer: Normalizer;
export const caseNormalizer: Normalizer;
export const percentEncodingNormalizer: Normalizer;
export const percentEndingNormalizer: Normalizer;
export const pathSegmentNormalizer: Normalizer;

export interface Normalizer {
  (pathTemplate: PathTemplate): PathTemplate;
}

/**
 * Grammar
 */

export function Grammar(): Grammar;

export interface Grammar {
  grammarObject: string; // Internal identifier
  rules: Rule[]; // List of grammar rules
  udts: UDT[]; // User-defined terminals (empty in this grammar)
  toString(): string; // Method to return the grammar in ABNF format
}

export interface Rule {
  name: string; // Rule name
  lower: string; // Lowercased rule name
  index: number; // Rule index
  isBkr: boolean; // Is this a back-reference?
  opcodes?: Opcode[]; // List of opcodes for the rule
}

export type Opcode =
  | { type: 1; children: number[] } // ALT (alternation)
  | { type: 2; children: number[] } // CAT (concatenation)
  | { type: 3; min: number; max: number } // REP (repetition)
  | { type: 4; index: number } // RNM (rule reference)
  | { type: 5; min: number; max: number } // TRG (terminal range)
  | { type: 6 | 7; string: number[] }; // TBS or TLS (byte sequence or literal string)

export type UDT = {}; // User-defined terminals (empty in this grammar)

/**
 * Errors
 */
export interface OpenAPIPathTemplatingErrorOptions {
  readonly cause?: unknown;
  readonly [key: string]: unknown;
}

export declare class OpenAPIPathTemplatingError extends Error {
  constructor(message?: string, options?: OpenAPIPathTemplatingErrorOptions);
}
export declare class OpenAPIPathTemplatingParseError extends OpenAPIPathTemplatingError {
  pathTemplate?: PathTemplate;
}
