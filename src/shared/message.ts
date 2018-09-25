import * as Game from './game'

export interface Accept {
  config: Game.Config
  sample: Game.InitialSample
}

export interface GameState {
  sample: Game.Sample
}