import React from 'react'
import { Khulnasoft } from '@khulnasoft.com/sdk'
import { KhulnasoftBlock } from './khulnasoft-block.component'
// TODO: fetch these for user and send them with same response like graphql
import { sizes, Size } from '../constants/device-sizes.constant'

export interface KhulnasoftBlocksProps {
  fieldName?: string
  // TODO: block type (ElementType[])
  blocks?: any[] | React.ReactNode
  child?: boolean
  // TODO: use new react context for this to pass window size all the way down
  size?: Size
  style?: React.CSSProperties
  parentElementId?: string
  parent?: any
  dataPath?: string
  className?: string
}

interface KhulnasoftBlocksState {
  // width: number
}

// TODO: options to set direciotn
export class KhulnasoftBlocks extends React.Component<KhulnasoftBlocksProps, KhulnasoftBlocksState> {
  get isRoot() {
    return !this.props.child
  }

  get noBlocks() {
    const { blocks } = this.props
    return !(blocks && (blocks as any).length) // TODO: allow react nodes
  }
  get path() {
    const pathPrefix = 'component.options'
    let path = this.props.dataPath || ''
    if (!path.startsWith(pathPrefix)) {
      path = pathPrefix + path
    }
    return path
  }

  get parentId() {
    if (this.props.parentElementId) {
      return this.props.parentElementId
    }
    return this.props.parent && this.props.parent.id
  }

  onClickEmptyBlocks = () => {
    if (Khulnasoft.isIframe && this.noBlocks) {
      window.parent.postMessage(
        {
          type: 'khulnasoft.clickEmptyBlocks',
          data: {
            parentElementId: this.parentId,
            dataPath: this.path
          }
        },
        '*'
      )
    }
  }

  // <!-- Khulnasoft Blocks --> in comments hmm
  render() {
    const { blocks } = this.props

    // TODO: how deep check this automatically for mobx... hmmm optional / peer dependency?
    return (
      // TODO: component <Stack direction="vertical">
      // TODO: react.fragment instead?
      <div
        className={
          'khulnasoft-blocks' +
          (this.noBlocks ? ' no-blocks' : '') +
          (this.props.child ? ' khulnasoft-blocks-child' : '') +
          (this.props.className ? ' ' + this.props.className : '')
        }
        khulnasoft-type="blocks"
        // TODO: only fi in iframe?
        khulnasoft-path={Khulnasoft.isIframe ? this.path : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          ...this.props.style
        }}
        onClick={() => {
          if (this.noBlocks) {
            this.onClickEmptyBlocks()
          }
        }}
      >
        {/* TODO: if is react node (for react compatibility) render it */}
        {/* TODO: maybe don't do this to preserve blocks always editable */}
        {(blocks &&
          Array.isArray(blocks) &&
          (blocks as any[]).map(
            (block, index) =>
              block && block['@type'] === '@khulnasoft.com/sdk:Element' ? (
                <KhulnasoftBlock
                  key={block.id + index}
                  block={block}
                  index={index}
                  fieldName={this.props.fieldName}
                  child={this.props.child}
                />
              ) : (
                block
              )
          )) ||
          blocks}
      </div>
    )
  }
}
