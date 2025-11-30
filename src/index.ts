import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LabIcon } from '@jupyterlab/ui-components';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { makefileSimple as makefile } from './makefile-mode-simple';

// Makefile icon - file with gears (from text-x-makefile-svgrepo-com.svg)
const makefileIconStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="23 11 82 106"><path fill="#c2544f" d="m29.09375,11.234375c-3.183804,0-5.71875,2.566196-5.71875,5.75l0,94.031255c0,3.1838 2.534946,5.75 5.71875,5.75l69.8125,0c3.1838,0 5.71875-2.5662 5.71875-5.75l0-70.656255-21.03125,0c-4.306108,0-8.0625-3.141109-8.0625-7.3125l0-21.8125-46.4375,0zm50.4375,0 0,21.8125c0,1.714122 1.631968,3.3125 4.0625,3.3125l21.03125,0-25.09375-25.125zm-32.34375,29.3125 1.71875,0 1.65625,3.5.03125.75-.53125,2.4375 3.25,1.3125 1.3125-2.0625.59375-.53125 3.59375-1.25 1.25,1.21875-1.28125,3.59375-.5.59375-2.0625,1.3125 1.3125,3.28125 2.40625-.5625.78125.03125 3.46875,1.65625 0,1.75-3.46875,1.65625-.78125,0-2.40625-.5-1.3125,3.21875 2.0625,1.375.5.59375 1.28125,3.59375-1.25,1.25-3.59375-1.28125-.59375-.5625-1.3125-2.0625-3.25,1.34375.53125,2.40625-.03125.78125-1.65625,3.4375-1.71875,0-1.65625-3.4375-.0625-.78125.53125-2.40625-3.25-1.34375-1.3125,2.0625-.59375.5625-3.59375,1.28125-1.25-1.25 1.28125-3.59375.5625-.59375 2.0625-1.375-1.34375-3.21875-2.40625.5-.8125,0-3.46875-1.65625 0-1.75 3.46875-1.65625.8125-.03125 2.40625.5625 1.34375-3.28125-2.0625-1.3125-.5625-.59375L36,45.921875l1.25-1.21875 3.59375,1.25.59375.53125 1.3125,2.0625 3.25-1.3125-.53125-2.4375.0625-.75 1.65625-3.5zm.875,10.875c-2.927972,0-5.34375,2.353278-5.34375,5.28125 0,2.927972 2.415778,5.3125 5.34375,5.3125 2.927972,0 5.28125-2.384528 5.28125-5.3125 0-2.927972-2.353278-5.28125-5.28125-5.28125zm18.15625,10.3125 3.09375,3.34375.46875,1.15625.40625,2.75 4.46875,0 .40625-2.75.4375-1.15625 3.125-3.34375 2.25.71875.53125,4.53125-.28125,1.21875-1.3125,2.4375 3.625,2.65625 1.90625-2 1.0625-.625 4.5-.90625 1.375,1.90625-2.21875,3.96875-.96875.8125-2.46875,1.1875 1.40625,4.28125 2.71875-.46875 1.21875.09375 4.15625,1.90625 0,2.34375-4.15625,1.9375-1.21875.09375-2.71875-.46875-1.40625,4.25 2.46875,1.21875.96875.78125 2.21875,4.03125-1.375,1.875-4.5-.875-1.0625-.65625-1.90625-2-3.625,2.65625 1.3125,2.406255.28125,1.21875-.53125,4.5625-2.25.75-3.125-3.40625-.4375-1.125-.40625-2.71875-4.46875,0-.40625,2.71875-.46875,1.125-3.09375,3.40625-2.25-.75-.53125-4.5625.3125-1.21875 1.28125-2.406255-3.625-2.65625-1.9375,2-1.0625.65625-4.46875.875-1.375-1.875 2.21875-4.03125.9375-.78125 2.46875-1.21875-1.34375-4.25-2.71875.46875-1.21875-.09375-4.1875-1.9375 0-2.34375 4.1875-1.90625 1.21875-.09375 2.71875.46875 1.34375-4.28125-2.46875-1.1875-.9375-.8125-2.21875-3.96875 1.375-1.90625 4.46875.90625 1.0625.625 1.9375,2 3.625-2.65625-1.28125-2.4375-.3125-1.21875.53125-4.53125 2.25-.71875zm6.1875,14.09375c-4.866236,0-8.8125,3.946264-8.8125,8.8125 0,4.866238 3.946264,8.8125 8.8125,8.8125 4.866237,0 8.8125-3.946262 8.8125-8.8125 0-4.866236-3.946263-8.8125-8.8125-8.8125z"/></svg>`;

export const makefileIcon = new LabIcon({
  name: 'makefile:icon',
  svgstr: makefileIconStr
});

/**
 * Initialization data for the jupyterlab_makefile_file_type_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_makefile_file_type_extension:plugin',
  description:
    'Jupyterlab extension to add handling of Makefiles and syntax colouring support',
  autoStart: true,
  requires: [IEditorLanguageRegistry],
  activate: (app: JupyterFrontEnd, languages: IEditorLanguageRegistry) => {
    console.log(
      '[jupyterlab_makefile_file_type_extension v1.0.31-debug] Extension activated!'
    );

    // Register Makefile language support
    languages.addLanguage({
      name: 'makefile',
      displayName: 'Makefile',
      mime: 'text/x-makefile',
      extensions: ['.mk', '.mak', '.make', '.makefile'],
      filename: /^(Makefile|makefile|GNUmakefile|makefile\..*|.*\.(mk|mak|make|makefile))$/,
      support: new LanguageSupport(StreamLanguage.define(makefile))
    });

    // Register icon for Makefile file type
    app.docRegistry.addFileType({
      name: 'makefile',
      displayName: 'Makefile',
      mimeTypes: ['text/x-makefile'],
      extensions: ['.mk', '.mak', '.make', '.makefile'],
      pattern: '^(Makefile|makefile|GNUmakefile|makefile\\..*|.*\\.(mk|mak|make|makefile))$',
      fileFormat: 'text' as const,
      contentType: 'file' as const,
      icon: makefileIcon
    });

    // Register env files as shell script for syntax highlighting only (no icon)
    // Matches: .env, .env.*, env.*, *.env
    languages.addLanguage({
      name: 'dotenv',
      displayName: 'Environment File',
      mime: 'text/x-dotenv',
      extensions: [],
      filename: /^(\.env|\.env\..*|env\..*|.*\.env)$/,
      support: new LanguageSupport(StreamLanguage.define(shell))
    });
  }
};

export default plugin;
