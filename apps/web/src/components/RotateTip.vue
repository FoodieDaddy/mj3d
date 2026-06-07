<template>
  <div class="rotate-tip">
    <div class="rotate-card">
      <div class="rotate-icon">📱</div>
      <h2>请横屏游玩</h2>
      <p>横屏后可以看到完整牌桌、手牌和操作按钮</p>
    </div>
  </div>
</template>

<style scoped>
.rotate-tip {
  display: none;
}

@media screen and (orientation: portrait) and (max-width: 900px) {
  .rotate-tip {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top, rgba(44, 199, 91, 0.2), transparent 40%),
      rgba(2, 10, 6, 0.92);
    color: #fff;
  }
}

.rotate-card {
  width: min(320px, 90vw);
  padding: 28px 24px;
  border-radius: 24px;
  text-align: center;
  background: rgba(4, 32, 17, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(14px);
}

.rotate-icon {
  margin-bottom: 14px;
  font-size: 54px;
  transform: rotate(90deg);
}

.rotate-card h2 {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 900;
}

.rotate-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  line-height: 1.7;
}
</style>
