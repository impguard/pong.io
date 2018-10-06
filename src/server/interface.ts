import * as Game from '../shared/game'

export enum Status { READY, STARTING, PLAYING, FINISHED }

export interface App {
  status: Status
  emit: (event: string | symbol, ...args: any[]) => boolean
  server: SocketIO.Server
  game: Game.State
  inputs: {
    [id: number]: Game.Input,
  }
}
