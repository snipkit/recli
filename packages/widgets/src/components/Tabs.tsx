import React from 'react'
import { KhulnasoftBlocks, KhulnasoftBlock } from '@khulnasoft.com/react'

// TODO: manual typings and documentation for this with typedoc and in khulnasoft guides pages
type ElementType = any

export interface TabsProps {
  tabs: {
    label: ElementType[]
    content: ElementType[]
  }[]
  khulnasoftBlock: any
  defaultActiveTab?: number
  collapsible?: boolean
  activeTabStyle?: any
}

const defaultTab = {
  '@type': '@khulnasoft.com/sdk:Element',
  responsiveStyles: {
    large: {
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingTop: '10px',
      paddingBottom: '10px',
      minWidth: '100px',
      textAlign: 'center',
      // TODO: add to all
      display: 'flex',
      flexDirection: 'column'
    }
  },
  component: {
    // Khulnasoft:text
    name: 'Text',
    options: {
      text: 'New tab'
    }
  }
}

const defaultElement = {
  '@type': '@khulnasoft.com/sdk:Element',
  responsiveStyles: {
    large: {
      height: '200px',
      display: 'flex',
      marginTop: '20px',
      flexDirection: 'column'
    }
  },
  component: {
    name: 'Text',
    options: {
      text: 'New tab content '
    }
  }
}

@KhulnasoftBlock({
  name: 'Khulnasoft: Tabs',
  inputs: [
    {
      name: 'tabs',
      type: 'list',
      subFields: [
        {
          name: 'label',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultTab]
        },
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement]
        }
      ],
      defaultValue: [
        {
          label: [
            {
              ...defaultTab,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 1'
                }
              }
            }
          ],
          content: [
            {
              ...defaultElement,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 1 content'
                }
              }
            }
          ]
        },
        {
          label: [
            {
              ...defaultTab,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 2'
                }
              }
            }
          ],
          content: [
            {
              ...defaultElement,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 2 content'
                }
              }
            }
          ]
        }
      ]
    },
    {
      name: 'activeTabStyle',
      type: 'uiStyle',
      helperText: 'CSS styles for the active tab',
      defaultValue: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }
    },
    {
      name: 'defaultActiveTab',
      type: 'number',
      helperText:
        'Deafult tab to open to. Set to "1" for the first tab, "2" for the second, or choose "0" for none',
      defaultValue: 1,
      advanced: true
    },
    {
      name: 'collapsible',
      type: 'boolean',
      helperText: 'If on, clicking an open tab closes it so no tabs are active',
      defaultValue: false,
      advanced: true
    }
  ]
})
export class Tabs extends React.Component<TabsProps, { activeTab: number }> {
  state = {
    activeTab: 0
  }

  get activeTabSpec() {
    return this.props.tabs && this.props.tabs[this.state.activeTab]
  }

  componentWillMount() {
    if (this.props.defaultActiveTab) {
      this.activeTab = this.props.defaultActiveTab - 1
    }
  }

  get activeTab() {
    return this.state.activeTab
  }

  set activeTab(tab) {
    this.setState({
      ...this.state,
      activeTab: tab
    })
  }

  render() {
    return (
      <React.Fragment>
        {/* TODO: tab overflow wrap option */}
        <span style={{ display: 'flex', flexDirection: 'row', overflow: 'auto', WebkitOverflowScrolling: 'touch' }} className="khulnasoft-tabs-wrap">
          {this.props.tabs &&
            this.props.tabs.map((item, index) => (
              <span
                key={index}
                className={
                  'khulnasoft-tab-wrap ' + (this.activeTabSpec === item ? 'khulnasoft-tab-active' : '')
                }
                style={(this.activeTabSpec === item && this.props.activeTabStyle) || undefined}
                onClick={() => {
                  if (index === this.activeTab && this.props.collapsible) {
                    this.activeTab = -1
                  } else {
                    this.activeTab = index
                  }
                }}
              >
                <KhulnasoftBlocks
                  // TODO: parent={this.props.khulnasoftBlock}
                  parentElementId={this.props.khulnasoftBlock.id}
                  // TODO: start with just "tabs." when bump react version
                  dataPath={`component.options.tabs.${this.state.activeTab}.label`}
                  blocks={item.label}
                />
              </span>
            ))}
        </span>

        {/* TODO: way to do react node or elements can be here  */}
        {this.activeTabSpec && (
          <KhulnasoftBlocks
            parentElementId={this.props.khulnasoftBlock.id}
            dataPath={`component.options.tabs.${this.state.activeTab}.content`}
            blocks={this.activeTabSpec.content}
          />
        )}
      </React.Fragment>
    )
  }
}
