import * as Game from './game'

export enum Code { MATCHFULL }

export interface Accept {
  id: number
  config: Game.Config
  sample: Game.InitialSample
}

export interface Reject {
  code: Code
  reason: String
}

export interface GameState {
  sample: Game.Sample
}

export interface Input {
  input: Game.Input
}