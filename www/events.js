// [模块 4] 随机事件与自动收益循环

let eventInterval=null; let eventEnabled=true;
function stopAllActiveEventsAndDisable() {
    stopAllActiveEvents(); eventEnabled = false; document.getElementById('eventToggleBadge').innerText = "事件OFF";
    addChatMessage("⛔ 事件", "随机事件已停止", System); updateUI();
    if(eventInterval) clearInterval(eventInterval); eventInterval = null;
}
function stopAllActiveEvents() { gameState.activeBuffs = gameState.activeBuffs.filter(b => b.permanent === true); addChatMessage("☂ 事件", "所有临时事件效果已清除", System); }
function startEventLoop(){ if(eventInterval) clearInterval(eventInterval); if(!eventEnabled) return; eventInterval=setInterval(()=>{ if(!eventEnabled) return; let r=Math.random(); if(r<0.38) triggerRandomEvent(); }, 43000); }

const eventList=[
    {name:"🍀 曲奇雨", effect:(cb)=>{ let gain=Math.floor(gameState.clickValue*15+500); gameState.cookies+=gain; addChatMessage("🌈事件","天降曲奇雨！ +"+formatNumber(gain)+"曲奇",event_Lucky); if(cb)cb(); } },
    {name:"📈 烘焙灵感", effect:()=>{ let buffId=Date.now()+Math.random(); gameState.activeBuffs.push({id:buffId,target:'click',value:0.4,isMultiplier:true,expireTime:Date.now()+60000}); addChatMessage("✨事件","点击收益+40%持续60秒！",event_Lucky); setTimeout(()=>{ let idx=gameState.activeBuffs.findIndex(b=>b.id===buffId); if(idx!==-1) gameState.activeBuffs.splice(idx,1); addChatMessage("⏰提示","灵感消退",System); updateUI(); },60000); updateUI(); } },
    {name:"🔥 烤箱故障", effect:()=>{ let loss=Math.floor(gameState.cookies*0.12); loss=Math.min(loss,gameState.cookies*0.7); gameState.cookies=Math.max(0,gameState.cookies-loss); addChatMessage("💥事件","烤箱爆炸！损失 "+formatNumber(loss)+"曲奇",event_Negative); updateUI(); } },
    {name:"👻 小偷光顾", effect:()=>{ let hasItem=gameState.inventory.filter(i=>i.count>0); if(hasItem.length){ let rand=hasItem[Math.floor(Math.random()*hasItem.length)]; let data=allShopItems.find(d=>d.id===rand.id); let stolenCount=Math.min(rand.count,1); rand.count-=stolenCount; if(rand.count<=0) gameState.inventory=gameState.inventory.filter(i=>i.id!==rand.id); calculateTotalBonus(); updateInventoryDisplay(); addChatMessage("👾事件",`${data.name} 被偷走了1个！`,event_Negative); } else{ addChatMessage("😌事件","小偷来了但背包空空",System); } updateUI(); } },
    {name:"📉 酵母枯萎", effect:()=>{ let debuffId=Date.now()+Math.random(); gameState.activeBuffs.push({id:debuffId,target:'auto',value:-0.3,isMultiplier:true,expireTime:Date.now()+50000}); addChatMessage("🌧️事件","自动收益-30%持续50秒！",event_Negative); setTimeout(()=>{ let idx=gameState.activeBuffs.findIndex(b=>b.id===debuffId); if(idx!==-1) gameState.activeBuffs.splice(idx,1); addChatMessage("🍪提示","枯萎结束",System); updateUI(); },50000); updateUI(); } }
];
function triggerRandomEvent(){ let ev=eventList[Math.floor(Math.random()*eventList.length)]; ev.effect(); }
function forceEventById(id){ if(id>=0 && id<eventList.length) eventList[id].effect(); else addChatMessage("系统","无效事件ID",System); }

// 自动收益循环（每秒检查）
setInterval(()=>{ 
    let now=Date.now(), diff=(now-gameState.lastUpdate)/1000; 
    if(diff>=1){ 
        let add=Math.floor(diff*applyBuffValue(gameState.autoValue,'auto')); 
        if(add>0){ gameState.cookies+=add; updateUI(); } 
        gameState.lastUpdate=now; 
    } 
},1000);