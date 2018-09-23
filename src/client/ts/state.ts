import * as Game from '../../shared/ts/game'


export interface App {
  socket: SocketIOClient.Socket,
  server: {
    host: string,
    port: string,
  }
  name: string,
  started: boolean,
  accepted: boolean,

  game: Game.State
}