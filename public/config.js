const FPS = 30
var config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  audio: {
    disableWebAudio: true
  },
  fps: {
    target: FPS
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0, x: 0 },
      debug: true
    }
  },
  parent: "tanks",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};