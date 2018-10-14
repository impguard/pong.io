import * as Game from '../shared/game'

export enum Status { READY, STARTING, PLAYING, STOPPING }

export interface IApp {
  status: Status,
  server: SocketIO.Server,
  config: IAppConfig,
  game: Game.IState,
  inputs: {
    [id: number]: Game.IInput,
  },
}

export interface IAppConfig {
  network: {
    delta: number,
  }
  match: {
    playersRequired: number
    startDelay: number,
    finishDelay: number,
  },
}
