interface ParseResult {
  readonly result: {
    readonly success: boolean;
  }
  readonly ast: {
    readonly translate: (parts: any[]) => Array<[string, string]>;
    readonly toXml: () => string;
  };
}

interface TestOptions {
  readonly strict?: boolean;
}

interface ResolveParameters {
  [key: string]: any;
}

export function parse(str: string): ParseResult;
export function test(str: string, options?: TestOptions): boolean;
export function resolve(pathTemplate: string, parameters: ResolveParameters): string;
