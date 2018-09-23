import * as Game from '../shared/game'
import * as State from './state'
import config from './config'


export const setup = (app: State.App) => {
  app.game =  Game.create(config.game)
}