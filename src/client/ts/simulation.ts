import * as Matter from 'matter-js'
import * as State from './state'


export const setup = (app: State.App, element: HTMLElement, socket: SocketIOClient.Socket) => {
  const engine = Matter.Engine.create()
  const render = Matter.Render.create({element, engine})

  // Initial Setup
  const box = Matter.Bodies.rectangle(400, 200, 80, 80);

  Matter.World.add(engine.world, box)

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