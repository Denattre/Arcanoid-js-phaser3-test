import Phaser from "phaser";

let paddle;
let ball;
let blocks;
let blocksArray = [
  '0110',
  '1111',
  '0110'
];
const gameWidth = 800;
const gameHeight = 600;

let score = 0;
let scoreText;
let lives;
let livesText;
let mainText;

let cursors;
let enterKey;

let gameState;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image('background', 'src/assets/background.png')
    this.load.image('paddle', 'src/assets/paddle.png')
    this.load.image('ball', 'src/assets/ball.png')
    this.load.image('block', 'src/assets/block.png')
  }

  create() {
    this.add.image(400, 300, 'background')

    paddle = this.physics.add.image(400, 500, 'paddle')
    paddle.setCollideWorldBounds(true)
    paddle.body.immovable = true

    ball = this.physics.add.image(400, 478, 'ball')
    ball.setVelocity(20, -200)
    ball.setCollideWorldBounds(true)
    ball.setBounce(1,1)
    this.physics.world.checkCollision.down = false

    blocks = this.physics.add.group()
    generateBlocks()

    blocks.children.iterate(function(child) {
      child.body.immovable = true
    })

    scoreText = this.add.text(15, 15, `score: 0`, {fontSize: '32px', fill:'#fff'})
    livesText = this.add.text(15, 550, `lives: 3`, {fontSize: '32px', fill:'#fff'})
    mainText = this.add.text(gameWidth / 2, gameHeight / 2, `Press SPACE`, {fontSize: '50px', fill: '#fff'})
    mainText.setOrigin(0.5)

    cursors = this.input.keyboard.createCursorKeys()
    enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

    this.physics.add.collider(ball, paddle, collideBallPaddle)
    this.physics.add.collider(ball, blocks, collideBallBlock)

    gameInit()
    gameReady()
  }

  update() {
    paddle.setVelocityX(0)
    if (cursors.left.isDown) {
      paddle.setVelocityX(-200)
    } else if (cursors.right.isDown) {
      paddle.setVelocityX(200)
    }

    if (gameState == 1) {
      ball.setX(paddle.x)
    }
    
    if (gameState == 1) {
      if (cursors.space.isDown) {
        gameProcess()
      }
    } else if (gameState == 2) {
      if (ball.body.y > gameHeight) {
        lives--
        livesText.setText(`Lives: ${lives}`)
        if (lives > 0) {
          gameReady ()
        } else {
          gameFinish('Game over')
        }
      } else if (blocks.countActive() == 0) {
        gameFinish("You won!")
      }
    } else if (gameState == 3) {
      if (enterKey.isDown) {
        gameInit()
        gameReady()
      }
    }
  }
  
}

function generateBlocks () {
  const rows = blocksArray.length
  const cols = blocksArray[0].length
  const blockSize = 32
  //Считаем смещение по оси X
  const offsetX = (gameWidth - cols * blockSize) / 2 + blockSize / 2
  //Считаем смещение по оси Y
  const offsetY = gameHeight * 0.1
  for (let i = 0; i < rows; i++){
    for (let j = 0; j < cols; j++) {
      if (blocksArray[i][j] == '1') {
        blocks.create(j * blockSize + offsetX, i * blockSize + offsetY, 'block')
      }
    }
  }
}

function collideBallPaddle(ball, paddle) {
  var newVelocity = ball.body.velocity.x + paddle.body.velocity.x
  if (Math.abs(newVelocity) > 200) {
    newVelocity = paddle.body.velocity.x
  }
  let loss = paddle.body.velocity.x * Math.random() * 0.2
  newVelocity -= loss
  ball.setVelocityX(newVelocity)
}

function collideBallBlock (ball, block) {
  block.disableBody(true, true)
  score+=100;
  scoreText.setText(`Score: ${score}`)
}

function gameInit () {
  score = 0
  scoreText.setText(`Score: ${score}`)
  lives = 3
  livesText.setText(`Lives: ${lives}`)
  blocks.children.iterate(function(child) {
    child.enableBody(true, child.x, child.y, true, true)
  })
  ball.enableBody(true, 0, 0, true, true)
}

function gameReady() {
  gameState = 1
  ball.setVelocity(0, 0)
  ball.setX(paddle.x)
  ball.setY(paddle.y - paddle.body.height / 2 - ball.height / 2)
  mainText.setText('Press SPACE')
  mainText.setVisible(true)
}

function gameProcess () {
  gameState = 2
  ball.setVelocity(10, -200)
  mainText.setVisible(false)
}

function gameFinish(text) {
  gameState = 3
  mainText.setText(text)
  mainText.setVisible(true)
  ball.disableBody(true)
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: false,
    },
  },
  scene: MyGame,
};

const game = new Phaser.Game(config);

