import './scripts/init-editing';

import { khulnasoft, Khulnasoft } from '@khulnasoft.com/sdk';
export { KhulnasoftElement } from '@khulnasoft.com/sdk';

Khulnasoft.isReact = true;

export { KhulnasoftBlocks } from './components/khulnasoft-blocks.component';
export { KhulnasoftBlock as KhulnasoftBlockComponent } from './components/khulnasoft-block.component';
export { KhulnasoftContent } from './components/khulnasoft-content.component';
import { KhulnasoftComponent } from './components/khulnasoft-component.component';
export { KhulnasoftStoreContext } from './store/khulnasoft-store';
export { KhulnasoftMetaContext } from './store/khulnasoft-meta';
export { KhulnasoftAsyncRequestsContext } from './store/khulnasoft-async-requests';
export { withChildren } from './functions/with-children';

export { KhulnasoftComponent as KhulnasoftPage };
export { KhulnasoftComponent };

export { stringToFunction } from './functions/string-to-function';
export { useIsPreviewing } from './hooks/useIsPreviewing';

export { khulnasoft, Khulnasoft };
export default khulnasoft;
