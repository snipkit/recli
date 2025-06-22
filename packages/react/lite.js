/**
 * To use the lite build:
 *
 *    // Change all imports from '@khulnasoft.com/react' to '@khulnasoft.com/react/lite'
 *    import { KhulnasoftComponent } from '@khulnasoft.com/react/lite';
 *
 *    // Import only what built-in components you like
 *    import '@khulnasoft.com/react/dist/lib/src/blocks/Button';
 *    import '@khulnasoft.com/react/dist/lib/src/blocks/Columns';
 *
 *
 * You should generally use this in conjunction with `customInsertMenu` moe, e.g.:
 *    Khulnasoft.register('editor.settings', { customInsertMenu: true })
 * to ensure that no components are displayed that aren't imported
 *
 *
 * E.g. github.com/khulnasoft-lab/recli/blob/master/examples/react-design-system/src/khulnasoft-settings.js#L9:L9
 *
 */
module.exports = require('./dist/khulnasoft-react-lite.cjs.js');
