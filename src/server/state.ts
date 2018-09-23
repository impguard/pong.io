import * as Game from '../shared/ts/game'


export interface App {
  server: SocketIO.Server
  game: Game.State
}