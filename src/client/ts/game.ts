import * as PIXI from 'pixi.js'

const game = document.getElementById('game')

export const setup = (socket: SocketIOClient.Socket) => {
    const app = new PIXI.Application(800, 800)
    game.appendChild(app.view)
}
