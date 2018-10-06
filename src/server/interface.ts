import * as Game from '../shared/game'

export enum Status { READY, STARTING, PLAYING, FINISHED }

export interface IApp {
  status: Status
  emit: (event: string | symbol, ...args: any[]) => boolean
  server: SocketIO.Server
  game: Game.IState
  inputs: {
    [id: number]: Game.IInput,
  }
}
