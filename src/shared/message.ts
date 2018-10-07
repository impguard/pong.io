import * as Game from './game'

export enum ErrorCode { MATCHFULL }

export interface IAccept {
  id: number
  config: Game.IConfig
  sample: Game.ISampleInitial
}

export interface IReject {
  code: ErrorCode
}

export interface IGoal {
  id: number
  health: number
}

export interface IGameState {
  sample: Game.ISample
}

export interface IStarting {
  delay: number
}

export interface IInput {
  input: Game.IInput
}
