import { StringStream } from '@codemirror/language';
import { makefileSimple } from '../makefile-mode-simple';

// The lab packages pull in ES modules Jest does not transform; the patterns need none of them
jest.mock('@jupyterlab/ui-components', () => ({ LabIcon: class {} }));
jest.mock('@jupyterlab/codemirror', () => ({ IEditorLanguageRegistry: {} }));

/** Token types of each line, as [text, type] pairs for the typed tokens. */
function tokenize(lines: string[]): Array<Array<[string, string]>> {
  const state = makefileSimple.startState!(2);
  return lines.map(line => {
    const stream = new StringStream(line, 4, 2);
    const tokens: Array<[string, string]> = [];
    while (!stream.eol()) {
      stream.start = stream.pos;
      const type = makefileSimple.token(stream, state);
      expect(stream.pos).toBeGreaterThan(stream.start);
      if (type) {
        tokens.push([stream.current(), type]);
      }
    }
    return tokens;
  });
}

describe('makefile tokenizer', () => {
  it('highlights targets, special targets, conditionals and comments', () => {
    const [phony, target, cond, comment] = tokenize([
      '.PHONY: build',
      'build: deps',
      'ifeq ($(A),b)',
      '# note'
    ]);
    expect(phony[0]).toEqual(['.PHONY', 'builtin']);
    expect(target[0]).toEqual(['build', 'keyword.control strong']);
    expect(cond[0]).toEqual(['ifeq', 'builtin']);
    expect(comment).toEqual([['# note', 'comment']]);
  });

  it('highlights silent commands, variable references and strings', () => {
    const [recipe] = tokenize(['\t@echo "hi" $(NAME) \\']);
    expect(recipe[0]).toEqual(['\t@echo', 'builtin']);
    expect(recipe).toContainEqual(['"hi"', 'string']);
    expect(recipe).toContainEqual(['$(', 'property']);
    expect(recipe[recipe.length - 1]).toEqual(['\\', 'builtin']);
  });

  it('does not carry an unclosed $( into the next line', () => {
    const [, next] = tokenize(['X = $(shell ls', 'build: deps']);
    expect(next[0]).toEqual(['build', 'keyword.control strong']);
    expect(next.some(([, type]) => type === 'property')).toBe(false);
  });

  it('carries an open $( over a backslash continuation', () => {
    const [, next] = tokenize(['X = $(shell ls \\', '  -la)']);
    expect(next[next.length - 1]).toEqual([')', 'property']);
  });

  it('does not read VAR:=value as a target with dependencies', () => {
    const [line] = tokenize(['CC:=gcc']);
    expect(line).toEqual([['CC:=', 'variableName.definition strong']]);
  });
});

describe('file name patterns', () => {
  const added: Array<{ name: string; filename?: RegExp }> = [];
  beforeAll(async () => {
    const plugin = (await import('../index')).default;
    plugin.activate(
      { docRegistry: { addFileType: jest.fn() } } as any,
      { addLanguage: (spec: any) => added.push(spec) } as any
    );
  });
  const claims = (language: string, file: string) =>
    added.find(spec => spec.name === language)!.filename!.test(file);

  it('recognises Makefile names', () => {
    for (const file of ['Makefile', 'makefile', 'GNUmakefile', 'rules.mk']) {
      expect(claims('makefile', file)).toBe(true);
    }
    expect(claims('makefile', 'notes.txt')).toBe(false);
  });

  it('leaves env.py and env.d.ts to their own languages', () => {
    for (const file of ['.env', '.env.local', 'prod.env', 'env.example']) {
      expect(claims('dotenv', file)).toBe(true);
    }
    for (const file of ['env.py', 'env.d.ts', 'env.yaml']) {
      expect(claims('dotenv', file)).toBe(false);
    }
  });
});
