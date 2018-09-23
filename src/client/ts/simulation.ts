import * as Matter from 'matter-js'
import * as State from './state'


export const setup = (app: State.App, element: HTMLElement, socket: SocketIOClient.Socket) => {
  // initial setup
  const box = Matter.Bodies.rectangle(400, 200, 80, 80);

  const world = Matter.World.create({
    gravity: {
      scale: 0,
      x: 0,
      y: 0,
    }
  })

  Matter.World.add(world, box)

  const engine = Matter.Engine.create({world})
  const render = Matter.Render.create({element, engine})

  // Socket Setup

  app.simulation = {engine, render}
}


export const destroy = (app: State.App) => {
  Matter.Render.stop(app.simulation.render)
  Matter.Engine.clear(app.simulation.engine)

  app.simulation = null
}


export const run = (app: State.App) =>  {
  Matter.Engine.run(app.simulation.engine)
  Matter.Render.run(app.simulation.render)
}