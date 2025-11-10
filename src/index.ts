import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab_makefile_file_type_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_makefile_file_type_extension:plugin',
  description: 'Jupyterlab extension to add handling of Makefiles and syntax colouring support',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_makefile_file_type_extension is activated!');
  }
};

export default plugin;
