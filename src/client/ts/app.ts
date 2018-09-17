import * as Matter from 'matter-js'

interface State {
  engine: Matter.Engine,
  render: Matter.Render,
}

const element = document.getElementById('game')

export const setup = (): State => {
  const engine = Matter.Engine.create()
  const render = Matter.Render.create({element, engine})

  // Setup crap
  const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
  Matter.World.add(engine.world, boxA)

  return {engine, render}
}

export const destroy = (state: State) => {
  Matter.Render.stop(state.render)
  Matter.Engine.clear(state.engine)
}

export const run = (state: State): State =>  {
  Matter.Engine.run(state.engine)
  Matter.Render.run(state.render)
  return state
}
