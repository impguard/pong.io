import * as Game from '../../shared/game'
import CBuffer from './cbuffer'

export enum SceneName {
  Home = '#home',
  Game = '#game',
}

export interface IApp {
  socket: SocketIOClient.Socket,
  server: {
    host: string,
    port: string,
  },

  scene: JQuery<HTMLElement>,
  name: string,
  accepted: boolean,

  assignment: number,
  inputs: CBuffer<Game.IInput>,
  game: Game.IState,
  render: Matter.Render,
}
