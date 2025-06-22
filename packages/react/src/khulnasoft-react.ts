import './scripts/init-editing';

import { khulnasoft, Khulnasoft } from '@khulnasoft.com/sdk';
export { KhulnasoftElement } from '@khulnasoft.com/sdk';
import { SDK_VERSION } from './sdk-version';

Khulnasoft.isReact = true;
Khulnasoft.sdkInfo = {
  name: 'react',
  version: SDK_VERSION,
};

export { KhulnasoftBlocks } from './components/khulnasoft-blocks.component';
export { KhulnasoftBlock as KhulnasoftBlockComponent } from './components/khulnasoft-block.component';
export { KhulnasoftContent } from './components/khulnasoft-content.component';
import {
  KhulnasoftComponent,
  onChange,
  RegisteredComponent,
} from './components/khulnasoft-component.component';
export { KhulnasoftStoreContext, KhulnasoftStore } from './store/khulnasoft-store';
export { KhulnasoftMetaContext } from './store/khulnasoft-meta';
export { KhulnasoftAsyncRequestsContext } from './store/khulnasoft-async-requests';
export { KhulnasoftBlock } from './decorators/khulnasoft-block.decorator';

export * from './functions/update-metadata';

export { withKhulnasoft } from './functions/with-khulnasoft';
export { withChildren } from './functions/with-children';
export { noWrap } from './functions/no-wrap';

export { KhulnasoftComponent as KhulnasoftPage, onChange, RegisteredComponent };
export { KhulnasoftComponent };
export { KhulnasoftComponent as Content };

export { Text } from './blocks/Text';
export { Slot as Dropzone } from './blocks/Slot';
export { Fragment } from './blocks/Fragment';
export { Columns } from './blocks/Columns';
export { Embed } from './blocks/Embed';
export { CustomCode } from './blocks/CustomCode';
export { Image, getSrcSet } from './blocks/Image';
export { Video } from './blocks/Video';
export { Symbol } from './blocks/Symbol';
export { Button } from './blocks/Button';
export { Section } from './blocks/Section';
export { StateProvider } from './blocks/StateProvider';
export { Router } from './blocks/Router';
export { Mutation } from './blocks/Mutation';

export { Form } from './blocks/forms/Form';
export { FormInput } from './blocks/forms/Input';
export { FormSubmitButton } from './blocks/forms/Button';
export { Label } from './blocks/forms/Label'; // advanced?
export { FormSelect } from './blocks/forms/Select'; // advanced?
export { TextArea } from './blocks/forms/TextArea';
export { Img } from './blocks/raw/Img';
export { RawText } from './blocks/raw/RawText';
export { PersonalizationContainer } from './blocks/PersonalizationContainer';

export { stringToFunction } from './functions/string-to-function';
export { useIsPreviewing } from './hooks/useIsPreviewing';

export { khulnasoft, Khulnasoft };
export default khulnasoft;
