// @ts-check

class GameApp {
  /** @type {Circle} */
  ball = null
  /** @type {Rectangle} */
  paddle = null
  /** @type {Rectangle[][]} */
  brickGroup = []
  isRightPressed = false
  isLeftPressed = false
  requestFrameId = 0
  isGameOver = false
  isWin = false
  score = 0

  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dx = 2
    this.dy = -2
    this.paddleSpeed = 7
    this.brickConfig = {
      width: 75,
      height: 20,
      row: 3,
      column: 5,
      padding: 10,
      offsetTop: 30,
      offsetLeft: 30,
    }
    this.createGameItems()
  }

  start() {
    // listen keyboard controller
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.isRightPressed = true
      }
      if (e.key === 'ArrowLeft') {
        this.isLeftPressed = true
      }
    })
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowRight') {
        this.isRightPressed = false
      }
      if (e.key === 'ArrowLeft') {
        this.isLeftPressed = false
      }
    })

    // listen buttons
    const restartBtn = document.querySelector('#restart')
    restartBtn.addEventListener('click', () => {
      document.location.reload()
    })

    this.runAnimationLoop()
  }

  runAnimationLoop() {
    this.requestFrameId = window.requestAnimationFrame(() => this.drawFrame())
  }

  drawFrame() {
    if (this.isGameOver) return this.gameOver()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.paddle.updateBound().draw(this.ctx)
    this.ball.updateBound().draw(this.ctx)

    this.collideBallWithWall()
    this.collideBallWithPaddle()
    this.collideBallWithBricks()

    this.drawBricks()
    this.drawScore()

    if (this.isLeftPressed) {
      const limitLeft = 0
      this.paddle.x = Math.max(limitLeft, this.paddle.x - this.paddleSpeed)
    } else if (this.isRightPressed) {
      const limitRight = this.canvas.width - this.paddle.width
      this.paddle.x = Math.min(limitRight, this.paddle.x + this.paddleSpeed)
    }

    this.ball.x += this.dx
    this.ball.y += this.dy

    this.runAnimationLoop()
  }

  collideBallWithWall() {
    const isHitWallLeft = this.ball.left < 0
    const isHitWallRight = this.ball.right > this.canvas.width
    const isHitWallTop = this.ball.top < 0
    const isHitWallBottom = this.ball.bottom > this.canvas.height

    if (isHitWallLeft || isHitWallRight) {
      this.dx = -this.dx
    } else if (isHitWallTop) {
      this.dy = -this.dy
    } else if (isHitWallBottom) {
      this.isGameOver = true
    }
  }

  /** AABB collision detection */
  collideBallWithPaddle() {
    const { ball, paddle } = this
    const isXin = ball.right > paddle.left && paddle.right > ball.left
    const isYin = ball.bottom > paddle.top && paddle.bottom > ball.top
    if (isXin && isYin) {
      this.dy = -this.dy
    }
  }

  /** AABB collision detection */
  collideBallWithBricks() {
    const ball = this.ball
    const {
      row: totalRow,
      column: totalCol,
    } = this.brickConfig

    this.brickGroup.forEach((rowBricks, row) => {
      rowBricks.forEach((brick, col) => {
        if (brick.hidden) return void 0

        const isBallInX = ball.x > brick.x && ball.x < brick.x + brick.width
        const isBallInY = ball.y > brick.y && ball.y < brick.y + brick.height
        if (isBallInX && isBallInY) {
          this.dy = -this.dy
          brick.hidden = true
          this.score += 1

          if (this.score === totalRow * totalCol) {
            this.isWin = true
            this.isGameOver = true
          }
        }
      })
    })
  }

  gameOver() {
    window.cancelAnimationFrame(this.requestFrameId)
    this.requestFrameId = null
    if (this.isWin) {
      alert('You Win. Congratulations!')
    } else {
      alert('Game Over')
    }
  }

  createGameItems() {
    this.ball = new Circle({
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      radius: 8,
      color: '#0095DD',
    })

    this.paddle = new Rectangle({
      x: (this.canvas.width - 75) / 2,
      y: this.canvas.height - 10 - 10,
      width: 75,
      height: 10,
      color: '#0095DD',
    })

    const {
      row: brickRow,
      column: brickColumn,
      width: brickWidth,
      height: brickHeight,
      padding: brickPadding,
      offsetTop: brickOffsetTop,
      offsetLeft: brickOffsetLeft,
    } = this.brickConfig

    for (let row = 0; row < brickRow; row++) {
      this.brickGroup[row] = []
      for (let col = 0; col < brickColumn; col++) {
        const brick = new Rectangle({
          x: row * (brickHeight + brickPadding) + brickOffsetTop,
          y: col * (brickWidth + brickPadding) + brickOffsetLeft,
          width: 75,
          height: 20,
          color: '#0095DD',
          hidden: false,
        })
        this.brickGroup[row].push(brick)
      }
    }
  }

  drawBricks() {
    const { padding, offsetTop, offsetLeft } = this.brickConfig

    this.brickGroup.forEach((rowBricks, row) => {
      rowBricks.forEach((brick, col) => {
        if (brick.hidden) return void 0
        brick.x = col * (brick.width + padding) + offsetLeft
        brick.y = row * (brick.height + padding) + offsetTop
        brick.updateBound().draw(this.ctx)
      })
    })
  }

  drawScore() {
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = '#0095DD'
    this.ctx.fillText(`Score: ${this.score}`, 8, 20)
  }
}

class Circle {
  /**
   * @typedef {object} ICircleConfig
   * @property {number} x
   * @property {number} y
   * @property {number} radius
   * @property {string} color
   */

  /** @param {ICircleConfig} config */
  constructor(config) {
    this.x = config.x
    this.y = config.y
    this.radius = config.radius
    this.color = config.color
    this.updateBound()
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
    return this
  }

  updateBound() {
    this.left = this.x - this.radius
    this.top = this.y - this.radius
    this.right = this.x + this.radius
    this.bottom = this.y + this.radius
    return this
  }
}

class Rectangle {
  /**
   * @typedef {object} IRectangleConfig
   * @property {number} x
   * @property {number} y
   * @property {number} width
   * @property {number} height
   * @property {string} color
   * @property {boolean=} hidden
   */

  /** @param {IRectangleConfig} config */
  constructor(config) {
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height
    this.color = config.color
    this.hidden = config.hidden || false
    this.updateBound()
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    ctx.beginPath()
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
    return this
  }

  updateBound() {
    this.left = this.x
    this.top = this.y
    this.right = this.x + this.width
    this.bottom = this.y + this.height
    return this
  }
}

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector('#myCanvas')
const app = new GameApp(canvas)
app.start()

console.log('main2 running')