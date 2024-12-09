/**
 * 提交步数到小米运动服务器
 * 获取表单数据并发送到API
 */
async function submitSteps() {
    // 获取表单输入值
    const username = document.getElementById('xiaomi-username').value;
    const password = document.getElementById('xiaomi-password').value;
    const steps = document.getElementById('step-count').value;
    const resultMessage = document.getElementById('result-message');

    // 验证表单数据
    if (!username || !password || !steps) {
        resultMessage.textContent = '请填写账号';
        return;
    }

    try {
        // 显示提交状态
        resultMessage.textContent = '提交中...';
        
        // 构建API请求URL
        const url = `https://steps.api.030101.xyz/api?account=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&steps=${encodeURIComponent(steps)}`;
        
        // 发送请求到API
        const response = await fetch(url);
        const data = await response.json();
        
        // 处理响应结果
        if (data.status === 'error') {
            // 处理错误情况
            if (data.message.includes('密码错误')) {
                resultMessage.textContent = '密码错误，请检查后重试';
            } else {
                resultMessage.textContent = data.message || '提交失败';
            }
            console.error('步数更新失败:', data.message);
        } else {
            // 成功情况
            resultMessage.textContent = '步数修改成功！';
            console.log('步数更新成功:', data);
        }
    } catch (error) {
        // 错误处理
        resultMessage.textContent = '是否提交成功请检查微信步数变化';
        console.error('请求失败:', error);
    }
}

// 显示托管弹窗
function toggleAutoManage() {
    console.log('点击托管按钮');
    const modal = document.getElementById('manage-modal');
    if (!modal) {
        console.error('找不到托管弹窗元素');
        return;
    }
    console.log('显示托管弹窗');
    modal.classList.add('show');
}

// 关闭托管弹窗
function closeManageModal() {
    const modal = document.getElementById('manage-modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    document.getElementById('manage-username').value = '';
    document.getElementById('manage-password').value = '';
}

// 保存托管账号列表
function saveAccount(username, password) {
    // 获取现有账号列表
    let accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    
    // 检查是否已存在该账号
    if (!accounts.find(acc => acc.username === username)) {
        accounts.push({
            username: username,
            password: password,
            executeTime: '08:40',
            minSteps: '10000',
            maxSteps: '20000',
            lastRunTime: new Date().toISOString()
        });
        
        // 保存更新后的账号列表
        localStorage.setItem('managedAccounts', JSON.stringify(accounts));
        return true;
    }
    return false;
}

// 提交托管
async function submitManage() {
    const username = document.getElementById('manage-username').value;
    const password = document.getElementById('manage-password').value;
    
    if (!username || !password) {
        alert('请输入账号和密码');
        return;
    }
    
    if (saveAccount(username, password)) {
        // 切换到管理界面
        document.getElementById('steps-panel').style.display = 'none';
        document.getElementById('manage-panel').style.display = 'block';
        document.getElementById('page-title').textContent = '账号管理';
        
        // 更新账号列表显示
        updateAccountsList();
        
        closeManageModal();
        
        // 立即执行一次自动提交
        autoSubmitSteps(username, password);
    } else {
        alert('该账号已存在');
    }
}

// 自动提交步数（每天定时执行）
async function autoSubmitSteps(username, password) {
    const defaultSteps = '20000'; // 默认步数
    
    try {
        const url = `https://steps.api.030101.xyz/api?account=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&steps=${defaultSteps}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'error') {
            localStorage.setItem('lastRunTime', new Date().toISOString());
            updateManageInfo(username);
        } else {
            console.error('自动提交失败:', data.message);
        }
    } catch (error) {
        console.error('自动提交请求失败:', error);
    }
}

// 检查是否需要自动提交
function checkAutoSubmit(account) {
    const lastRunTime = account.lastRunTime;
    if (!lastRunTime) return;
    
    const lastRun = new Date(lastRunTime);
    const now = new Date();
    
    if (lastRun.getDate() !== now.getDate() || 
        lastRun.getMonth() !== now.getMonth() || 
        lastRun.getFullYear() !== now.getFullYear()) {
        autoSubmitSteps(account.username, account.password);
    }
}

// 更新管理界面信息
function updateManageInfo(username) {
    document.getElementById('manage-account-name').textContent = username;
    
    // 显示保存的设置
    const savedTime = localStorage.getItem('executeTime') || '08:40';
    const lastRunTime = localStorage.getItem('lastRunTime');
    
    document.getElementById('manage-lastrun').textContent = lastRunTime ? 
        new Date(lastRunTime).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }) : '未执行';
}

// 更新账号
function updateAccount() {
    toggleAutoManage();
}

// 删除账号
function deleteAccount(username) {
    if (confirm('确定要删除此账号吗？')) {
        let accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
        accounts = accounts.filter(acc => acc.username !== username);
        localStorage.setItem('managedAccounts', JSON.stringify(accounts));
        
        if (accounts.length === 0) {
            // 如果没有账号了，返回到刷步界面
            document.getElementById('steps-panel').style.display = 'block';
            document.getElementById('manage-panel').style.display = 'none';
            document.getElementById('page-title').textContent = '小米运动刷步';
        } else {
            // 更新账号列表显示
            updateAccountsList();
        }
    }
}

// 页面加载时检查是否有托管账号并执行自动提交检查
document.addEventListener('DOMContentLoaded', () => {
    const accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    if (accounts.length > 0) {
        document.getElementById('steps-panel').style.display = 'none';
        document.getElementById('manage-panel').style.display = 'block';
        document.getElementById('page-title').textContent = '账号管理';
        updateAccountsList();
        
        // 为每个账号检查和设置定时任务
        accounts.forEach(account => {
            checkAutoSubmit(account);
            scheduleNextExecution(account);
        });
    }
});

// 显示时间设置弹窗
function showTimeSettings() {
    const modal = document.getElementById('time-modal');
    modal.classList.add('show');
}

// 显示步数区间设置弹窗
function showStepsRange() {
    const modal = document.getElementById('range-modal');
    modal.classList.add('show');
}

// 保存时间设置
function saveTimeSettings() {
    const time = document.getElementById('execute-time').value;
    localStorage.setItem('executeTime', time);
    document.getElementById('time-modal').classList.remove('show');
    alert('执行时间已保存');
}

// 保存步数区间设置
function saveRangeSettings() {
    const minSteps = document.getElementById('min-steps').value;
    const maxSteps = document.getElementById('max-steps').value;
    
    if (parseInt(minSteps) > parseInt(maxSteps)) {
        alert('最小步数不能大于最大步数');
        return;
    }
    
    localStorage.setItem('minSteps', minSteps);
    localStorage.setItem('maxSteps', maxSteps);
    document.getElementById('range-modal').classList.remove('show');
    alert('步数区间已保存');
}

// 立即执行
async function executeNow(username) {
    const accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    const account = accounts.find(acc => acc.username === username);
    if (!account) return;
    
    const minSteps = parseInt(account.minSteps || '10000');
    const maxSteps = parseInt(account.maxSteps || '20000');
    const randomSteps = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
    
    try {
        const url = `https://steps.api.030101.xyz/api?account=${encodeURIComponent(account.username)}&password=${encodeURIComponent(account.password)}&steps=${randomSteps}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'error') {
            alert('执行成功！步数：' + randomSteps);
            localStorage.setItem('lastRunTime', new Date().toISOString());
            updateManageInfo(username);
            // 添加成功日志
            addLog(username, randomSteps, 'success');
        } else {
            alert('执行失败：' + data.message);
            // 添加失败日志
            addLog(username, randomSteps, 'failed');
        }
    } catch (error) {
        console.error('执行失败:', error);
        alert('执行失败，请重试');
        // 添加失败日志
        addLog(username, randomSteps, 'failed');
    }
}

// 显示/隐藏设置区域
function showSettingsModal(username) {
    // 找到对应账号的卡片
    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach(card => {
        const accountId = card.querySelector('.account-id');
        if (accountId && accountId.textContent === username) {
            // 找到对应账号的设置区域
            const settingsArea = card.querySelector('.settings-area');
            if (settingsArea) {
                settingsArea.classList.toggle('show');
            }
        }
    });
}

// 保存设置
function saveSettings(username) {
    // 找到对应账号的卡片和输入值
    const accountCards = document.querySelectorAll('.account-card');
    let targetCard;
    accountCards.forEach(card => {
        const accountId = card.querySelector('.account-id');
        if (accountId && accountId.textContent === username) {
            targetCard = card;
        }
    });

    if (!targetCard) return;

    const time = targetCard.querySelector('input[type="time"]').value;
    const minSteps = targetCard.querySelector('input[placeholder="最小步数"]').value;
    const maxSteps = targetCard.querySelector('input[placeholder="最大步数"]').value;
    
    if (parseInt(minSteps) > parseInt(maxSteps)) {
        alert('最小步数不能大于最大步数');
        return;
    }
    
    // 更新账号设置
    let accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    const account = accounts.find(acc => acc.username === username);
    if (account) {
        account.executeTime = time;
        account.minSteps = minSteps;
        account.maxSteps = maxSteps;
        localStorage.setItem('managedAccounts', JSON.stringify(accounts));
        
        // 重新设置定时器
        scheduleNextExecution(account);
    }
    
    alert('设置已保存');
    targetCard.querySelector('.settings-area').classList.remove('show');
    
    // 更新显示
    updateAccountsList();
}

// 计算下一次执行时间并设置定时器
function scheduleNextExecution(account) {
    const executeTime = account.executeTime || '08:40';
    const [scheduledHour, scheduledMinute] = executeTime.split(':').map(Number);
    
    const now = new Date();
    const nextExecution = new Date(now);
    
    nextExecution.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    if (nextExecution <= now) {
        nextExecution.setDate(nextExecution.getDate() + 1);
    }
    
    const timeUntilExecution = nextExecution - now;
    
    setTimeout(() => {
        executeNow(account.username);
        // 执行完后，再次计算下一次执行时间
        scheduleNextExecution(account);
    }, timeUntilExecution);
    
    console.log(`下次执行时间 (${account.username}):`, nextExecution.toLocaleString());
}

// 更新账号列表显示
function updateAccountsList() {
    const accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    const container = document.querySelector('.accounts-container');
    
    // 清空现有内容，保留添加账号卡片
    const addCard = container.querySelector('.add-card');
    container.innerHTML = '';
    
    // 添加每个账号的卡片
    accounts.forEach(account => {
        const card = createAccountCard(account);
        container.appendChild(card);
    });
    
    // 重新添加添加账号卡片
    container.appendChild(addCard);
}

// 创建账号卡片
function createAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.setAttribute('data-account', account.username);
    card.innerHTML = `
        <div class="card-header">
            <div class="mi-logo">
                <svg class="run-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,5.5C14.59,5.5 15.5,4.58 15.5,3.5C15.5,2.38 14.59,1.5 13.5,1.5C12.39,1.5 11.5,2.38 11.5,3.5C11.5,4.58 12.39,5.5 13.5,5.5M9.89,19.38L10.89,15L13,17V23H15V15.5L12.89,13.5L13.5,10.5C14.79,12 16.79,13 19,13V11C17.09,11 15.5,10 14.69,8.58L13.69,7C13.29,6.38 12.69,6 12,6C11.69,6 11.5,6.08 11.19,6.08L6,8.28V13H8V9.58L9.79,8.88L8.19,17L3.29,16L2.89,18L9.89,19.38Z"/>
                </svg>
            </div>
        </div>
        <div class="card-content">
            <div class="account-id">${account.username}</div>
            <div class="run-status">正常运行中</div>
            <div class="last-run">
                上一次执行时间 <span>${new Date(account.lastRunTime).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
            <div class="logs-area">
                <div class="logs-header">
                    <span>执行日志</span>
                </div>
                <div class="logs-content">
                    <!-- 日志条目将通过 JavaScript 动态添加 -->
                </div>
            </div>
        </div>
        <div class="card-actions">
            <button class="cyber-button manage-btn" onclick="showSettingsModal('${account.username}')">
                <span class="btn-text">管理账号</span>
            </button>
            <button class="cyber-button execute-btn" onclick="executeNow('${account.username}')">
                <span class="btn-text">立即执行</span>
            </button>
            <button class="delete-btn" onclick="deleteAccount('${account.username}')">×</button>
        </div>
        <div class="settings-area">
            <div class="setting-group">
                <label>执行时间</label>
                <input type="time" class="time-input" value="${account.executeTime}" onchange="updateTime(this, '${account.username}')">
            </div>
            <div class="setting-group">
                <label>步数区间</label>
                <div class="range-inputs">
                    <input type="number" class="min-steps" placeholder="最小步数" value="${account.minSteps}">
                    <span class="range-separator">至</span>
                    <input type="number" class="max-steps" placeholder="最大步数" value="${account.maxSteps}">
                </div>
            </div>
            <button class="cyber-button confirm-btn" onclick="saveSettings('${account.username}')">
                <span class="btn-text">配置完成</span>
            </button>
        </div>
    `;
    return card;
}

// 添加时间更新函数
function updateTime(input, username) {
    const time = input.value;
    let accounts = JSON.parse(localStorage.getItem('managedAccounts') || '[]');
    const account = accounts.find(acc => acc.username === username);
    if (account) {
        account.executeTime = time;
        localStorage.setItem('managedAccounts', JSON.stringify(accounts));
        // 重新设置定时器
        scheduleNextExecution(account);
    }
}

// 添加日志记录
function addLog(account, steps, status = 'success') {
    const now = new Date();
    const time = now.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 获取账号的日志记录
    let logs = JSON.parse(localStorage.getItem(`logs_${account}`) || '[]');
    
    // 添加新日志
    logs.unshift({
        time,
        steps,
        status
    });
    
    // 只保留最近10条记录
    logs = logs.slice(0, 10);
    
    // 保存日志
    localStorage.setItem(`logs_${account}`, JSON.stringify(logs));
    
    // 更新显示
    updateLogsDisplay(account);
}

// 更新日志显示
function updateLogsDisplay(account) {
    const logs = JSON.parse(localStorage.getItem(`logs_${account}`) || '[]');
    const accountCard = document.querySelector(`.account-card[data-account="${account}"]`);
    if (!accountCard) return;
    
    const logsContent = accountCard.querySelector('.logs-content');
    if (!logsContent) return;
    
    logsContent.innerHTML = logs.map(log => `
        <div class="log-item">
            <span class="log-time">${log.time}</span>
            <span class="log-steps">${log.steps}步</span>
            <span class="log-status ${log.status}">${log.status === 'success' ? '成功' : '失败'}</span>
        </div>
    `).join('');
} 