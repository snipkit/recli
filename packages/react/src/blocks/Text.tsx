import React from 'react'
import { KhulnasoftBlock } from '../decorators/khulnasoft-block.decorator'
const iconUrl =
  'https://firebasestorage.googleapis.com/v0/b/khulnasoft-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929'

@KhulnasoftBlock({
  name: 'Text',
  image: iconUrl,
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      defaultValue: 'Enter some text...'
    }
  ],
  // Maybe optionally a function that takes in some params like block vs absolute, etc
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center'
  }
})
export class Text extends React.Component<{ text: string }> {
  render() {
    return (
      <React.Fragment>
        <style
        >{`.khulnasoft-text p:first-child, .khulnasoft-paragraph:first-child { margin: 0 } .khulnasoft-text > p, .khulnasoft-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }`}</style>
        <div
          khulnasoft-text="true"
          className="khulnasoft-text"
          dangerouslySetInnerHTML={{ __html: this.props.text || (this.props as any).content || '' }}
        />
      </React.Fragment>
    )
  }
}
