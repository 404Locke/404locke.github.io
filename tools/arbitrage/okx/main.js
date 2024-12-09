document.addEventListener('DOMContentLoaded', function() {
    const pairsList = document.getElementById('pairsList');
    const OKX_API_BASE = 'https://www.okx.com';
    const SYMBOLS = ['BTC', 'ETH', 'LINK', 'BNB', 'ADA', 'LTC', 'BCH', 'XRP', 'SOL'];
    
    async function updatePairs() {
        try {
            pairsList.innerHTML = '<div class="text-center">加载中...</div>';
            
            for (const symbol of SYMBOLS) {
                try {
                    // 获取永续合约价格
                    const perpetualResponse = await fetch(`${OKX_API_BASE}/api/v5/market/ticker?instId=${symbol}-USD-SWAP`);
                    const perpetualData = await perpetualResponse.json();
                    
                    // 获取交割合约价格 (以最近的季度合约为例)
                    const deliveryResponse = await fetch(`${OKX_API_BASE}/api/v5/market/ticker?instId=${symbol}-USD-240628`);
                    const deliveryData = await deliveryResponse.json();

                    if (!perpetualData.data?.[0] || !deliveryData.data?.[0]) {
                        console.log(`Skipping ${symbol}: No data available`);
                        continue;
                    }

                    const perpetualPrice = parseFloat(perpetualData.data[0].last);
                    const deliveryPrice = parseFloat(deliveryData.data[0].last);
                    
                    // 计算价差百分比
                    const profit = ((deliveryPrice - perpetualPrice) / perpetualPrice * 100);

                    // 获取资金费率
                    const fundingResponse = await fetch(`${OKX_API_BASE}/api/v5/public/funding-rate?instId=${symbol}-USD-SWAP`);
                    const fundingData = await fundingResponse.json();
                    const fundingRate = fundingData.data?.[0]?.fundingRate 
                        ? (parseFloat(fundingData.data[0].fundingRate) * 100).toFixed(4)
                        : '0.00';

                    const card = document.createElement('div');
                    card.className = 'pair-card';
                    const profitClass = profit > 0 ? 'profit' : 'loss';
                    
                    card.innerHTML = `
                        <h5>${symbol}/USD</h5>
                        <p>永续合约价格: ${perpetualPrice.toFixed(2)}</p>
                        <p>交割合约价格: ${deliveryPrice.toFixed(2)}</p>
                        <p>价差: <span class="${profitClass}">${profit.toFixed(2)}%</span></p>
                        <p>资金费率: ${fundingRate}%</p>
                    `;
                    pairsList.appendChild(card);

                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                }
            }

            if (pairsList.innerHTML === '<div class="text-center">加载中...</div>') {
                pairsList.innerHTML = '<div class="text-center">暂无数据</div>';
            }

        } catch (error) {
            console.error('Error:', error);
            pairsList.innerHTML = '<div class="text-center text-danger">获取数据失败</div>';
        }
    }

    // 初始更新
    updatePairs();
    // 每5秒更新一次
    setInterval(updatePairs, 5000);
}); 