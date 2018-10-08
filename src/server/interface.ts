import * as Game from '../shared/game'

export enum Status { READY, STARTING, PLAYING, STOPPING }

export interface IApp {
  status: Status,
  server: SocketIO.Server,
  game: Game.IState | null,
  inputs: {
    [id: number]: Game.IInput,
  },
}
