import * as Game from './game'

export enum ErrorCode { MATCHFULL }

export interface Accept {
  id: number
  config: Game.Config
  sample: Game.InitialSample
}

export interface Reject {
  code: ErrorCode
}

export interface Goal {
  id: number
  health: number
}

export interface GameState {
  sample: Game.Sample
}

export interface Starting {
  delay: number
}

export interface Input {
  input: Game.Input
}