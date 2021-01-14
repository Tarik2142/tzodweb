// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser')

const config = {
  type: Phaser.HEADLESS,//Phaser.AUTO,
  width: 1024,
  height: 640,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 0, x: 0 },
      debug: true
    }
  },
  // disable audio
  audio: {
    noAudio: true
  },
  scene: {
    preload: () => {
      console.log('server preload')
    },
    create: () => {
      console.log('server create')
    },
    update: () => {
      // console.log('server update')
    }
  },
  title: 'Phaser server app',
  backgroundColor: '#06C6F8',
  transparent: true,
  disableContextMenu: true
}
function log(text){
  console.log(text);
}
class gun extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
}
class tank extends Phaser.Physics.Matter.Sprite {
  gun;
  speed;
  armor;
  constructor(scene, x, y, texture, frame, walls) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }
  update() {}
}
var id = Math.round($.now()*Math.random());



class Game {
  static initialize() {
    console.log('initializing server game')
    ;(() => new Phaser.Game(config))()
  }
}

Game.initialize()

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
