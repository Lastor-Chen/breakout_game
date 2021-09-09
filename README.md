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
- ball 的運動軌跡恆定, 撞到 paddle 的任何位置皆不會改變 ball 的運動直線斜率(恆為 1)

### 重構版
- 改用 OOP 概念嘗試重構
- paddle 與 ball 用 AABB 碰撞偵測, 從左右兩側碰撞時, ball.y 會卡住, 需特別處理
- 改用 app 內部機制 restart game
- 加入開始頁面, 結束頁面
- 加入 Enter key 發射機制與提示文字
- 加入偽物理算法, 讓 ball 能根據與 paddle 的撞擊位置不同, 改變運動直線斜率
  - 將 paddle 拆3段, 依照 ball 的方向分為, 近, 中, 遠
  - 撞擊近段 ball.x 減速, 撞擊遠段 ball.x 加速