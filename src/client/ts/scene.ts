export enum Name {
  Home = 'home',
  Game = 'game',
}

let scene = document.getElementById(Name.Home)

export const change = (nextScene: Name) => {
  scene.style.display = 'none'
  scene = document.getElementById(nextScene)
  scene.style.display = ''
}
