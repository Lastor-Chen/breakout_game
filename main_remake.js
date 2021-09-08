// @ts-check

class GameApp {
  /**
   * @typedef {object} IGameAppConfig
   * @property {HTMLCanvasElement} canvas
   * @property {number} speedX
   * @property {number} speedY
   */

  /** @param {IGameAppConfig} config */
  constructor(config) {
    this.canvas = config.canvas
    this.ctx = config.canvas.getContext('2d')
    this.dx = config.speedX
    this.dy = config.speedY
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
    this.paddleSpeed = 7
  }

  isRightPressed = false
  isLeftPressed = false
  requestFrameId = 0
  isGameOver = false

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

  /** AABB collision detection between ball's box with paddle */
  collideBallWithPaddle() {
    const { ball, paddle } = this
    const isXin = ball.right > paddle.left && paddle.right > ball.left
    const isYin = ball.bottom > paddle.top && paddle.bottom > ball.top
    if (isXin && isYin) {
      this.dy = -this.dy
    }
  }

  gameOver() {
    window.cancelAnimationFrame(this.requestFrameId)
    this.requestFrameId = null
    alert('Game Over')
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
   */

  /** @param {IRectangleConfig} config */
  constructor(config) {
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height
    this.color = config.color
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

const app = new GameApp({
  canvas: document.querySelector('#myCanvas'),
  speedX: 2,
  speedY: -2,
})
app.start()

console.log('main2 running')