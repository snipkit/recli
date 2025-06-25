import { khulnasoft, Khulnasoft } from '@khulnasoft.com/sdk'

Khulnasoft.isReact = true

import './components/custom/Canvas'
import './components/custom/ContentColumns'
import './components/custom/Hero'
import './components/custom/Spacer'

export { KhulnasoftBlocks } from './components/khulnasoft-blocks.component'
export { KhulnasoftContent } from './components/khulnasoft-content.component'
import { KhulnasoftPage } from './components/khulnasoft-page.component'
export { KhulnasoftSimpleComponent } from './components/khulnasoft-simple.component'
export { KhulnasoftStoreContext } from './store/khulnasoft-store'
export { KhulnasoftAsyncRequestsContext } from './store/khulnasoft-async-requests'
export { KhulnasoftBlock } from './decorators/khulnasoft-block.decorator'

export { KhulnasoftPage }
export { KhulnasoftPage as KhulnasoftComponent }

// export { Button } from './blocks/Button'
export { Text } from './blocks/Text'
export { Columns } from './blocks/Columns'
export { Embed } from './blocks/Embed'
export { CustomCode } from './blocks/CustomCode'
export { Image } from './blocks/Image'
export { Video } from './blocks/Video'

export { khulnasoft, Khulnasoft }
export default khulnasoft

if (typeof window !== 'undefined') {
  window.parent.postMessage(
    {
      type: 'khulnasoft.isReactSdk',
      data: {
        value: true
      }
    },
    '*'
  )
}
