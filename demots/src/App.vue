<template>
  <div class="container">
    <header>
      <h1>交易工具集</h1>
    </header>
    
    <main class="tools-grid">
      <div class="tool-card" @click="navigateToTool('binance-futures-arbitrage')">
        <h3>币安期限套利</h3>
        <p>币安永续合约与交割合约套利工具</p>
      </div>
      <!-- 后续可以在这里添加更多工具卡片 -->
    </main>
  </div>
</template>

<script setup lang="ts">
const navigateToTool = (tool: string) => {
  if (tool === 'binance-futures-arbitrage') {
    window.location.href = '/tools/BinanceFuturesArbitrage/';
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  color: #333;
  font-size: 2.5em;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.tool-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.tool-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.tool-card p {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}
</style>
