// ------------------- 常量 & 游戏状态 -------------------
const isDev = true;
let gameState = {
    cookies: 500,
    clickValue: 5, autoValue: 1, lastUpdate: Date.now(),
    upgradeLevel: 0, baseUpgradeCost: 8, upgradeCostMultiplier: 1.4, upgradeValueIncrease: 2,
    reputationLevel: 0, maxReputationWithoutNewCurrency: 30, baseReputationCost: 1600, reputationCostMultiplier: 1.95, reputationAutoGainIncrease: 2,
    shopUnlocked: false, shopRowsUnlocked: 1, itemsPerRow: 8,
    inventoryUnlocked: false, inventorySlots: 4, maxInventorySlots: 104, slotUnlockLevel: 10, slotUnlockInterval: 5,
    inventory: [], totalItemBonus: 0,
    activeBuffs: []   // 永久属性: { id, target, value, isMultiplier, permanent: true }
};
const shopItemsData = [
    [{id:1,name:"曲奇戒指",price:480,bonus:1,maxStack:5,icon:"fa-diamond",desc:"一枚刻有曲奇图案的戒指，小幅提升点击收益"},{id:2,name:"烘焙手套",price:1150,bonus:3,maxStack:5,icon:"fa-hand-paper-o",desc:"提高点击效率的专业手套"},{id:3,name:"幸运曲奇",price:2400,bonus:5,maxStack:5,icon:"fa-cookie",desc:"带来好运的特殊曲奇"},{id:4,name:"黄金搅拌器",price:4300,bonus:8,maxStack:5,icon:"fa-wrench",desc:"闪闪发光的黄金搅拌器"},{id:5,name:"曲奇护身符",price:7200,bonus:12,maxStack:5,icon:"fa-shield",desc:"保佑获得更多曲奇"},{id:6,name:"烘焙大师徽章",price:11500,bonus:18,maxStack:5,icon:"fa-trophy",desc:"证明烘焙技巧的徽章"},{id:7,name:"巧克力抹刀",price:19500,bonus:25,maxStack:5,icon:"fa-cutlery",desc:"涂满巧克力的专业抹刀"},{id:8,name:"魔法烤箱手套",price:34000,bonus:35,maxStack:5,icon:"fa-fire",desc:"带有魔力的烤箱手套，解锁下一排物品"}],
    [{id:9,name:"曲奇精灵",price:59000,bonus:50,maxStack:5,icon:"fa-magic",desc:"帮助收集曲奇的小精灵"},{id:10,name:"皇家糖霜刷",price:98000,bonus:75,maxStack:5,icon:"fa-paint-brush",desc:"皇室专用的糖霜刷"},{id:11,name:"钻石糖粒",price:155000,bonus:100,maxStack:5,icon:"fa-gem",desc:"闪闪发光的钻石糖粒"},{id:12,name:"秘方卷轴",price:245000,bonus:150,maxStack:5,icon:"fa-book",desc:"记载古老曲奇秘方"},{id:13,name:"神性黄油",price:390000,bonus:220,maxStack:5,icon:"fa-leaf",desc:"带有神圣气息的黄油"},{id:14,name:"天堂面粉袋",price:630000,bonus:300,maxStack:5,icon:"fa-shopping-basket",desc:"来自天堂的特制面粉"},{id:15,name:"传奇擀面杖",price:980000,bonus:400,maxStack:5,icon:"fa-hammer",desc:"传说中的擀面杖"},{id:16,name:"烘焙神谕",price:1750000,bonus:600,maxStack:5,icon:"fa-lightbulb-o",desc:"烘焙之神的启示，解锁下一排"}],
    [{id:17,name:"曲奇神祇化身",price:2900000,bonus:900,maxStack:5,icon:"fa-star",desc:"曲奇之神的祝福"},{id:18,name:"宇宙面团",price:4900000,bonus:1300,maxStack:5,icon:"fa-globe",desc:"来自宇宙的神秘面团"},{id:19,name:"时间糖霜",price:8200000,bonus:2000,maxStack:5,icon:"fa-hourglass-half",desc:"扭曲时间的糖霜"},{id:20,name:"维度烤盘",price:13500000,bonus:3000,maxStack:5,icon:"fa-cube",desc:"跨越维度的烤盘"},{id:21,name:"永恒酵母",price:24500000,bonus:4500,maxStack:5,icon:"fa-bolt",desc:"永不失效的神奇酵母"},{id:22,name:"创造之巧克力",price:39000000,bonus:6500,maxStack:5,icon:"fa-moon-o",desc:"创世之力巧克力"},{id:23,name:"绝对曲奇理论",price:68000000,bonus:9500,maxStack:5,icon:"fa-flask",desc:"解释曲奇本质的理论"},{id:24,name:"曲奇奇点",price:118000000,bonus:15000,maxStack:5,icon:"fa-black-tie",desc:"曲奇的终极形态，解锁下一排"}]
];
const allShopItems = shopItemsData.flat();

const System = {a:'text-purple-700 bg-purple-50', b:'border-l-4 border-purple-400', c:'text-purple-600'};
const Player = {a:'text-gray-800', b:'', c:''};
const Level = {a:'text-green-800 bg-green-50', b:'border-l-4 border-green-400', c:''};
const Battle = {a:'text-orange-800 bg-orange-50', b:'border-l-4 border-orange-400', c:''};
const event_Lucky = {a:'text-blue-800 bg-blue-50', b:'border-l-4 border-blue-400', c:''};
const event_Negative = {a:'text-red-800 bg-red-50', b:'border-l-4 border-red-400', c:''};
const event_Active = {a:'text-gold-800 bg-gold-50', b:'border-l-4 border-gold-400', c:''};
// DOM 元素
const cookieCountSpan = document.getElementById('cookieCount'), cookieBtn = document.getElementById('cookieButton');
const clickValSpan = document.getElementById('clickValueDisplay'), autoValSpan = document.getElementById('autoValueDisplay');
const upgradeLvSpan = document.getElementById('upgradeLevelDisplay'), repLvSpan = document.getElementById('reputationLevelDisplay');
const upgradeBtn = document.getElementById('upgradeButton'), upgradeCostSpan = document.getElementById('upgradeCostDisplay');
const repBtn = document.getElementById('reputationButton'), repCostSpan = document.getElementById('reputationCostDisplay');
const featureDiv = document.getElementById('featureButtons'), unlockHintDiv = document.getElementById('unlockHint');
const shopModal = document.getElementById('shopModal'), invModal = document.getElementById('inventoryModal');
const closeShop = document.getElementById('closeShopButton'), closeInv = document.getElementById('closeInventoryButton');
const shopContainer = document.getElementById('shopItemsContainer'), invGridContainer = document.getElementById('inventoryGridContainer');
const invSlotsSpan = document.getElementById('inventorySlots');
const chatDiv = document.getElementById('chatMessages'), chatInput = document.getElementById('chatInput'), sendBtn = document.getElementById('sendChatBtn');
const devState = document.getElementById('DevState');
devState.append(isDev?'开发模式已启用 · 输入 /help 查看作弊':'开发模式未启用');

// 全局tooltip
let activeTooltip = null;
function showGlobalTooltip(text, x, y) {
    if (activeTooltip) activeTooltip.remove();
    let div = document.createElement('div');
    div.className = 'global-tooltip';
    div.innerHTML = text;
    document.body.appendChild(div);
    let rect = div.getBoundingClientRect();
    let left = x + 15;
    let top = y - rect.height - 8;
    if (top < 10) top = y + 20;
    if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
    div.style.left = left + 'px';
    div.style.top = top + 'px';
    activeTooltip = div;
}
function hideGlobalTooltip() { if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; } }
function bindTooltip(el, title, desc, bonus, priceInfo, stackInfo) {
    el.addEventListener('mouseenter', (e) => {
        let html = `<strong>${title}</strong><br>${desc}<br>✨ 点击收益 +${bonus}<br>💰 ${priceInfo}<br>📦 ${stackInfo}`;
        showGlobalTooltip(html, e.clientX, e.clientY);
    });
    el.addEventListener('mousemove', (e) => {
        if (activeTooltip) {
            let rect = activeTooltip.getBoundingClientRect();
            let left = e.clientX + 15;
            let top = e.clientY - rect.height - 8;
            if (top < 10) top = e.clientY + 20;
            if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
            activeTooltip.style.left = left + 'px';
            activeTooltip.style.top = top + 'px';
        }
    });
    el.addEventListener('mouseleave', hideGlobalTooltip);
}

// 辅助函数
function showToast(msg, isError=false){ let d=document.createElement('div'); d.className='toast-message'; d.innerText=msg; if(isError) d.style.background='#7f1a1a'; document.body.appendChild(d); setTimeout(()=>d.remove(),2500);}
function addChatMessage(sender, text, className){
    let msgDiv=document.createElement('div');
    msgDiv.className=`${className.a} p-2 rounded-lg ${className.b}`;
    msgDiv.innerHTML=`<span class="font-bold ${className.c}">${sender}:</span> ${text}`;
    chatDiv.appendChild(msgDiv);
    msgDiv.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function applyBuffValue(base, type){ 
    let val=base; 
    for(let b of gameState.activeBuffs){ 
        if(b.target===type || b.target==='both') { 
            if(b.isMultiplier) val *= (1 + b.value); 
            else val += b.value; 
        } 
    } 
    return Math.max(0, val); 
}
function updateUI(){
    cookieCountSpan.innerText = Math.floor(gameState.cookies).toLocaleString();
    let finalClick = gameState.clickValue + gameState.totalItemBonus;
    finalClick = applyBuffValue(finalClick, 'click');
    let finalAuto = gameState.autoValue;
    finalAuto = applyBuffValue(finalAuto, 'auto');
    clickValSpan.innerText = `+${Math.floor(finalClick)} 曲奇/次`;
    autoValSpan.innerText = `+${Math.floor(finalAuto)} 曲奇/秒`;
    upgradeLvSpan.innerText = `等级 ${gameState.upgradeLevel}`;
    let upCost = calcUpgradeCost(gameState.upgradeLevel);
    upgradeCostSpan.innerText = ` costs: ${upCost.toLocaleString()} 曲奇`;
    upgradeBtn.disabled = gameState.cookies < upCost;
    repLvSpan.innerText = `声望 ${gameState.reputationLevel}`;
    let repCost = calcRepCost(gameState.reputationLevel);
    if(gameState.reputationLevel<30){ repCostSpan.innerText = ` costs: ${repCost.toLocaleString()} 曲奇`; repBtn.disabled = gameState.cookies<repCost; }
    else { repCostSpan.innerText = ` 需要新货币`; repBtn.disabled=true; }
    if(gameState.upgradeLevel>=10 && (!gameState.shopUnlocked)){ gameState.shopUnlocked=true; gameState.inventoryUnlocked=true; featureDiv.style.display='grid'; unlockHintDiv.style.display='none'; renderShop(); updateInventoryDisplay(); showToast("✨ 10级解锁商店&背包！"); }
    if(gameState.inventoryUnlocked) invSlotsSpan.innerText = `${gameState.inventorySlots}/${gameState.maxInventorySlots}`;
}
function calcUpgradeCost(level){ return Math.floor(gameState.baseUpgradeCost * Math.pow(gameState.upgradeCostMultiplier, level)); }
function calcRepCost(level){ if(level>=30) return Infinity; return Math.floor(gameState.baseReputationCost * Math.pow(gameState.reputationCostMultiplier, level)); }
function gainCookies(amount, event, isSilent=false){ let finalAmount=amount; if(!isSilent){ finalAmount = applyBuffValue(amount, 'click'); } gameState.cookies+=finalAmount; if(!isSilent && event){ let fl=document.createElement('div'); fl.className='floating'; fl.innerText=`+${Math.floor(finalAmount)}`; let rect=cookieBtn.getBoundingClientRect(); let x=event.clientX-rect.left, y=event.clientY-rect.top; fl.style.left=`${x}px`; fl.style.top=`${y}px`; cookieBtn.appendChild(fl); setTimeout(()=>fl.remove(),800); } updateUI(); }
function spend(amount){ if(gameState.cookies>=amount){ gameState.cookies-=amount; updateUI(); return true; } return false; }

function buyItem(item){
    let existingStack=gameState.inventory.find(i=>i.id===item.id);
    if(existingStack && existingStack.count>=item.maxStack){ showToast(`已达最大数量 ${item.name}`,true); return; }
    if(!existingStack && gameState.inventory.length>=gameState.inventorySlots){ showToast("背包格子不足，请升级等级解锁更多格子",true); return; }
    if(gameState.cookies>=item.price){
        gameState.cookies-=item.price;
        if(existingStack){ existingStack.count++; }
        else{ gameState.inventory.push({id:item.id,count:1}); }
        calculateTotalBonus();
        let rowIdx=shopItemsData.findIndex(row=>row.some(i=>i.id===item.id));
        let isLast=shopItemsData[rowIdx][shopItemsData[rowIdx].length-1].id===item.id;
        if(isLast && gameState.shopRowsUnlocked<shopItemsData.length && rowIdx+1===gameState.shopRowsUnlocked){
            gameState.shopRowsUnlocked++;
            showToast(`✨ 解锁第${gameState.shopRowsUnlocked}排新商品！`);
            renderShop();
        }
        renderShop(); updateInventoryDisplay(); updateUI(); showToast(`购买 ${item.name} +${item.bonus}点击收益`);
        addChatMessage("🍪系统", `购买了【${item.name}】, 点击收益+${item.bonus}`, System);
    } else showToast("曲奇不够啦!",true);
}
function calculateTotalBonus(){ let total=0; for(let it of gameState.inventory){ let data=allShopItems.find(d=>d.id===it.id); if(data) total+=data.bonus*it.count; } gameState.totalItemBonus=total; }
function renderShop(){ if(!shopContainer) return; shopContainer.innerHTML=''; for(let r=0; r<gameState.shopRowsUnlocked && r<shopItemsData.length; r++){ let rowDiv=document.createElement('div'); rowDiv.className='mb-6'; rowDiv.innerHTML=`<h3 class="font-bold text-lg mb-2">🍪 第${r+1}排</h3><div class="flex flex-wrap gap-3"></div>`; let itemsDiv=rowDiv.querySelector('div'); shopItemsData[r].forEach(item=>{ let cnt=gameState.inventory.find(i=>i.id===item.id)?.count||0; let maxed=cnt>=item.maxStack; let btnDiv=document.createElement('div'); btnDiv.className=`bg-white border rounded-xl p-2 w-28 text-center shadow-sm ${maxed?'opacity-60': 'cursor-pointer hover:scale-105 transition'}`; if(!maxed) btnDiv.onclick=()=>buyItem(item); btnDiv.innerHTML=`<i class="fa ${item.icon} text-2xl text-shop"></i><div class="font-bold text-sm">${item.name}</div><div class="text-green-600 text-xs">+${item.bonus}</div><div class="text-xs">${item.price.toLocaleString()}</div><div class="text-[10px]">${cnt}/${item.maxStack}</div>`; bindTooltip(btnDiv, item.name, item.desc, item.bonus, `${item.price.toLocaleString()}曲奇`, `${cnt}/${item.maxStack}个`); itemsDiv.appendChild(btnDiv); }); shopContainer.appendChild(rowDiv); } }
function updateInventoryDisplay(){ if(!invGridContainer) return; invGridContainer.innerHTML=''; let gridDiv=document.createElement('div'); gridDiv.className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'; for(let i=0;i<gameState.inventorySlots;i++){ let invItem=i<gameState.inventory.length?gameState.inventory[i]:null; let slotDiv=document.createElement('div'); slotDiv.className='bg-gray-100 border rounded-xl p-2 relative min-h-[100px] flex flex-col items-center justify-center'; if(invItem){ let data=allShopItems.find(d=>d.id===invItem.id); if(data){ slotDiv.innerHTML=`<i class="fa ${data.icon} text-3xl text-inventory"></i><div class="font-bold text-sm mt-1">${data.name}</div><div class="text-green-600 text-xs">+${data.bonus}</div><div class="text-xs">x${invItem.count}</div><button class="decompose-btn mt-2 bg-red-400 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600" data-id="${data.id}" data-count="1">💔分解</button>`; let decoBtn=slotDiv.querySelector('.decompose-btn'); decoBtn.addEventListener('click',(e)=>{ e.stopPropagation(); decomposeItem(data.id); }); bindTooltip(slotDiv, data.name, data.desc, data.bonus, `${data.price.toLocaleString()}曲奇`, `${invItem.count}/${data.maxStack}个`); } } else { slotDiv.innerHTML=`<i class="fa fa-box-open text-gray-400 text-4xl"></i><div class="text-xs text-gray-400">空闲格子</div>`; } gridDiv.appendChild(slotDiv); } invGridContainer.appendChild(gridDiv); }
function decomposeItem(itemId){ let idx=gameState.inventory.findIndex(i=>i.id===itemId); if(idx===-1) return; let itemData=allShopItems.find(d=>d.id===itemId); let priceBack=Math.floor(itemData.price*0.6); gameState.cookies+=priceBack; gameState.inventory[idx].count--; if(gameState.inventory[idx].count<=0) gameState.inventory.splice(idx,1); calculateTotalBonus(); updateInventoryDisplay(); updateUI(); showToast(`分解返还 ${priceBack.toLocaleString()} 曲奇`); addChatMessage("♻️ 回收", `分解了 ${itemData.name} 获得 ${priceBack.toLocaleString()}曲奇`, System); }
function checkUnlockSlotByLevel(){ let newSlotCount=4+ Math.floor((gameState.upgradeLevel- gameState.slotUnlockLevel)/gameState.slotUnlockInterval); if(newSlotCount<4) newSlotCount=4; if(newSlotCount>gameState.maxInventorySlots) newSlotCount=gameState.maxInventorySlots; if(newSlotCount>gameState.inventorySlots){ gameState.inventorySlots=newSlotCount; updateInventoryDisplay(); showToast(`🎒 背包格子扩充至 ${gameState.inventorySlots} !`); } }
function upgradeClick(){ let cost=calcUpgradeCost(gameState.upgradeLevel); if(spend(cost)){ gameState.upgradeLevel++; gameState.clickValue+=gameState.upgradeValueIncrease; checkUnlockSlotByLevel(); updateUI(); addChatMessage("⚡升级","点击等级提升！",Level); cookieBtn.classList.add('level-up-animation'); setTimeout(()=>cookieBtn.classList.remove('level-up-animation'),300); } }
function upgradeReputation(){ if(gameState.reputationLevel>=30) return; let cost=calcRepCost(gameState.reputationLevel); if(spend(cost)){ gameState.reputationLevel++; gameState.autoValue+=gameState.reputationAutoGainIncrease; updateUI(); addChatMessage("🌟 声望", `声望提升至 ${gameState.reputationLevel} 自动收益+${gameState.reputationAutoGainIncrease}`, Level); repBtn.classList.add('reputation-up-animation'); setTimeout(()=>repBtn.classList.remove('reputation-up-animation'),400); } }

// ------------------- 事件系统 -------------------
let eventInterval=null; let eventEnabled=true;
function stopAllActiveEventsAndDisable() {
    stopAllActiveEvents();
    eventEnabled = false;
    document.getElementById('eventToggleBadge').innerText = "事件OFF";
    addChatMessage("⛔ 事件", "随机事件已停止", System);
    updateUI();
    if(eventInterval) clearInterval(eventInterval);
    eventInterval = null;
}
function stopAllActiveEvents() {
    gameState.activeBuffs = gameState.activeBuffs.filter(b => b.permanent === true);
    addChatMessage("☂ 事件", "所有临时事件效果已清除", System);
}
function startEventLoop(){ if(eventInterval) clearInterval(eventInterval); if(!eventEnabled) return; eventInterval=setInterval(()=>{ if(!eventEnabled) return; let r=Math.random(); if(r<0.38) triggerRandomEvent(); }, 43000); }
const eventList=[
    {name:"🍀 曲奇雨", effect:(cb)=>{ let gain=Math.floor(gameState.clickValue*15+500); gameState.cookies+=gain; addChatMessage("🌈事件","天降曲奇雨！ +"+gain.toLocaleString()+"曲奇",event_Lucky); if(cb)cb(); } },
    {name:"📈 烘焙灵感", effect:()=>{ let buffId=Date.now()+Math.random(); gameState.activeBuffs.push({id:buffId,target:'click',value:0.4,isMultiplier:true,expireTime:Date.now()+60000}); addChatMessage("✨事件","点击收益+40%持续60秒！",event_Lucky); setTimeout(()=>{ let idx=gameState.activeBuffs.findIndex(b=>b.id===buffId); if(idx!==-1) gameState.activeBuffs.splice(idx,1); addChatMessage("⏰提示","灵感消退，点击收益恢复",System); updateUI(); },60000); updateUI(); } },
    {name:"🔥 烤箱故障", effect:()=>{ let loss=Math.floor(gameState.cookies*0.12); loss=Math.min(loss,gameState.cookies*0.7); gameState.cookies=Math.max(0,gameState.cookies-loss); addChatMessage("💥事件","烤箱爆炸！损失 "+loss.toLocaleString()+"曲奇",event_Negative); updateUI(); } },
    {name:"👻 小偷光顾", effect:()=>{ let hasItem=gameState.inventory.filter(i=>i.count>0); if(hasItem.length){ let rand=hasItem[Math.floor(Math.random()*hasItem.length)]; let data=allShopItems.find(d=>d.id===rand.id); let stolenCount=Math.min(rand.count,1); rand.count-=stolenCount; if(rand.count<=0) gameState.inventory=gameState.inventory.filter(i=>i.id!==rand.id); calculateTotalBonus(); updateInventoryDisplay(); addChatMessage("👾事件",`${data.name} 被偷走了1个！`,event_Negative); } else{ addChatMessage("😌事件","小偷来了但背包空空，悻悻离去",System); } updateUI(); } },
    {name:"📉 酵母枯萎", effect:()=>{ let debuffId=Date.now()+Math.random(); gameState.activeBuffs.push({id:debuffId,target:'auto',value:-0.3,isMultiplier:true,expireTime:Date.now()+50000}); addChatMessage("🌧️事件","自动收益-30%持续50秒！",event_Negative); setTimeout(()=>{ let idx=gameState.activeBuffs.findIndex(b=>b.id===debuffId); if(idx!==-1) gameState.activeBuffs.splice(idx,1); addChatMessage("🍪提示","枯萎结束，自动收益恢复",System); updateUI(); },50000); updateUI(); } }
];
function triggerRandomEvent(){ let ev=eventList[Math.floor(Math.random()*eventList.length)]; ev.effect(); }
function forceEventById(id){ if(id>=0 && id<eventList.length) eventList[id].effect(); else addChatMessage("系统","无效事件ID",System); }

// 自动收益循环
setInterval(()=>{ let now=Date.now(); let diff=(now-gameState.lastUpdate)/1000; if(diff>=1){ let finalAuto=applyBuffValue(gameState.autoValue,'auto'); let add=Math.floor(diff*finalAuto); if(add>0){ gameState.cookies+=add; updateUI(); } gameState.lastUpdate=now; } },1000);

// ---------- 作弊指令 (修复attribute为永久，必须提供uuid) ----------
function parseNumberWithSuffix(str, floorResult=true){ 
    let match=str.match(/^([\d.]+)([kKmMgGtTpP]?)$/); 
    if(!match) return NaN; 
    let val=parseFloat(match[1]); 
    let suf=match[2].toLowerCase(); 
    if(suf==='k') val*=1e3; 
    else if(suf==='m') val*=1e6; 
    else if(suf==='g') val*=1e9; 
    else if(suf==='t') val*=1e12; 
    else if(suf==='p') val*=1e15; 
    if(floorResult) val = Math.floor(val);
    return val; 
}
function handleCommand(cmd){
    if(!isDev){ addChatMessage("🔒系统","作弊模式未开启 (isDev=false)",System); return; }
    let parts=cmd.trim().split(/\s+/); let main=parts[0];
    if(main==='/help'){ addChatMessage("指令表","/cookie set/add/remove <数量> /shop lock/unlock <层数> /level click/rep set/add/remove <数值> /good give/clear <商品ID> <数量> /event happen <0~4> /event stop /attribute click/auto add/mul <数值> <UUID> /attribute remove <UUID>",System); return; }
    if(main==='/cookie' && parts[1] && parts[2]){ let num=parseNumberWithSuffix(parts[2], true); if(isNaN(num)){ addChatMessage("错误","数量格式有误",System); return; } if(parts[1]==='add') gameState.cookies+=num; else if(parts[1]==='set') gameState.cookies=num; else if(parts[1]==='remove') gameState.cookies=Math.max(0,gameState.cookies-num); else return; updateUI(); addChatMessage("指令","曲奇已修改",System); }
    else if(main==='/shop' && parts[1] && parts[2]){ let level=parseInt(parts[2]); if(parts[1]==='unlock'){ if(level>=1 && level<=3) gameState.shopRowsUnlocked=level; renderShop(); addChatMessage("指令",`商店解锁至第${level}排`,System); } else if(parts[1]==='lock'){ if(level>=1) gameState.shopRowsUnlocked=Math.max(1,level-1); renderShop(); addChatMessage("指令","商店行锁定",System); } }
    else if(main==='/level' && parts[2] && parts[3]){ let val = parseNumberWithSuffix(parts[3], true); if(isNaN(val)) return; if(parts[1]==='click'){ if(parts[2]==='set') gameState.upgradeLevel=Math.max(0,val); else if(parts[2]==='add') gameState.upgradeLevel+=val; else if(parts[2]==='remove') gameState.upgradeLevel=Math.max(0,gameState.upgradeLevel-val); gameState.clickValue=5+gameState.upgradeLevel*gameState.upgradeValueIncrease; checkUnlockSlotByLevel(); updateUI(); } else if(parts[1]==='rep'){ if(parts[2]==='set') gameState.reputationLevel=Math.min(30,val); else if(parts[2]==='add') gameState.reputationLevel=Math.min(30,gameState.reputationLevel+val); else if(parts[2]==='remove') gameState.reputationLevel=Math.max(0,gameState.reputationLevel-val); gameState.autoValue=1+gameState.reputationLevel*gameState.reputationAutoGainIncrease; updateUI(); } addChatMessage("指令","等级调整完成",System); }
    else if(main==='/good' && parts[1] && parts[2]){ let id=parseInt(parts[2]); let count=parts[3]?parseInt(parts[3]):1; let item=allShopItems.find(i=>i.id===id); if(!item){ addChatMessage("错误","无效商品ID",System); return; } if(parts[1]==='give'){ for(let c=0;c<count;c++){ let exist=gameState.inventory.find(i=>i.id===id); if(exist && exist.count<item.maxStack) exist.count++; else if(!exist && gameState.inventory.length<gameState.inventorySlots) gameState.inventory.push({id:id,count:1}); else { addChatMessage("警告","背包已满/达到堆叠上限",System); break; } } calculateTotalBonus(); updateInventoryDisplay(); updateUI(); addChatMessage("指令",`给予 ${item.name} x${count}`,System); } else if(parts[1]==='clear'){ gameState.inventory=gameState.inventory.filter(i=>i.id!==id); calculateTotalBonus(); updateInventoryDisplay(); updateUI(); addChatMessage("指令",`清除所有 ${item.name}`,System); } }
    else if(main==='/event' && parts[1]){ 
        if(parts[1]==='happen' && parts[2]){ let eid=parseInt(parts[2]); if(eid>=0 && eid<eventList.length) forceEventById(eid); else addChatMessage("事件","ID范围0-4",System); } 
        else if(parts[1]==='stop'){ stopAllActiveEventsAndDisable(); } 
        else if(parts[1]==='clear'){ stopAllActiveEvents(); }
    }
    else if(main==='/attribute' && parts[1]){
        if(parts[1]==='remove' && parts[2]){
            let uid = parts[2];
            let idx = gameState.activeBuffs.findIndex(b => b.id === uid);
            if(idx !== -1){
                gameState.activeBuffs.splice(idx,1);
                updateUI();
                addChatMessage("属性",`已移除永久属性 UUID: ${uid}`,System);
            } else addChatMessage("错误","未找到该UUID的永久属性",System);
        }
        else if((parts[1]==='click' || parts[1]==='auto') && (parts[2]==='add' || parts[2]==='mul') && parts[3] && parts[4]){
            let target = parts[1];
            let op = parts[2];
            let numRaw = parseFloat(parts[3]);
            if(isNaN(numRaw)){ addChatMessage("错误","数值无效",System); return; }
            let uuid = parts[4];
            if(gameState.activeBuffs.some(b=>b.id===uuid)){ addChatMessage("错误","UUID已存在，请使用不重复的UUID",System); return; }
            let isMultiplier = (op === 'mul');
            let value = numRaw;
            gameState.activeBuffs.push({
                id: uuid,
                target: target,
                value: value,
                isMultiplier: isMultiplier,
                permanent: true
            });
            addChatMessage("属性",`添加永久${target==='click'?'点击':'自动'}收益${isMultiplier?'倍率':''} ${value} (UUID: ${uuid})`,System);
            updateUI();
        }
        else addChatMessage("错误","格式: /attribute click/auto add/mul <数值> <UUID>  或 /attribute remove <UUID>",System);
    }
    else addChatMessage("指令","未知命令 /help 查看",System);
    updateUI();
}

function sendMsg(){ let txt=chatInput.value.trim(); if(!txt) return; if(txt.startsWith('/')) handleCommand(txt); else addChatMessage("👤 玩家", txt, Player); chatInput.value=''; }
sendBtn.addEventListener('click',sendMsg); chatInput.addEventListener('keypress',(e)=>e.key==='Enter'&&sendMsg());

startEventLoop();
window.onload=()=>{ calculateTotalBonus(); updateUI(); renderShop(); updateInventoryDisplay(); };
upgradeBtn.addEventListener('click',upgradeClick); repBtn.addEventListener('click',upgradeReputation);
cookieBtn.addEventListener('click',(e)=>gainCookies(gameState.clickValue+gameState.totalItemBonus,e));
document.getElementById('shopButton')?.addEventListener('click',()=>{ if(gameState.shopUnlocked){ renderShop(); shopModal.classList.remove('hidden'); } });
document.getElementById('inventoryButton')?.addEventListener('click',()=>{ if(gameState.inventoryUnlocked){ updateInventoryDisplay(); invModal.classList.remove('hidden'); } });
closeShop.onclick=()=>shopModal.classList.add('hidden'); closeInv.onclick=()=>invModal.classList.add('hidden');
window.onclick=(e)=>{ if(e.target===shopModal) shopModal.classList.add('hidden'); if(e.target===invModal) invModal.classList.add('hidden'); };
updateUI();