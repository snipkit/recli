import React from 'react'
import { Khulnasoft, khulnasoft, GetContentOptions } from '@khulnasoft.com/sdk'

interface KhulnasoftSimpleComponentProps {
  options?: GetContentOptions
  name: string
  entry?: string
  apiKey?: string
  onLoad?: (data: any) => void
  onError?: (error: any) => void
  html?: string
}

// TODO: docs
export class KhulnasoftSimpleComponent extends React.Component<KhulnasoftSimpleComponentProps> {
  state = {
    data: null as any,
    classes: [] as string[],
    loading: false,
    error: false
  }

  ref: HTMLElement | null = null

  private previousName = ''
  private subscriptions: Function[] = []
  // TODO: do this in core SDK
  private trackedClick = false

  addClass(className: string) {
    if (this.state.classes.indexOf(className) === -1) {
      this.setState({
        ...this.state,
        classes: this.state.classes.concat([className])
      })
    }
  }

  removeClass(className: string) {
    const index = this.state.classes.indexOf(className)
    if (index !== -1) {
      const newClasses = this.state.classes.slice()
      newClasses.splice(index, 1)
      this.setState({
        ...this.state,
        classes: newClasses
      })
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  onClick = (event: React.MouseEvent) => {
    if (khulnasoft.canTrack) {
      const { data } = this.state
      if (data) {
        khulnasoft.trackInteraction(
          data.id,
          data.testVariationId || data.id,
          this.trackedClick,
          event.nativeEvent
        )
        if (!this.trackedClick) {
          this.trackedClick = true
        }
      }
    }
  }

  componentDidMount() {
    this.getContent()
  }

  disconnectedCallback() {
    this.unsubscribe()
  }

  componentWillUpdate(props: KhulnasoftSimpleComponentProps) {
    if (props.name !== this.props.name || props.entry !== this.props.entry) {
      // TODO: more options too
      this.getContent()
    }
  }

  loaded() {
    this.addClass('khulnasoft-loaded')
  }

  getContent() {
    const key = this.props.apiKey
    if (key && key !== khulnasoft.apiKey) {
      khulnasoft.apiKey = key
    }

    if (!khulnasoft.apiKey) {
      const subscription = khulnasoft['apiKey$'].subscribe((key?: string) => {
        if (key) {
          this.getContent()
        }
      })
      this.subscriptions.push(() => subscription.unsubscribe())
    }

    if (this.props.html) {
      return
    }

    const name = this.props.name
    if (name === this.previousName) {
      return false
    }

    const entry = this.props.entry

    this.unsubscribe()
    if (!name) {
      return false
    }

    this.previousName = name
    this.addClass('khulnasoft-loading')
    this.setState({
      ...this.state,
      loading: true
    })
    // TODO: allow options as property or json
    const subscription = khulnasoft
      .get(name, {
        prerender: true,
        ...(entry
          ? {
              query: {
                _id: entry
              }
            }
          : {})
      })
      .subscribe(
        (data: any) => {
          this.removeClass('khulnasoft-loading')
          this.loaded()
          this.addClass('khulnasoft-no-content-found')
          if (!data) {
            if (this.props.onLoad) {
              this.props.onLoad(data)
            }
            return
          }
          if (this.ref && this.ref.classList.contains('khulnasoft-editor-injected')) {
            this.unsubscribe()
          } else {
            this.setState({
              ...this.state,
              data: data,
              loading: false
            })
            if (khulnasoft.canTrack) {
              // TODO: track unique vs not as well
              khulnasoft.trackImpression(data.id, data.testVariationId || data.id)
            }
            if (data.data && data.data.html) {
              if (this.props.onLoad) {
                this.props.onLoad(data)
              }
              if (data.data.animations && data.data.animations.length) {
                Khulnasoft.nextTick(() => {
                  Khulnasoft.animator.bindAnimations(data.data.animations)
                })
              }
            }
          }
        },
        (error: any) => {
          this.addClass('khulnasoft-errored')
          this.addClass('khulnasoft-loaded')
          this.removeClass('khulnasoft-loading')
          if (this.props.onError) {
            this.props.onError(error)
          }
          this.setState({
            ...this.state,
            loading: false,
            error: true
          })
        }
      )
    this.subscriptions.push(() => subscription.unsubscribe())
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.forEach(fn => fn())
      this.subscriptions = []
    }
  }

  render() {
    const html =
      this.props.html ||
      (this.state && this.state.data && this.state.data.data && this.state.data.data.html)
    return (
      <div
        khulnasoft-model={this.props.name}
        ref={ref => (this.ref = ref)}
        className={this.state.classes.join(' ')}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      >
        {(!html && this.state.loading && this.props.children) || undefined}
      </div>
    )
  }
}
