### MDN 版
- paddle 與 ball 的碰撞偵測是檢查當 ball 碰到場景底部時, ball 的中心是否介於 paddle.width 之間
- 碰撞偵測是計算下一幀, 而非當前幀
- 有 lives 機制, 死亡時看著像 bug
- 直接用 `document.location.reload()` 作為 restart
- ball 的運動軌跡沒做特別的計算, 恆為斜率 1 的線性軌跡

### 重構版
- 改用 OOP 概念嘗試重構
- paddle 與 ball 用 AABB 碰撞偵測, 從左右兩側碰撞時, ball.y 會卡住, 需特別處理