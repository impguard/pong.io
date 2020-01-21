import * as state from "./state"

interface Message<Data, Buffer> {
  name: string,
  marshal: (data: Data) => Buffer,
  unmarshal: (buf: Buffer) => Data,
}

//
// Init
//

export interface InitData {
  gameState: state.Game
  config: state.Config
}

export const Init: Message<InitData, InitData> = {
  name: "init",
  marshal: data => {
    return data
  },
  unmarshal: data => {
    return data
  }
}

//
// Ready
//

export const Ready: Message<void, void> = {
  name: "ready",
  marshal: () => {},
  unmarshal: () => {}
}

//
// Ready
//

export interface StateData {
  partialGameState: state.PartialGame
}

export const State: Message<StateData, state.PartialGame> = {
  name: "state",
  marshal: data => {
    return data.partialGameState
  },
  unmarshal: partialGameState => {
    return  { partialGameState }
  }
}