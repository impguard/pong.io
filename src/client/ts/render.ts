import * as $ from 'jquery'
import { IApp } from './interface'

export const setup = (app: IApp) => {
  const player = app.game.players[app.assignment]
  const angle = player.baseAngle

  $(app.render.canvas).css('transform', `scaleY(-1) rotate(-${angle}rad)`)

  createHud(app)
}

export const run = (app: IApp) => {
  setInterval(() => {
    tick(app)
    // TODO: Decide how to incorporate configs in the client
    // and get this value from the server
  }, 144)
}

const tick = (app: IApp) => {
  // TODO: Store this in the hud state?
  const health = document.getElementById('health')
  const value = app.game.players[app.assignment].health

  health.setAttribute('value', value.toString())
}

const createHud = (app: IApp) => {
  const hud = document.getElementById('hud')
  hud.style.display = 'initial'

  const health = document.getElementById('health')
  const value = app.game.players[app.assignment].health

  health.setAttribute('max', value.toString())
  health.setAttribute('value', value.toString())
}

export const destroy = (app: IApp) => {
  $(app.render.canvas).remove()
  app.render = null

  const health = document.getElementById('health')
  health.setAttribute('value', '1')

  const hud = document.getElementById('hud')
  hud.style.display = 'none'
}
