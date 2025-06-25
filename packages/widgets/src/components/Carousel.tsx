import { KhulnasoftBlock, KhulnasoftBlocks } from '@khulnasoft.com/react'
import React from 'react'
import Carousel from 'nuka-carousel'

const defaultElement = {
  '@type': '@khulnasoft.com/sdk:Element',
  responsiveStyles: {
    large: {
      height: '400px',
      display: 'flex',
      flexDirection: 'column'
    }
  },
  children: [
    {
      '@type': '@khulnasoft.com/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '50px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am a slide'
        }
      }
    }
  ]
}
const defaultButton = {
  '@type': '@khulnasoft.com/sdk:Element',
  responsiveStyles: {
    large: {
      display: 'flex',
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '10px',
      paddingBottom: '10px',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flexDirection: 'column'
    }
  }
}

type KhulnasoftBlockType = any

interface CarouselProps {
  slides: Array<
    React.ReactNode | { content: KhulnasoftBlockType[] } /* KhulnasoftBlock <- export this type */
  >
  khulnasoftBlock: KhulnasoftBlockType
  nextButton?: KhulnasoftBlockType[]
  prevButton?: KhulnasoftBlockType[]
  autoplay?: boolean
  autoplaySpeed?: number
  hideDots?: boolean
  initialHeight?: number;
}

@KhulnasoftBlock({
  name: 'Khulnasoft:Carousel',
  inputs: [
    {
      name: 'slides',
      type: 'list',
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement]
        }
      ],
      defaultValue: [
        {
          content: [defaultElement]
        },
        {
          content: [defaultElement]
        }
      ]
    },
    {
      name: 'hideDots',
      helperText: 'Show pagination dots',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplay',
      helperText: 'Automatically rotate to the next slide every few seconds',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 5,
      helperText:
        'If auto play is on, how many seconds to wait before automatically changing each slide'
      // TODO: showIf option
      // showIf: (options) => options.get('autoPlay')
    },
    // TODO: on add new duplicate the prior or expect use templates
    // onChange:
    {
      name: 'prevButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Text',
            options: {
              text: '〈'
            }
          }
        }
      ]
    },
    {
      name: 'nextButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Text',
            options: {
              text: '〉'
            }
          }
        }
      ]
    },
    {
      name: 'initialHeight',
      type: 'number',
      helperText: 'The initial height to give the carousel before the content loads',
      advanced: true,
      defaultValue: 400
    }
  ]
})
export class KhulnasoftCarousel extends React.Component<CarouselProps> {
  render() {
    return (
      <Carousel
        wrapAround
        heightMode="max"
        // Allow user to edit
        initialSlideHeight={this.props.initialHeight || 400}
        pauseOnHover
        autoplay={this.props.autoplay}
        autoplayInterval={this.props.autoplaySpeed ? this.props.autoplaySpeed * 1000 : undefined}
        renderBottomCenterControls={this.props.hideDots ? () => null : undefined}
        renderCenterLeftControls={({ previousSlide }) => (
          <span style={{ cursor: 'pointer' }} onClick={previousSlide}>
            <KhulnasoftBlocks
              parentElementId={this.props.khulnasoftBlock}
              dataPath="component.options.prevButton"
              blocks={this.props.prevButton}
            />
          </span>
        )}
        renderCenterRightControls={({ nextSlide }) => (
          <span style={{ cursor: 'pointer' }} onClick={nextSlide}>
            <KhulnasoftBlocks
              parentElementId={this.props.khulnasoftBlock}
              dataPath="component.options.nextButton"
              blocks={this.props.nextButton}
            />
          </span>
        )}
      >
        {this.props.slides.map((slide, index) => (
          // TODO: how make react compatible with plain react components
          // slides: <Foo><Bar> <- khulnasoft blocks if passed react nodes as blocks just forward them
          <KhulnasoftBlocks
            key={index}
            parentElementId={this.props.khulnasoftBlock && this.props.khulnasoftBlock.id}
            dataPath={`component.options.slides.${index}.content`}
            child
            blocks={(slide as any).content || slide}
          />
        ))}
      </Carousel>
    )
  }
}
