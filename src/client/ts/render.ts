import * as $ from 'jquery'
import * as State from './state'

export interface IRenderOptions {
  angle: number,
}

export const setup = (app: State.IApp, options: IRenderOptions) => {
  const { angle } = options

  $(app.render.canvas).css('transform', `scaleY(-1) rotate(-${angle}rad)`)

  createHud(app)
}

export const run = (app: State.IApp) => {
  setInterval(() => {
    tick(app)
    // TODO: Decide how to incorporate configs in the client
    // and get this value from the server
  }, 144)
}

const tick = (app: State.IApp) => {
  // TODO: Store this in the hud state?
  const health = document.getElementById('health')
  const value = app.game.players[app.assignment].health

  health.setAttribute('value', value.toString())
}

const createHud = (app: State.IApp) => {
  const hud = document.getElementById('hud')
  hud.style.display = 'initial'

  const health = document.getElementById('health')
  const value = app.game.players[app.assignment].health

  health.setAttribute('max', value.toString())
  health.setAttribute('value', value.toString())
}

export const destroy = (app: State.IApp) => {
  $(app.render.canvas).remove()
  app.render = null

  const health = document.getElementById('health')
  health.setAttribute('value', '1')

  const hud = document.getElementById('hud')
  hud.style.display = 'none'
}
