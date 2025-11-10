import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LabIcon } from '@jupyterlab/ui-components';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';
import { makefile } from './makefile-mode';

// Import SVG icon as string
const makefileIconStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
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
        fileFormat: 'text',
        icon: makefileIcon
      },
      ['text/x-makefile']
    );
  }
};

export default plugin;
