import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LabIcon } from '@jupyterlab/ui-components';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';
import { makefile } from './makefile-mode';

// Import SVG icon as string - build/settings icon with pale red color
const makefileIconStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#ef9a9a" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
</svg>`;

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
      'JupyterLab extension jupyterlab_makefile_file_type_extension is activated!'
    );

    // Register Makefile language support
    languages.addLanguage({
      name: 'makefile',
      displayName: 'Makefile',
      mime: 'text/x-makefile',
      extensions: ['.mk'],
      filename: /^(Makefile|makefile|GNUmakefile)$/,
      support: new LanguageSupport(StreamLanguage.define(makefile))
    });

    // Register icon for Makefile file type
    app.docRegistry.addFileType(
      {
        name: 'makefile',
        displayName: 'Makefile',
        mimeTypes: ['text/x-makefile'],
        extensions: ['.mk'],
        pattern: '^(Makefile|makefile|GNUmakefile)$',
        fileFormat: 'text',
        icon: makefileIcon
      },
      ['text/x-makefile']
    );
  }
};

export default plugin;
