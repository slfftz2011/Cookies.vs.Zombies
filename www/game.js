// [模块 3] 核心玩法逻辑（点击、购买、升级）

function gainCookies(amount, event, isSilent=false){ 
    let finalAmount = isSilent ? amount : applyBuffValue(amount, 'click'); 
    gameState.cookies += finalAmount; 
    if(!isSilent && event){ 
        let fl=document.createElement('div'); fl.className='floating'; fl.innerText=`+${formatNumber(Math.floor(finalAmount))}`;
        let rect=cookieBtn.getBoundingClientRect(), x=event.clientX-rect.left, y=event.clientY-rect.top; 
        fl.style.left=`${x}px`; fl.style.top=`${y}px`; cookieBtn.appendChild(fl); setTimeout(()=>fl.remove(),800); 
    } 
    updateUI(); 
}
function spend(amount){ if(gameState.cookies>=amount){ gameState.cookies-=amount; updateUI(); return true; } return false; }
function calculateTotalBonus(){ let total=0; for(let it of gameState.inventory){ let data=allShopItems.find(d=>d.id===it.id); if(data) total+=data.bonus*it.count; } gameState.totalItemBonus=total; }

function buyItem(item){
    let existingStack=gameState.inventory.find(i=>i.id===item.id);
    if(existingStack && existingStack.count>=item.maxStack){ showToast(`已达最大数量 ${item.name}`,true); return; }
    if(!existingStack && gameState.inventory.length>=gameState.inventorySlots){ showToast("背包格子不足",true); return; }
    if(gameState.cookies>=item.price){
        gameState.cookies-=item.price;
        if(existingStack) existingStack.count++; else gameState.inventory.push({id:item.id,count:1});
        calculateTotalBonus();
        let rowIdx=shopItemsData.findIndex(row=>row.some(i=>i.id===item.id));
        let isLast=shopItemsData[rowIdx][shopItemsData[rowIdx].length-1].id===item.id;
        if(isLast && gameState.shopRowsUnlocked<shopItemsData.length && rowIdx+1===gameState.shopRowsUnlocked){
            gameState.shopRowsUnlocked++; showToast(`✨ 解锁第${gameState.shopRowsUnlocked}排新商品！`);
        }
        renderShop(); updateInventoryDisplay(); updateUI(); showToast(`购买 ${item.name}`);
        addChatMessage("🍪系统", `购买了【${item.name}】, 点击收益+${item.bonus}`, System);
    } else showToast("曲奇不够啦!",true);
}

function decomposeItem(itemId){ 
    let idx=gameState.inventory.findIndex(i=>i.id===itemId); if(idx===-1) return; 
    let itemData=allShopItems.find(d=>d.id===itemId), priceBack=Math.floor(itemData.price*0.6); 
    gameState.cookies+=priceBack; gameState.inventory[idx].count--; 
    if(gameState.inventory[idx].count<=0) gameState.inventory.splice(idx,1); 
    calculateTotalBonus(); updateInventoryDisplay(); updateUI(); 
    showToast(`分解返还 ${formatNumber(priceBack)} 曲奇`); 
    addChatMessage("♻️ 回收", `分解了 ${itemData.name} 获得 ${formatNumber(priceBack)}曲奇`, System); 
}

function checkUnlockSlotByLevel(){ 
    let newSlotCount=4+ Math.floor((gameState.upgradeLevel- gameState.slotUnlockLevel)/gameState.slotUnlockInterval); 
    if(newSlotCount<4) newSlotCount=4; if(newSlotCount>gameState.maxInventorySlots) newSlotCount=gameState.maxInventorySlots; 
    if(newSlotCount>gameState.inventorySlots){ gameState.inventorySlots=newSlotCount; updateInventoryDisplay(); showToast(`🎒 背包扩充至 ${gameState.inventorySlots} !`); } 
}

function upgradeClick(){ 
    let cost=calcUpgradeCost(gameState.upgradeLevel); 
    if(spend(cost)){ 
        gameState.upgradeLevel++; gameState.clickValue+=gameState.upgradeValueIncrease; 
        checkUnlockSlotByLevel(); updateUI(); 
        addChatMessage("⚡升级","点击等级提升！",Level); 
        cookieBtn.classList.add('level-up-animation'); setTimeout(()=>cookieBtn.classList.remove('level-up-animation'),300); 
    } 
}
function upgradeReputation(){ 
    if(gameState.reputationLevel>=30) return; 
    let cost=calcRepCost(gameState.reputationLevel); 
    if(spend(cost)){ 
        gameState.reputationLevel++; gameState.autoValue+=gameState.reputationAutoGainIncrease; 
        updateUI(); addChatMessage("🌟 声望", `声望提升至 ${gameState.reputationLevel}`, Level); 
    } 
}