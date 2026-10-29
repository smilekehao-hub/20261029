// ==========================================
// 全局變數宣告
// ==========================================

// 儲存精靈圖片資源的變數
let stopImg; // 站立/靜止精靈圖
let walkImg; // 行走精靈圖

// 儲存切分後的單張 Frame 陣列
let stopFrames = []; // 站立動畫幀陣列 (13 幀)
let walkFrames = []; // 行走動畫幀陣列 (9 幀)

// 角色屬性變數
let posX; // 角色的 X 座標
let posY; // 角色的 Y 座標
let moveSpeed = 4; // 角色移動速度 (像素/幀)
let isFacingLeft = false; // 角色的朝向狀態 (false: 面向右, true: 面向左)

// 動態繪圖/動畫控制變數
let currentFrame = 0; // 當前播放到的動畫幀索引
let frameTimer = 0; // 幀計時器
let frameInterval = 5; // 控制動畫播放速度 (每 5 幀更新一次動畫圖案)

// ==========================================
// 1. preload() - 預載圖片資源
// ==========================================
function preload() {
  // 載入靜止狀態精靈圖 (1955 * 212)
  stopImg = loadImage('1/stop/stop.png', imgLoaded, imgError);
  // 載入行走狀態精靈圖 (1246 * 198)
  walkImg = loadImage('1/walk/walk.png', imgLoaded, imgError);
}

// 圖片載入成功的相應回呼函式
function imgLoaded() {
  console.log('圖片載入成功！');
}

// 圖片載入失敗時的備用處理函式 (若找不到圖片可避免程式崩潰)
function imgError(err) {
  console.warn('圖片載入失敗，將啟動向量圖形替代機制。', err);
}

// ==========================================
// 2. setup() - 設定與初始化
// ==========================================
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 設定繪圖基準點為圖片中心 (方便旋轉與翻轉處理)
  imageMode(CENTER);

  // 初始化角色位置在螢幕正中央
  posX = width / 2;
  posY = height / 2;

  // 切割站立精靈圖 (全圖寬 1955，共有 13 幀，每幀寬度約 150.38，高度 212)
  sliceSpriteSheet(stopImg, 13, 1955, 212, stopFrames);

  // 切割行走精靈圖 (全圖寬 1246，共有 9 幀，每幀寬度約 138.44，高度 198)
  sliceSpriteSheet(walkImg, 9, 1246, 198, walkFrames);
}

// ==========================================
// 精靈圖切割輔助函式
// ==========================================
function sliceSpriteSheet(img, frameCount, totalWidth, totalHeight, targetArray) {
  // 檢查圖片是否載入成功且有內容
  if (img && img.width > 0) {
    // 計算單一幀的寬度
    let frameWidth = totalWidth / frameCount;
    let frameHeight = totalHeight;

    // 迴圈取出每一幀圖片
    for (let i = 0; i < frameCount; i++) {
      // 裁切圖片子區域 get(x, y, w, h)
      let frame = img.get(i * frameWidth, 0, frameWidth, frameHeight);
      // 將裁切出的幀存入目標陣列
      targetArray.push(frame);
    }
  }
}

// ==========================================
// 3. draw() - 主繪製與更新迴圈
// ==========================================
function draw() {
  // 設定背景顏色為天空藍 (#a2d2ff)
  background('#a2d2ff');

  // 判斷當前按鍵狀態並更新角色位置與狀態
  updateCharacter();

  // 繪製角色精靈
  drawCharacter();
}

// ==========================================
// 角色位置與狀態更新邏輯
// ==========================================
function updateCharacter() {
  // 預設當前狀態為靜止
  let isMoving = false;

  // 按下鍵盤右鍵 (RIGHT_ARROW 或 按鍵 'D')
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    posX += moveSpeed; // 角色往右移動
    isFacingLeft = false; // 設置朝向為右
    isMoving = true; // 設定移動狀態為 true
  } 
  // 按下鍵盤左鍵 (LEFT_ARROW 或 按鍵 'A')
  else if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    posX -= moveSpeed; // 角色往左移動
    isFacingLeft = true; // 設置朝向為左
    isMoving = true; // 設定移動狀態為 true
  }

  // 限制角色不超出螢幕左右邊界
  posX = constrain(posX, 50, width - 50);

  // 更新動畫幀計數器
  frameTimer++;
  if (frameTimer >= frameInterval) {
    frameTimer = 0; // 重置計時器

    // 根據移動狀態選擇當前動畫總幀數
    let totalFrames = isMoving ? 9 : 13;
    // 循環遞增當前幀索引
    currentFrame = (currentFrame + 1) % totalFrames;
  }
}

// ==========================================
// 角色繪製邏輯
// ==========================================
function drawCharacter() {
  // 判斷玩家目前是否正在按下向左或向右鍵
  let isMoving = keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(68);

  // 儲存當前繪圖矩陣狀態
  push();

  // 將畫布原點平移至角色的當前位置
  translate(posX, posY);

  // 如果角色面向左側，水平翻轉畫布 (-1, 1)
  if (isFacingLeft) {
    scale(-1, 1);
  }

  // 判斷是否有載入成功的精靈圖片
  if (isMoving && walkFrames.length > 0) {
    // 顯示行走動畫的當前幀
    let frameIdx = currentFrame % walkFrames.length;
    image(walkFrames[frameIdx], 0, 0);
  } else if (!isMoving && stopFrames.length > 0) {
    // 顯示站立靜止動畫的當前幀
    let frameIdx = currentFrame % stopFrames.length;
    image(stopFrames[frameIdx], 0, 0);
  } else {
    // 備援機制：當圖片檔缺失或未載入時繪製替代圖案
    drawFallbackCharacter(isMoving);
  }

  // 還原繪圖矩陣狀態
  pop();
}

// ==========================================
// 備援角色圖案繪製 (圖檔丟失時自動啟動)
// ==========================================
function drawFallbackCharacter(isMoving) {
  // 繪製身體底色
  fill(isMoving ? '#ffb703' : '#fb8500');
  stroke(255);
  strokeWeight(3);
  rect(0, 0, 80, 120, 20);

  // 繪製頭部
  fill('#219ebc');
  ellipse(0, -70, 60, 60);

  // 繪製眼睛 (標示方向)
  fill(255);
  ellipse(15, -75, 16, 16);
  fill(0);
  ellipse(18, -75, 8, 8);

  // 顯示動畫狀態提示文字
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(14);
  let statusText = isMoving ? `行走\nFrame: ${currentFrame + 1}/9` : `站立\nFrame: ${currentFrame + 1}/13`;
  text(statusText, 0, 0);
}

// ==========================================
// 4. windowResized() - 視窗大小改變時自動縮放畫布
// ==========================================
function windowResized() {
  // 重新調整畫布大小為當前的螢幕尺寸
  resizeCanvas(windowWidth, windowHeight);
  // 將角色 Y 軸重置至螢幕中央
  posY = height / 2;
}