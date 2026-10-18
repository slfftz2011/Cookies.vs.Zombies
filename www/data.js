// [模块 1] 基础状态与常量数据

const _internalState = {
    cookies: 500,
    clickValue: 5, autoValue: 1, lastUpdate: Date.now(),
    upgradeLevel: 0, baseUpgradeCost: 8, upgradeCostMultiplier: 1.4, upgradeValueIncrease: 2,
    reputationLevel: 0, maxReputationWithoutNewCurrency: 30, baseReputationCost: 1600, reputationCostMultiplier: 1.95, reputationAutoGainIncrease: 2,
    shopUnlocked: false, shopRowsUnlocked: 1, itemsPerRow: 8,
    inventoryUnlocked: false, inventorySlots: 4, maxInventorySlots: 104, slotUnlockLevel: 10, slotUnlockInterval: 5,
    inventory: [], totalItemBonus: 0,
    activeBuffs: [],
    cheatFlag: false 
};

// 【核心防御】：拦截所有敏感数值的直接修改
const sensitiveKeys = ['cookies', 'clickValue', 'autoValue', 'upgradeLevel', 'reputationLevel', 'totalItemBonus'];

const gameState = new Proxy(_internalState, {
    get(target, prop) {
        return target[prop]; 
    },
    set(target, prop, value) {
        if (sensitiveKeys.includes(prop)) {
            console.warn(`🚨 检测到非法直接篡改核心数据: ${prop} = ${value}`);
            target.cheatFlag = true;
            return false; // 拒绝赋值
        }
        target[prop] = value;
        return true;
    }
});

// 【唯一合法接口】：加减数值（必须指定合法来源）
function modifyState(key, amount, source) {
    const validSources = ['click', 'auto', 'shop', 'event', 'command', 'decompose', 'upgrade'];
    if (!validSources.includes(source)) {
        console.warn(`🚨 异常数据来源：${source}`);
        _internalState.cheatFlag = true;
        return false;
    }
    
    // 允许通过接口修改被 Proxy 拦截的数值
    if (sensitiveKeys.includes(key)) {
        _internalState[key] += amount;
        return true;
    }
    return false;
}

// 专门用于覆盖赋值（如设置等级、设置总加成）
function setState(key, value, source) {
    const validSources = ['init', 'command', 'system'];
    if (!validSources.includes(source)) {
        _internalState.cheatFlag = true;
        return false;
    }
    _internalState[key] = value;
    return true;
}

// 处理背包数组的安全推入
function pushInventory(item, source) {
    if (source !== 'shop' && source !== 'command') {
        _internalState.cheatFlag = true;
        return false;
    }
    _internalState.inventory.push(item);
    return true;
}

const shopItemsData = [
    [{id:1,name:"曲奇戒指",price:480,bonus:1,maxStack:5,icon:"fa-diamond",desc:"一枚刻有曲奇图案的戒指，小幅提升点击收益"},{id:2,name:"烘焙手套",price:1150,bonus:3,maxStack:5,icon:"fa-hand-paper-o",desc:"提高点击效率的专业手套"},{id:3,name:"幸运曲奇",price:2400,bonus:5,maxStack:5,icon:"fa-cookie",desc:"带来好运的特殊曲奇"},{id:4,name:"黄金搅拌器",price:4300,bonus:8,maxStack:5,icon:"fa-wrench",desc:"闪闪发光的黄金搅拌器"},{id:5,name:"曲奇护身符",price:7200,bonus:12,maxStack:5,icon:"fa-shield",desc:"保佑获得更多曲奇"},{id:6,name:"烘焙大师徽章",price:11500,bonus:18,maxStack:5,icon:"fa-trophy",desc:"证明烘焙技巧的徽章"},{id:7,name:"巧克力抹刀",price:19500,bonus:25,maxStack:5,icon:"fa-cutlery",desc:"涂满巧克力的专业抹刀"},{id:8,name:"魔法烤箱手套",price:34000,bonus:35,maxStack:5,icon:"fa-fire",desc:"带有魔力的烤箱手套，解锁下一排物品"}],
    [{id:9,name:"曲奇精灵",price:59000,bonus:50,maxStack:5,icon:"fa-magic",desc:"帮助收集曲奇的小精灵"},{id:10,name:"皇家糖霜刷",price:98000,bonus:75,maxStack:5,icon:"fa-paint-brush",desc:"皇室专用的糖霜刷"},{id:11,name:"钻石糖粒",price:155000,bonus:100,maxStack:5,icon:"fa-gem",desc:"闪闪发光的钻石糖粒"},{id:12,name:"秘方卷轴",price:245000,bonus:150,maxStack:5,icon:"fa-book",desc:"记载古老曲奇秘方"},{id:13,name:"神性黄油",price:390000,bonus:220,maxStack:5,icon:"fa-leaf",desc:"带有神圣气息的黄油"},{id:14,name:"天堂面粉袋",price:630000,bonus:300,maxStack:5,icon:"fa-shopping-basket",desc:"来自天堂的特制面粉"},{id:15,name:"传奇擀面杖",price:980000,bonus:400,maxStack:5,icon:"fa-hammer",desc:"传说中的擀面杖"},{id:16,name:"烘焙神谕",price:1750000,bonus:600,maxStack:5,icon:"fa-lightbulb-o",desc:"烘焙之神的启示，解锁下一排"}],
    [{id:17,name:"曲奇神祇化身",price:2900000,bonus:900,maxStack:5,icon:"fa-star",desc:"曲奇之神的祝福"},{id:18,name:"宇宙面团",price:4900000,bonus:1300,maxStack:5,icon:"fa-globe",desc:"来自宇宙的神秘面团"},{id:19,name:"时间糖霜",price:8200000,bonus:2000,maxStack:5,icon:"fa-hourglass-half",desc:"扭曲时间的糖霜"},{id:20,name:"维度烤盘",price:13500000,bonus:3000,maxStack:5,icon:"fa-cube",desc:"跨越维度的烤盘"},{id:21,name:"永恒酵母",price:24500000,bonus:4500,maxStack:5,icon:"fa-bolt",desc:"永不失效的神奇酵母"},{id:22,name:"创造之巧克力",price:39000000,bonus:6500,maxStack:5,icon:"fa-moon-o",desc:"创世之力巧克力"},{id:23,name:"绝对曲奇理论",price:68000000,bonus:9500,maxStack:5,icon:"fa-flask",desc:"解释曲奇本质的理论"},{id:24,name:"曲奇奇点",price:118000000,bonus:15000,maxStack:5,icon:"fa-black-tie",desc:"曲奇的终极形态，解锁下一排"}]
];
const allShopItems = shopItemsData.flat();

const System = {a:'text-purple-700 bg-purple-50', b:'border-l-4 border-purple-400', c:'text-purple-600'};
const Player = {a:'text-gray-800', b:'', c:''};
const Level = {a:'text-green-800 bg-green-50', b:'border-l-4 border-green-400', c:''};
const event_Lucky = {a:'text-blue-800 bg-blue-50', b:'border-l-4 border-blue-400', c:''};
const event_Negative = {a:'text-red-800 bg-red-50', b:'border-l-4 border-red-400', c:''};