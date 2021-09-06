// @ts-check

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector('#myCanvas')
const ctx = canvas.getContext('2d')

const fps = 60

// ball config
let x = canvas.width / 2
let y = canvas.height - 50
let dx = 2
let dy = -2
const ballRadius = 10

// paddle config
const paddleHeight = 10
const paddleWidth = 75
const paddleOriginX = (canvas.width - paddleWidth) / 2
const paddleOriginY = canvas.height - paddleHeight - 10
let paddleX = paddleOriginX

// controller config
let rightPressed = false
let leftPressed = false

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { rightPressed = true }
  if (e.key === 'ArrowLeft') { leftPressed = true }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') { rightPressed = false }
  if (e.key === 'ArrowLeft') { leftPressed = false }
})

// frame loop
window.requestAnimationFrame(animationLoop)

function animationLoop() {
  // 清空上一個 frame
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 球板
  drawPaddle(paddleX, paddleOriginY, paddleWidth, paddleHeight)

  // 控制球板移動
  if (rightPressed && paddleX + paddleWidth < canvas.width) {
    paddleX += 7
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7
  }

  // 球
  drawBall(x, y, ballRadius)

  // 球反彈判定
  if (x + dx - ballRadius < 0 || x + dx + ballRadius > canvas.width) { dx = -dx }

  const ballBottomY = y + dy + ballRadius
  if (y + dy - ballRadius < 0) {
    dy = -dy
  } else if (paddleOriginY < ballBottomY && ballBottomY < paddleOriginY + paddleHeight) { // 碰到球板
    if (x > paddleX && x < paddleX + paddleWidth) { dy = -dy }
  } else if (ballBottomY > canvas.height) { // 碰到底部
    const isRestart = confirm('GAME OVER.\nRestart the game?')
    if (isRestart) {
      return document.location.reload()
    } else {
      return void 0
    }
  }

  x += dx
  y += dy

  window.requestAnimationFrame(animationLoop)
}

function drawBall(posX, posY, radius) {
  ctx.beginPath()
  ctx.arc(posX, posY, radius, 0, Math.PI * 2)
  ctx.fillStyle = '#0095DD'
  ctx.fill()
  ctx.closePath()
}

function drawPaddle(posX, posY, width, height) {
  ctx.beginPath()
  ctx.rect(posX, posY, width, height)
  ctx.fillStyle = '#0095DD'
  ctx.fill()
  ctx.closePath()
}