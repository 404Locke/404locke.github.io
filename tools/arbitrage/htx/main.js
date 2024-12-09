document.addEventListener('DOMContentLoaded', function() {
    const pairsList = document.getElementById('pairsList');
    
    function updatePairs() {
        fetch('/api/htx/arbitrage')
            .then(response => response.json())
            .then(data => {
                pairsList.innerHTML = '';
                data.forEach(pair => {
                    const card = document.createElement('div');
                    card.className = 'pair-card';
                    const profitClass = pair.profit > 0 ? 'profit' : 'loss';
                    
                    card.innerHTML = `
                        <h5>${pair.symbol}</h5>
                        <p>永续合约价格: ${pair.perpetualPrice}</p>
                        <p>交割合约价格: ${pair.deliveryPrice}</p>
                        <p>价差: <span class="${profitClass}">${pair.profit.toFixed(2)}%</span></p>
                        <p>资金费率: ${pair.fundingRate}%</p>
                    `;
                    pairsList.appendChild(card);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // 初始更新
    updatePairs();
    // 每5秒更新一次
    setInterval(updatePairs, 5000);
}); 