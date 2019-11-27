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
}

export const Init: Message<InitData, state.Game> = {
  name: "init",
  marshal: data => {
    return data.gameState
  },
  unmarshal: gameState => {
    return { gameState }
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