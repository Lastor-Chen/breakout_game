// @ts-check

class GameApp {
  /** @type {Circle} */
  ball = null
  /** @type {Rectangle} */
  paddle = null
  /** @type {Rectangle[][]} */
  brickGroup = []
  requestFrameId = 0
  score = 0
  isRightPressed = false
  isLeftPressed = false
  isGameOver = false
  isWin = false
  isPaddleHitting = false // 球是否正與 paddle 碰撞中, 防抖用
  isWallHitting = false // 球是否正與 wall 碰撞中, 防抖用
  isEmitBall = false
  /** @type {'ready' | 'playing' | 'ending'} */
  state = 'ready'

  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.paddleSpeed = 8
    this.paddleConfig = {
      width: 75,
      height: 10,
      x: (this.canvas.width - 75) / 2,
      y: this.canvas.height - 10 - 10,
      color: '#0095DD',
    }
    this.paddle = new Rectangle(this.paddleConfig)
    this.ballConfig = {
      x: this.canvas.width / 2 + 10,
      y: this.paddle.top - 8,
      radius: 8,
      dx: 1,
      dy: -4,
      color: '#0095DD',
    }
    this.ball = new Circle(this.ballConfig)
    this.dx = this.ballConfig.dx
    this.dy = this.ballConfig.dy
    this.brickConfig = {
      width: 75,
      height: 20,
      row: 3,
      column: 5,
      padding: 10,
      offsetTop: 30,
      offsetLeft: 30,
      color: '#0095DD',
    }
    this.brickGroup = this.createBricks()
  }

  start() {
    const self = this
    document.addEventListener('keyup', function enterHandler(e) {
      if (e.key === 'Enter') {
        document.removeEventListener('keyup', enterHandler)
        self.state === 'playing'
        self.startPlayPage()
      }
    })

    this.renderReadyPage()
  }

  renderReadyPage() {
    if (this.state !== 'ready') return void 0

    this.requestFrameId = window.requestAnimationFrame((ms) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // font style
      const titleSize = 32
      const fontSize = 16
      const marginTop = fontSize * 1.5
      this.ctx.textAlign = 'center'

      // title text
      this.ctx.font = `${titleSize}px Arial`
      this.ctx.fillStyle = '#0095DD'
      this.ctx.fillText(
        'BREAKOUT GAME', //
        this.canvas.width / 2,
        (this.canvas.height - titleSize / 2) / 2
      )

      // blink effect info text
      const duration = 800
      if (ms % (duration * 2) > duration) {
        this.ctx.font = `${fontSize}px Arial`
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(
          'Press Enter to start', //
          this.canvas.width / 2,
          (this.canvas.height - fontSize / 2) / 2 + marginTop * 2
        )
      }

      this.renderReadyPage()
    })
  }

  startPlayPage() {
    this.state = 'playing'
    window.cancelAnimationFrame(this.requestFrameId)

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

    // listen ball emitter "once"
    const self = this
    document.addEventListener('keyup', function emitBall(e) {
      if (e.key === 'Enter') {
        self.isEmitBall = true
        document.removeEventListener('keyup', emitBall)
      }
    })

    this.renderPlayPage()
  }

  renderPlayPage() {
    if (this.state !== 'playing') return void 0
    if (this.isGameOver) return this.startEndingPage()

    this.requestFrameId = window.requestAnimationFrame(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.paddle.updateBound().draw(this.ctx)
      this.ball.updateBound().draw(this.ctx)

      this.collideBallWithWall()
      this.collideBallWithPaddle()
      this.collideBallWithBricks()

      this.drawBricks()
      this.drawScore()

      // handle paddle movement
      const limitLeft = 0
      const limitRight = this.canvas.width - this.paddle.width
      if (this.isLeftPressed && this.paddle.x > limitLeft) {
        this.paddle.x += -this.paddleSpeed
        if (!this.isEmitBall) {
          this.ball.x += -this.paddleSpeed
        }
      } else if (this.isRightPressed && this.paddle.x < limitRight) {
        this.paddle.x += this.paddleSpeed
        if (!this.isEmitBall) {
          this.ball.x += this.paddleSpeed
        }
      }

      // handle ball movement
      if (this.isEmitBall) {
        this.ball.x += this.ball.dx
        this.ball.y += this.ball.dy
      } else {
        this.drawPlayInfo()
      }

      this.renderPlayPage()
    })
  }

  startEndingPage() {
    this.state = 'ending'
    window.cancelAnimationFrame(this.requestFrameId)

    const self = this
    document.addEventListener('keyup', function enterHandler(e) {
      if (e.key === 'Enter') {
        document.removeEventListener('keyup', enterHandler)
        self.restart()
        self.startPlayPage()
      }
    })

    this.renderEndingPage()
  }

  renderEndingPage() {
    if (this.state !== 'ending') return void 0

    this.requestFrameId = window.requestAnimationFrame((ms) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // font style
      const title = this.isWin ? 'YOU WIN' : 'GAME OVER'
      const titleColor = this.isWin ? 'yellow' : '#0095DD'
      const titleSize = 32
      const fontSize = 16
      const marginTop = fontSize * 1.5
      this.ctx.textAlign = 'center'

      // title text
      this.ctx.font = `${titleSize}px Arial`
      this.ctx.fillStyle = titleColor
      this.ctx.fillText(
        title, //
        this.canvas.width / 2,
        (this.canvas.height - titleSize / 2) / 2
      )

      // subtitle text
      this.ctx.font = `${fontSize}px Arial`
      this.fillStyle = titleColor
      this.ctx.fillText(
        `score: ${this.score}`, //
        this.canvas.width / 2,
        (this.canvas.height - titleSize / 2) / 2 + marginTop
      )

      // blink effect info text
      const duration = 800
      if (ms % (duration * 2) > duration) {
        this.ctx.font = `${fontSize}px Arial`
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(
          'Press Enter to restart', //
          this.canvas.width / 2,
          (this.canvas.height - titleSize / 2) / 2 + marginTop * 2
        )
      }

      this.renderEndingPage()
    })
  }

  collideBallWithWall() {
    const isHitWallLeft = this.ball.left < 0
    const isHitWallRight = this.ball.right > this.canvas.width
    const isHitWallTop = this.ball.top < 0
    const isHitWallBottom = this.ball.bottom > this.canvas.height

    if (isHitWallLeft || isHitWallRight) {
      if (this.isWallHitting) return void 0
      this.isWallHitting = true

      this.ball.dx = -this.ball.dx
    } else if (isHitWallTop) {
      if (this.isWallHitting) return void 0
      this.isWallHitting = true

      this.ball.dy = -this.ball.dy
    } else if (isHitWallBottom) {
      this.isGameOver = true
    } else {
      if (!this.isWallHitting) return void 0
      this.isWallHitting = false
    }
  }

  /** AABB collision detection */
  collideBallWithPaddle() {
    const { ball, paddle } = this
    const isXin = ball.right > paddle.left && paddle.right > ball.left
    const isYin = ball.bottom > paddle.top && paddle.bottom > ball.top
    if (isXin && isYin) {
      if (this.isPaddleHitting) return void 0
      this.isPaddleHitting = true

      this.ball.dy = -this.ball.dy

      // 根據撞擊位置改變 dx, 藉此改變 ball 運動直線斜率
      // 撞擊位置分3段, 近(x方向減速), 中(不變), 遠(x加速)
      const near = 0.35
      const middle = 0.3
      const far = 0.35

      // 左到右為 1, 右到左為 -1
      const direction = Math.sign(this.ball.dx)
      // 撞擊位置的 x 純量值, 會依從左到右 or 從右到左, 算法不同
      const occurringX = direction >= 0 ? ball.x - paddle.x : paddle.right - ball.x
      // 算出撞擊位置的純量值, 佔 paddle 的百比率
      const ratioOfPaddle = occurringX / paddle.width
      // 加減速量值
      const coefficient = 2
      if (ratioOfPaddle < near) {
        this.ball.dx -= direction * coefficient || coefficient
      } else if (ratioOfPaddle > 1 - far) {
        this.ball.dx += direction * coefficient || coefficient
      }
    } else {
      if (!this.isPaddleHitting) return void 0
      this.isPaddleHitting = false
    }
  }

  /** AABB collision detection */
  collideBallWithBricks() {
    const ball = this.ball
    const { row: totalRow, column: totalCol } = this.brickConfig

    this.brickGroup.forEach((rowBricks) => {
      rowBricks.forEach((brick) => {
        if (brick.hidden) return void 0

        const isBallInX = ball.x > brick.x && ball.x < brick.x + brick.width
        const isBallInY = ball.y > brick.y && ball.y < brick.y + brick.height
        if (isBallInX && isBallInY) {
          this.ball.dy = -this.ball.dy
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

  createBricks() {
    const {
      row: brickRow,
      column: brickColumn,
      width: brickWidth,
      height: brickHeight,
      padding: brickPadding,
      offsetTop: brickOffsetTop,
      offsetLeft: brickOffsetLeft,
      color: brickColor,
    } = this.brickConfig

    /** @type {Rectangle[][]} */
    const brickGroup = []
    for (let row = 0; row < brickRow; row++) {
      brickGroup[row] = []
      for (let col = 0; col < brickColumn; col++) {
        const brick = new Rectangle({
          x: row * (brickHeight + brickPadding) + brickOffsetTop,
          y: col * (brickWidth + brickPadding) + brickOffsetLeft,
          width: brickWidth,
          height: brickHeight,
          color: brickColor,
          hidden: false,
        })
        brickGroup[row].push(brick)
      }
    }
    return brickGroup
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
    this.ctx.textAlign = 'left'
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(`Score: ${this.score}`, 8, 20)
  }

  drawPlayInfo() {
    const fontSize = 16
    this.ctx.textAlign = 'center'
    this.ctx.font = `${fontSize}px Arial`
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(
      `Press arrow [Left] or [Right] to move`, //
      this.canvas.width / 2,
      (this.canvas.height - fontSize / 2) / 2
    )

    const marginTop = 16 * 1.5
    this.ctx.fillText(
      `[Enter] key to emit the ball`, //
      this.canvas.width / 2,
      (this.canvas.height - fontSize / 2) / 2 + marginTop
    )
  }

  restart() {
    // reset all
    this.score = 0
    this.ball.x = this.ballConfig.x
    this.ball.y = this.ballConfig.y
    this.ball.dx = this.ballConfig.dx
    this.ball.dy = this.ballConfig.dy
    this.paddle.x = this.paddleConfig.x
    this.paddle.y = this.paddleConfig.y
    this.isRightPressed = false
    this.isLeftPressed = false
    this.isGameOver = false
    this.isWin = false
    this.isPaddleHitting = false
    this.isWallHitting = false
    this.isEmitBall = false
    this.brickGroup.forEach((rowBricks) => {
      rowBricks.forEach((brick) => (brick.hidden = false))
    })

    this.renderPlayPage()
  }
}

class Circle {
  /**
   * @typedef {object} ICircleConfig
   * @property {number} x
   * @property {number} dx
   * @property {number} y
   * @property {number} dy
   * @property {number} radius
   * @property {string} color
   */

  /** @param {ICircleConfig} config */
  constructor(config) {
    this.x = config.x
    this.dx = config.dx
    this.y = config.y
    this.dy = config.dy
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
