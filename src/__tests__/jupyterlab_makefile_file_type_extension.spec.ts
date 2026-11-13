import { StringStream } from '@codemirror/language';
import { makefileSimple } from '../makefile-mode-simple';

// The lab packages pull in ES modules Jest does not transform; the patterns need none of them
jest.mock('@jupyterlab/ui-components', () => ({
  LabIcon: class {
    constructor(options: object) {
      Object.assign(this, options);
    }
  }
}));
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

  it('colours uppercase targets and lowercase assignments', () => {
    const [force, docker, objects] = tokenize([
      'FORCE:',
      'Dockerfile: base',
      'objects = main.o'
    ]);
    expect(force[0]).toEqual(['FORCE', 'keyword.control strong']);
    expect(docker[0]).toEqual(['Dockerfile', 'keyword.control strong']);
    expect(objects[0]).toEqual(['objects =', 'variableName.definition strong']);
  });

  it('colours pattern rules and targets with a path', () => {
    const [pattern, path] = tokenize(['%.o: %.c', 'src/main.o: src/main.c']);
    expect(pattern[0]).toEqual(['%.o', 'keyword.control strong']);
    expect(path[0]).toEqual(['src/main.o', 'keyword.control strong']);
    expect(path).toContainEqual(['s', 'processingInstruction']);
  });

  it('colours a conditional indented with spaces', () => {
    const [cond] = tokenize(['  ifeq ($(OS),Linux)']);
    expect(cond[0]).toEqual(['  ifeq', 'builtin']);
  });

  it('gives a space-indented @command no recipe colour', () => {
    const [spaces, tab] = tokenize(['    @echo hi', '\t@echo hi']);
    expect(spaces).toEqual([]);
    expect(tab[0]).toEqual(['\t@echo', 'builtin']);
  });
});

describe('file name patterns', () => {
  const added: Array<{ name: string; filename?: RegExp }> = [];
  const addFileType = jest.fn();
  beforeAll(async () => {
    const plugin = (await import('../index')).default;
    plugin.activate(
      { docRegistry: { addFileType } } as any,
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

  it('registers the red gears icon for Makefile names', () => {
    const [fileType] = addFileType.mock.calls[0];
    expect(fileType.icon.name).toBe('makefile:icon');
    expect(fileType.icon.svgstr).toContain('fill="#c2544f"');
    for (const file of ['Makefile', 'makefile', 'GNUmakefile', 'rules.mk']) {
      expect(new RegExp(fileType.pattern).test(file)).toBe(true);
    }
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
