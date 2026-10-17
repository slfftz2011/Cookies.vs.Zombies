// [模块 7] 入口启动、存档与事件绑定

// 1. 聊天发送拦截（安全判断 dev.js 是否存在）
function sendMsg() { 
    let txt = chatInput.value.trim(); 
    if(!txt) return; 
    
    if(txt.startsWith('/')) {
        // 只要有 commands.js，就交给它处理；里面会自己判断 isDev 有没有开启
        if (typeof handleCommand === 'function') {
            handleCommand(txt);
        } else {
            addChatMessage("系统", "指令系统未安装", System);
        }
    } else {
        addChatMessage("👤 玩家", txt, Player); 
    }
    chatInput.value = ''; 
}
sendBtn.addEventListener('click', sendMsg); 
chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMsg());
upgradeBtn.addEventListener('click', upgradeClick); 
repBtn.addEventListener('click', upgradeReputation);

// 2. 大曲奇点击支持
let cookieClickHandled = false;
cookieBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!cookieClickHandled) {
        cookieClickHandled = true; gainCookies(gameState.clickValue + gameState.totalItemBonus, e);
        setTimeout(() => { cookieClickHandled = false; }, 100);
    }
});
cookieBtn.addEventListener('click', function(e) {
    if (!cookieClickHandled) gainCookies(gameState.clickValue + gameState.totalItemBonus, e);
});

// 3. 移动端 FAB 逻辑
const mqCoarse = window.matchMedia('(hover: none) and (pointer: coarse)');
const uaMobileRe = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i;
const isCapacitorNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const isMobileDevice = () => isCapacitorNative() || mqCoarse.matches || uaMobileRe.test(navigator.userAgent);

let chatFabEl, chatFabBadgeEl, mobileToastBoxEl, chatPanelEl;
let mobileChatOpen = false, mobileUnread = 0, mobileSelfSendGuard = 0;

function showMobileChatToast(text) {
    if (!mobileToastBoxEl) return;
    const el = document.createElement('div'); el.className = 'mobile-toast';
    el.textContent = text.length > 60 ? text.slice(0, 60) + '…' : text;
    mobileToastBoxEl.appendChild(el);
    while (mobileToastBoxEl.children.length > 3) mobileToastBoxEl.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 2400);
}

function setupMobileChat() {
    if (chatFabEl) return;
    chatFabEl = document.getElementById('chatFab');
    chatFabBadgeEl = document.getElementById('chatFabBadge');
    mobileToastBoxEl = document.getElementById('mobileToastBox');
    chatPanelEl = document.getElementById('chatPanel');
    if (!chatFabEl || !chatPanelEl) return;

    chatFabEl.addEventListener('click', () => {
        mobileChatOpen = !mobileChatOpen;
        chatPanelEl.classList.toggle('open', mobileChatOpen);
        if (mobileChatOpen) { mobileUnread = 0; chatFabBadgeEl.hidden = true; chatFabBadgeEl.textContent = '0'; chatDiv.scrollTop = chatDiv.scrollHeight; }
    });

    sendBtn.addEventListener('click', () => { mobileSelfSendGuard = Date.now() + 400; }, true);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') mobileSelfSendGuard = Date.now() + 400; }, true);

    new MutationObserver((muts) => {
        if (Date.now() < mobileSelfSendGuard || mobileChatOpen) return;
        muts.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            const txt = (n.textContent || '').trim(); if (txt) showMobileChatToast(txt);
        }));
        mobileUnread++; chatFabBadgeEl.textContent = mobileUnread > 99 ? '99+' : mobileUnread; chatFabBadgeEl.hidden = false;
    }).observe(chatDiv, { childList: true });
}

function applyMobileMode() {
    const mobile = isMobileDevice();
    document.body.classList.toggle('is-mobile', mobile);
    if (mobile) setupMobileChat();
    else {
        if (chatPanelEl) chatPanelEl.classList.remove('open');
        if (mobileToastBoxEl) mobileToastBoxEl.replaceChildren();
        if (chatFabBadgeEl) chatFabBadgeEl.hidden = true;
        mobileChatOpen = false; mobileUnread = 0;
    }
}
applyMobileMode();
(mqCoarse.addEventListener || mqCoarse.addListener).call(mqCoarse, 'change', applyMobileMode);
window.addEventListener('orientationchange', () => setTimeout(applyMobileMode, 200));

// 4. 移动端 Tooltip 重写
const originalBind = bindTooltip;
bindTooltip = function(el, title, desc, bonus, priceInfo, stackInfo) {
    const tooltipContent = `<strong>${title}</strong><br>${desc}<br>✨ 点击收益 +${bonus}<br>💰 ${priceInfo}<br>📦 ${stackInfo}`;
    if (isMobileDevice()) { 
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            if (activeTooltip && activeTooltip._triggerEl === el) hideGlobalTooltip();
            else { showGlobalTooltip(tooltipContent, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY); if (activeTooltip) activeTooltip._triggerEl = el; }
        });
        document.addEventListener('click', function(e) { if (activeTooltip && !activeTooltip.contains(e.target) && e.target !== el) hideGlobalTooltip(); });
    } else {
        el.addEventListener('mouseenter', (e) => showGlobalTooltip(tooltipContent, e.clientX, e.clientY));
        el.addEventListener('mousemove', (e) => {
            if (activeTooltip) {
                let rect = activeTooltip.getBoundingClientRect(), left = e.clientX + 15, top = e.clientY - rect.height - 8;
                if (top < 10) top = e.clientY + 20;
                if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
                activeTooltip.style.left = left + 'px'; activeTooltip.style.top = top + 'px';
            }
        });
        el.addEventListener('mouseleave', hideGlobalTooltip);
    }
};

// 5. 存档读写
const CapacitorPlugins = window.Capacitor?.Plugins || {};
const Preferences = CapacitorPlugins.Preferences || { get: async ({ key }) => ({ value: localStorage.getItem(key) }), set: async ({ key, value }) => localStorage.setItem(key, value), remove: async ({ key }) => localStorage.removeItem(key) };
const App = window.Capacitor?.Plugins?.App || null;
const SAVE_KEY = 'cvz_save';

async function loadGame() {
    const { value } = await Preferences.get({ key: SAVE_KEY});
    if(value) { try { Object.assign(gameState, JSON.parse(value)); } catch (e) { console.warn('存档失败', e); } }
}
async function saveGame() { await Preferences.set({ key: SAVE_KEY, value: JSON.stringify(gameState) }); }
if (App && typeof App.addListener === 'function') App.addListener('pause', () => saveGame());

// 6. 统一初始化与 UI 绑定
window.addEventListener('load', async () => {
    await loadGame(); calculateTotalBonus(); updateUI();
    
    shopContainer    = document.getElementById('shopItemsContainer');
    invGridContainer = document.getElementById('inventoryGridContainer');
    shopModal        = document.getElementById('shopModal');
    invModal         = document.getElementById('inventoryModal');
    const shopBtn    = document.getElementById('shopButton'), invBtn = document.getElementById('inventoryButton');
    const closeShop  = document.getElementById('closeShopButton'), closeInv = document.getElementById('closeInventoryButton');

    renderShop(); updateInventoryDisplay();

    if (shopBtn && shopModal) shopBtn.addEventListener('click', () => { if (!gameState.shopUnlocked) return showToast("商店尚未解锁", true); renderShop(); shopModal.classList.remove('hidden'); });
    if (invBtn && invModal) invBtn.addEventListener('click', () => { if (!gameState.inventoryUnlocked) return showToast("背包尚未解锁", true); updateInventoryDisplay(); invModal.classList.remove('hidden'); });
    if (closeShop && shopModal) closeShop.addEventListener('click', () => shopModal.classList.add('hidden'));
    if (closeInv && invModal) closeInv.addEventListener('click', () => invModal.classList.add('hidden'));
    [shopModal, invModal].forEach(modal => { if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); }); });

    startEventLoop();
    setInterval(saveGame, 15000);
    window.addEventListener('beforeunload', saveGame);
});