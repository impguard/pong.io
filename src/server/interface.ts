import * as Game from '../shared/game'
import * as Message from '../shared/message'

export enum Status { READY, STARTING, PLAYING, STOPPING }

export interface IApp {
  status: Status,
  server: SocketIO.Server,
  config: IAppConfig,
  game: Game.IState,
  players: {
    [id: number]: {
      socket: SocketIO.Socket,
      message: Message.IInput,
      latestFrame: number,
    },
  }
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
