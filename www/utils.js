// [模块 2] 工具函数、UI渲染与DOM操作

// --- 数学与计算 ---
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    num = Math.floor(num);
    if (num < 0) return '-' + formatNumber(-num);
    if (num < 1000) return num.toString();
    const units = ['', 'k', 'm', 'b', 't', 'p', 'e', 'z', 'y'];
    let unitIndex = Math.floor(Math.log10(num) / 3);
    if (unitIndex >= units.length) return num.toExponential(3);
    return (num / Math.pow(1000, unitIndex)).toFixed(3) + units[unitIndex];
}
function parseNumberWithSuffix(str, floorResult = true) {
    str = str.trim(); if (str === '') return NaN;
    let num = Number(str); if (!isNaN(num)) return floorResult ? Math.floor(num) : num;
    const match = str.match(/^([\d.]+)([kKmMbBtTpPeEzZyY])$/);
    if (match) {
        const val = parseFloat(match[1]), unit = match[2].toLowerCase();
        const unitMap = { 'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12, 'p': 1e15, 'e': 1e18, 'z': 1e21, 'y': 1e24 };
        if (unitMap.hasOwnProperty(unit)) return floorResult ? Math.floor(val * unitMap[unit]) : val * unitMap[unit];
    }
    return NaN;
}
function calcUpgradeCost(level){ return Math.floor(gameState.baseUpgradeCost * Math.pow(gameState.upgradeCostMultiplier, level)); }
function calcRepCost(level){ if(level>=30) return Infinity; return Math.floor(gameState.baseReputationCost * Math.pow(gameState.reputationCostMultiplier, level)); }
function applyBuffValue(base, type){ 
    let val=base; 
    for(let b of gameState.activeBuffs){ 
        if(b.target===type || b.target==='both') val = b.isMultiplier ? val * (1 + b.value) : val + b.value; 
    } 
    return Math.max(0, val); 
}

// --- DOM 获取 ---
const cookieCountSpan = document.getElementById('cookieCount'), cookieBtn = document.getElementById('cookieButton');
const clickValSpan = document.getElementById('clickValueDisplay'), autoValSpan = document.getElementById('autoValueDisplay');
const upgradeLvSpan = document.getElementById('upgradeLevelDisplay'), repLvSpan = document.getElementById('reputationLevelDisplay');
const upgradeBtn = document.getElementById('upgradeButton'), upgradeCostSpan = document.getElementById('upgradeCostDisplay');
const repBtn = document.getElementById('reputationButton'), repCostSpan = document.getElementById('reputationCostDisplay');
const featureDiv = document.getElementById('featureButtons'), unlockHintDiv = document.getElementById('unlockHint');
const invSlotsSpan = document.getElementById('inventorySlots');
const chatDiv = document.getElementById('chatMessages'), chatInput = document.getElementById('chatInput'), sendBtn = document.getElementById('sendChatBtn');
const devState = document.getElementById('DevState');
let shopContainer, invGridContainer, shopModal, invModal;

// --- UI 提示 ---
function showToast(msg, isError=false){ 
    let d=document.createElement('div'); d.className='toast-message'; d.innerText=msg; 
    if(isError) d.style.background='#7f1a1a'; 
    document.body.appendChild(d); setTimeout(()=>d.remove(),2500);
}
function addChatMessage(sender, text, className){
    let msgDiv=document.createElement('div');
    msgDiv.className=`${className.a} p-2 rounded-lg ${className.b}`;
    msgDiv.innerHTML=`<span class="font-bold ${className.c}">${sender}:</span> ${text}`;
    chatDiv.appendChild(msgDiv); msgDiv.scrollIntoView({behavior:'smooth',block:'nearest'});
}

// --- 全局 Tooltip ---
let activeTooltip = null;
function showGlobalTooltip(text, x, y) {
    if (activeTooltip) activeTooltip.remove();
    let div = document.createElement('div'); div.className = 'global-tooltip'; div.innerHTML = text;
    document.body.appendChild(div);
    let rect = div.getBoundingClientRect(), left = x + 15, top = y - rect.height - 8;
    if (top < 10) top = y + 20;
    if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
    div.style.left = left + 'px'; div.style.top = top + 'px'; activeTooltip = div;
}
function hideGlobalTooltip() { if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; } }
function bindTooltip(el, title, desc, bonus, priceInfo, stackInfo) {
    el.addEventListener('mouseenter', (e) => showGlobalTooltip(`<strong>${title}</strong><br>${desc}<br>✨ 点击收益 +${bonus}<br>💰 ${priceInfo}<br>📦 ${stackInfo}`, e.clientX, e.clientY));
    el.addEventListener('mouseleave', hideGlobalTooltip);
}

// --- UI 渲染更新 ---
function updateUI(){
    cookieCountSpan.innerText = formatNumber(Math.floor(gameState.cookies));
    let finalClick = applyBuffValue(gameState.clickValue + gameState.totalItemBonus, 'click');
    let finalAuto = applyBuffValue(gameState.autoValue, 'auto');
    clickValSpan.innerText = `+${formatNumber(Math.floor(finalClick))} 曲奇/次`;
    autoValSpan.innerText = `+${formatNumber(Math.floor(finalAuto))} 曲奇/秒`;
    
    upgradeLvSpan.innerText = `等级 ${gameState.upgradeLevel}`;
    let upCost = calcUpgradeCost(gameState.upgradeLevel);
    upgradeCostSpan.innerText = ` costs: ${formatNumber(upCost)} 曲奇`;
    upgradeBtn.disabled = gameState.cookies < upCost;
    
    repLvSpan.innerText = `声望 ${gameState.reputationLevel}`;
    let repCost = calcRepCost(gameState.reputationLevel);
    if(gameState.reputationLevel<30){ repCostSpan.innerText = ` costs: ${formatNumber(repCost)} 曲奇`; repBtn.disabled = gameState.cookies<repCost; }
    else { repCostSpan.innerText = ` 需要新货币`; repBtn.disabled=true; }
    
    if (gameState.upgradeLevel >= 10 && !gameState.shopUnlocked) {
        gameState.shopUnlocked = true; gameState.inventoryUnlocked = true; showToast("✨ 10级解锁商店&背包！");
    }
    featureDiv.style.display = gameState.shopUnlocked ? 'grid' : 'none';
    unlockHintDiv.style.display = gameState.shopUnlocked ? 'none' : 'block';
    if(gameState.inventoryUnlocked) invSlotsSpan.innerText = `${gameState.inventorySlots}/${gameState.maxInventorySlots}`;
}

function renderShop(){ 
    if(!shopContainer) return; shopContainer.innerHTML=''; 
    for(let r=0; r<gameState.shopRowsUnlocked && r<shopItemsData.length; r++){ 
        let rowDiv=document.createElement('div'); rowDiv.className='mb-6'; 
        rowDiv.innerHTML=`<h3 class="font-bold text-lg mb-2">🍪 第${r+1}排</h3><div class="flex flex-wrap gap-3"></div>`; 
        let itemsDiv=rowDiv.querySelector('div'); 
        shopItemsData[r].forEach(item=>{ 
            let cnt=gameState.inventory.find(i=>i.id===item.id)?.count||0; let maxed=cnt>=item.maxStack; 
            let btnDiv=document.createElement('div'); 
            btnDiv.className=`bg-white border rounded-xl p-2 w-28 text-center shadow-sm ${maxed?'opacity-60': 'cursor-pointer hover:scale-105 transition'}`; 
            if(!maxed) btnDiv.onclick=()=>buyItem(item); 
            btnDiv.innerHTML=`<i class="fa ${item.icon} text-2xl text-shop"></i><div class="font-bold text-sm">${item.name}</div><div class="text-green-600 text-xs">+${item.bonus}</div><div class="text-xs">${formatNumber(item.price)}</div><div class="text-[10px]">${cnt}/${item.maxStack}</div>`; 
            bindTooltip(btnDiv, item.name, item.desc, item.bonus, `${formatNumber(item.price)}曲奇`, `${cnt}/${item.maxStack}个`); 
            itemsDiv.appendChild(btnDiv); 
        }); 
        shopContainer.appendChild(rowDiv); 
    } 
}

function updateInventoryDisplay(){ 
    if(!invGridContainer) return; invGridContainer.innerHTML=''; 
    let gridDiv=document.createElement('div'); gridDiv.className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'; 
    for(let i=0;i<gameState.inventorySlots;i++){ 
        let invItem=i<gameState.inventory.length?gameState.inventory[i]:null; 
        let slotDiv=document.createElement('div'); slotDiv.className='bg-gray-100 border rounded-xl p-2 relative min-h-[100px] flex flex-col items-center justify-center'; 
        if(invItem){ 
            let data=allShopItems.find(d=>d.id===invItem.id); 
            if(data){ 
                slotDiv.innerHTML=`<i class="fa ${data.icon} text-3xl text-inventory"></i><div class="font-bold text-sm mt-1">${data.name}</div><div class="text-green-600 text-xs">+${data.bonus}</div><div class="text-xs">x${invItem.count}</div><button class="decompose-btn mt-2 bg-red-400 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600" data-id="${data.id}" data-count="1">💔分解</button>`; 
                slotDiv.querySelector('.decompose-btn').addEventListener('click',(e)=>{ e.stopPropagation(); decomposeItem(data.id); }); 
                bindTooltip(slotDiv, data.name, data.desc, data.bonus, `${formatNumber(data.price)}曲奇`, `${invItem.count}/${data.maxStack}个`); 
            } 
        } else { slotDiv.innerHTML=`<i class="fa fa-box-open text-gray-400 text-4xl"></i><div class="text-xs text-gray-400">空闲格子</div>`; } 
        gridDiv.appendChild(slotDiv); 
    } 
    invGridContainer.appendChild(gridDiv); 
}