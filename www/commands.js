// [模块 6] 作弊指令代码 (正式版可删掉此文件)
function syncLastUpdate() { gameState.lastUpdate = Date.now(); }

function handleCommand(cmd) {
    // 核心安全判断：如果 isDev 没定义，或者定义为 false，直接拦截
    if (typeof isDev === 'undefined' || !isDev) {
        addChatMessage("🔒系统", "作弊模式未开启", System);
        return;
    }

    const parts = cmd.trim().split(/\s+/);
    const main = parts[0];

    if (main === '/help') {
        addChatMessage("指令表", "/cookie set/add/remove <数量> | /shop lock/unlock <层数> | /level click/rep set/add/remove <数值> | /good give/clear <商品ID> <数量> | /event happen <0~4> /event stop /event start /event clear | /attribute click/auto add/mul <数值> <UUID> /attribute remove <UUID>", System);
        return;
    }
    if (main === '/cookie' && parts[1] && parts[2]) {
        const num = parseNumberWithSuffix(parts[2], true);
        if (isNaN(num)) { addChatMessage("错误", "数量格式有误", System); return; }
        if (parts[1] === 'add') { gameState.cookies += num; addChatMessage("指令", `曲奇增加 ${formatNumber(num)}`, System); }
        else if (parts[1] === 'set') { gameState.cookies = num; addChatMessage("指令", `曲奇设为 ${formatNumber(gameState.cookies)}`, System); }
        else if (parts[1] === 'remove') { gameState.cookies = Math.max(0, gameState.cookies - num); addChatMessage("指令", `曲奇减少 ${formatNumber(num)}`, System); }
        else { addChatMessage("错误", "用法错误", System); return; }
        syncLastUpdate(); updateUI(); return;
    }
    if (main === '/shop' && parts[1] && parts[2]) {
        const level = parseInt(parts[2]);
        if (isNaN(level) || level < 1) { addChatMessage("错误", "层数必须正整数", System); return; }
        if (parts[1] === 'unlock') { gameState.shopRowsUnlocked = Math.min(level, shopItemsData.length); renderShop(); addChatMessage("指令", `解锁至第 ${gameState.shopRowsUnlocked} 排`, System); }
        else if (parts[1] === 'lock') { gameState.shopRowsUnlocked = Math.max(1, level - 1); renderShop(); addChatMessage("指令", `锁定至第 ${gameState.shopRowsUnlocked} 排`, System); }
        else { addChatMessage("错误", "用法错误", System); }
        return;
    }
    if (main === '/level' && parts[2] && parts[3]) {
        const val = parseNumberWithSuffix(parts[3], true);
        if (isNaN(val)) { addChatMessage("错误", "数值格式有误", System); return; }
        if (parts[1] === 'click') {
            if (parts[2] === 'set') gameState.upgradeLevel = Math.max(0, val);
            else if (parts[2] === 'add') gameState.upgradeLevel += val;
            else if (parts[2] === 'remove') gameState.upgradeLevel = Math.max(0, gameState.upgradeLevel - val);
            else { addChatMessage("错误", "操作错误", System); return; }
            gameState.clickValue = 5 + gameState.upgradeLevel * gameState.upgradeValueIncrease;
            checkUnlockSlotByLevel(); addChatMessage("指令", `点击等级调整为 ${gameState.upgradeLevel}`, System);
        } else if (parts[1] === 'rep') {
            if (parts[2] === 'set') gameState.reputationLevel = Math.min(30, Math.max(0, val));
            else if (parts[2] === 'add') gameState.reputationLevel = Math.min(30, gameState.reputationLevel + val);
            else if (parts[2] === 'remove') gameState.reputationLevel = Math.max(0, gameState.reputationLevel - val);
            else { addChatMessage("错误", "操作错误", System); return; }
            gameState.autoValue = 1 + gameState.reputationLevel * gameState.reputationAutoGainIncrease;
            addChatMessage("指令", `声望等级调整为 ${gameState.reputationLevel}`, System);
        } else { addChatMessage("错误", "用法错误", System); return; }
        syncLastUpdate(); updateUI(); return;
    }
    if (main === '/good' && parts[1] && parts[2]) {
        const id = parseInt(parts[2]), item = allShopItems.find(i => i.id === id);
        if (!item) { addChatMessage("错误", `未找到商品`, System); return; }
        if (parts[1] === 'give') {
            let count = parts[3] ? parseInt(parts[3]) : 1, given = 0;
            for (let c = 0; c < count; c++) {
                const exist = gameState.inventory.find(i => i.id === id);
                if (exist && exist.count < item.maxStack) { exist.count++; given++; }
                else if (!exist && gameState.inventory.length < gameState.inventorySlots) { gameState.inventory.push({ id: id, count: 1 }); given++; }
                else break;
            }
            calculateTotalBonus(); updateInventoryDisplay(); syncLastUpdate(); updateUI(); addChatMessage("指令", `给予 ${item.name} x${given}`, System);
        } else if (parts[1] === 'clear') {
            gameState.inventory = gameState.inventory.filter(i => i.id !== id);
            calculateTotalBonus(); updateInventoryDisplay(); syncLastUpdate(); updateUI(); addChatMessage("指令", `清除 ${item.name}`, System);
        } else { addChatMessage("错误", "用法错误", System); }
        return;
    }
    if (main === '/event' && parts[1]) {
        if (parts[1] === 'happen' && parts[2]) {
            const eid = parseInt(parts[2]);
            if (!isNaN(eid) && eid >= 0 && eid < eventList.length) forceEventById(eid);
            else addChatMessage("事件", "ID范围 0-4", System);
        } else if (parts[1] === 'stop') { stopAllActiveEventsAndDisable(); }
        else if (parts[1] === 'start') {
            if (!eventEnabled) { eventEnabled = true; startEventLoop(); document.getElementById('eventToggleBadge').innerText = "事件ON"; addChatMessage("🌤️ 事件", "已重新开启", System); }
            else { addChatMessage("事件", "已在运行中", System); }
        } else if (parts[1] === 'clear') { stopAllActiveEvents(); }
        else { addChatMessage("错误", "用法错误", System); }
        return;
    }
    if (main === '/attribute' && parts[1]) {
        if (parts[1] === 'remove' && parts[2]) {
            const idx = gameState.activeBuffs.findIndex(b => b.id === parts[2]);
            if (idx !== -1) { gameState.activeBuffs.splice(idx, 1); updateUI(); addChatMessage("属性", `已移除 UUID: ${parts[2]}`, System); }
            else { addChatMessage("错误", "未找到该 UUID", System); }
            return;
        }
        if ((parts[1] === 'click' || parts[1] === 'auto') && (parts[2] === 'add' || parts[2] === 'mul') && parts[3] && parts[4]) {
            const numRaw = parseFloat(parts[3]);
            if (isNaN(numRaw)) { addChatMessage("错误", "数值无效", System); return; }
            if (gameState.activeBuffs.some(b => b.id === parts[4])) { addChatMessage("错误", "UUID 已存在", System); return; }
            gameState.activeBuffs.push({ id: parts[4], target: parts[1], value: numRaw, isMultiplier: (parts[2] === 'mul'), permanent: true });
            addChatMessage("属性", `添加永久收益 ${numRaw}`, System);
            updateUI(); return;
        }
        addChatMessage("错误", "格式错误", System); return;
    }
    addChatMessage("指令", "未知命令，输入 /help 查看", System);
}