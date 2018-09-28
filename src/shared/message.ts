import * as Game from './game'

export interface Accept {
  id: number
  config: Game.Config
  sample: Game.InitialSample
}

export interface GameState {
  sample: Game.Sample
}

export interface Input {
  input: Game.Input
}