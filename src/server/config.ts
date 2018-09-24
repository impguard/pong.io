
import * as Game from '../shared/game'


interface Config {
  app: {
    network: {
      delta: number,
    }
    match: {
      delay: number,
      timeout: number,
    },
  },  
  game: Game.Config,
}


const config: Config = {
  game: {
    arena: {
      radius: 300
    },
    ball: {
      speed: {
        min: 1,
        max: 2,
      },
      radius: 5,
    },
    numBalls: 10,
    numPlayers: 10,
    delta: 16,
  },
  app: {
    network: {
      delta: 100,
    },
    match: {
      delay: 5000,
      timeout: 300000,
    },
  },
}

export default config