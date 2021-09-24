# Breakout Game with vanilla JavaScript
Side project of HTML5 Game, refer to [MDN tutorials](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript).

#### Origin version (similar to MDN)
  - `index_mdn.html` + `main_mdn.js`
  - [demo](https://lastor-chen.github.io/breakout_game/index_mdn.html)

#### Remake version (use OOP)
  - `index_remake.html` + `main_remake.js`
  - [demo](https://lastor-chen.github.io/breakout_game/index_remake.html)

#### Phaser3 version (other repo)
  - [breakout game phaser](https://github.com/Lastor-Chen/breakout_game_phaser)

HTML5 Game 練習專案，參考上面的 MDN 教學，使用原生 JavaScript。MDN 教學的寫法較為古老，故重新用 OOP 的概念重做了一個 remake 版本，並對 game 內容添加一些新功能。
另外有使用 Phaser v3 的版本，位於其他 Repo。

## Origin version memo
- paddle 與 ball 的碰撞偵測是檢查當 ball 碰到場景底部時, ball 的中心是否介於 paddle.width 之間
- 碰撞偵測是計算下一幀, 而非當前幀
- 有 lives 機制, 死亡時看著像 bug
- 直接用 `document.location.reload()` 作為 restart
- ball 的運動軌跡恆定, 撞到 paddle 的任何位置皆不會改變 ball 的運動直線斜率(恆為 1)
- 此教學忽略了 `window.requestAnimationFrame()` 不同螢幕更新率, fps 會有差異的問題

## Remake version memo
- 改用 OOP 概念嘗試重構
- ball 從左右兩側碰撞 paddle 時, x 軸會發生連續判定, 導正 ball.y 卡在 paddle 裡, 需用防陡之類概念處理
- 同上 ball 卡進 wall 四角時, 因兩側都發生判定, ball 會卡牆
  - 不能用 boolean 開關處理, ball 會飛出世界, 故改用強制回推 ball.x 與 ball.y 的方式處理　
- 改用 app 內部機制 restart game
- 加入開始頁面, 結束頁面
- 加入 Enter key 發射機制與提示文字
- 加入偽物理算法, 讓 ball 能根據與 paddle 的撞擊位置不同, 改變運動直線斜率
  - 將 paddle 拆3段, 依照 ball 的方向分為, 近, 中, 遠
  - 撞擊近段 ball.x 減速, 撞擊遠段 ball.x 加速
- 加入控制 `window.requestAnimationFrame()` fps 的機制, 確保不同螢幕更新率時, 遊戲速度能保持一致