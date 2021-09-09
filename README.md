# BreakOut Game
HTML5 game 練習專案, 參考 [MDN tutorials](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript)

跟著教學走的版本:
  - `index_mdn.html` + `main_mdn.js`
  - [demo](https://lastor-chen.github.io/breakout_game/index_mdn.html)

重構改良版本:
  - `index_remake.html` + `main_remake.js`
  - [demo](https://lastor-chen.github.io/breakout_game/index_remake.html)

### MDN 版
- paddle 與 ball 的碰撞偵測是檢查當 ball 碰到場景底部時, ball 的中心是否介於 paddle.width 之間
- 碰撞偵測是計算下一幀, 而非當前幀
- 有 lives 機制, 死亡時看著像 bug
- 直接用 `document.location.reload()` 作為 restart
- ball 的運動軌跡沒做特別的計算, 恆為斜率 1 的線性軌跡

### 重構版
- 改用 OOP 概念嘗試重構
- paddle 與 ball 用 AABB 碰撞偵測, 從左右兩側碰撞時, ball.y 會卡住, 需特別處理
- 改用 app 內部機制 restart game
- 加入開始頁面, 結束頁面