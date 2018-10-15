import * as Game from '../../shared/game'

export interface IApp {
  socket: SocketIOClient.Socket
  server: {
    host: string
    port: string,
  }
  name: string
  started: boolean
  accepted: boolean

  assignment: number
  game: Game.IState
  render: Matter.Render
}
