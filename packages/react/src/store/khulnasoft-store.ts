import React from 'react'

export const KhulnasoftStoreContext = React.createContext({
  state: {},
  update: (mutator: (state: any) => void) => {}
})
