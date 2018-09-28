import * as Game from '../shared/game'


export interface App {
  server: SocketIO.Server
  game: Game.State,
  inputs: {
    [id: number]: Game.Input
  }
}