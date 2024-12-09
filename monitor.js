class SystemMonitor {
    constructor() {
        this.cpuElement = document.querySelector('#cpu-usage');
        this.memoryElement = document.querySelector('#memory-usage');
        this.networkElement = document.querySelector('#network-speed');
        this.cpuProgress = document.querySelector('#cpu-progress');
        this.memoryProgress = document.querySelector('#memory-progress');
        this.networkProgress = document.querySelector('#network-progress');
        this.ipElement = document.querySelector('#ip-address');
        
        // 从 localStorage 加载查询记录
        const queryRecord = JSON.parse(localStorage.getItem('queryRecord') || '{}');
        this.lastQueryTime = queryRecord.lastQueryTime || 0;
        this.queryCount = queryRecord.queryCount || 0;
        this.resetTime = queryRecord.resetTime || 0;
        this.maxQueries = 2;
        this.resetInterval = 1800000;
        this.countdownTimer = null;

        // 检查是否需要重置计数
        const now = Date.now();
        if (now - this.resetTime >= this.resetInterval) {
            this.queryCount = 0;
            this.resetTime = now;
            this.saveQueryRecord();
        }
        
        // 初始化监控
        this.initMonitoring();
        
        // 初始化事件监听
        this.initEventListeners();
    }

    initEventListeners() {
        // IP查询按钮点击事件
        const checkIpButton = document.getElementById('check-ip');
        if (checkIpButton) {
            checkIpButton.addEventListener('click', () => this.checkIP());
        }
    }

    async initMonitoring() {
        // 每秒更新一次数据
        setInterval(() => this.updateMetrics(), 1000);
    }

    async updateMetrics() {
        try {
            // 获取性能数据
            const metrics = await this.getPerformanceMetrics();
            
            // 更新显示
            this.updateDisplay(metrics);
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    async getPerformanceMetrics() {
        // 这里使用 Performance API 获取数据
        const performance = window.performance;
        const memory = performance.memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
        
        // 获取 CPU 使用率（模拟数据）
        const cpuUsage = Math.floor(Math.random() * 100);
        
        // 获取内存使用
        const usedMemory = Math.floor(memory.usedJSHeapSize / 1024 / 1024);
        const totalMemory = Math.floor(memory.totalJSHeapSize / 1024 / 1024);
        
        // 获取网络速度（如果支持）
        let networkSpeed = 0;
        if ('connection' in navigator) {
            networkSpeed = navigator.connection.downlink || 0;
        }

        return {
            cpu: cpuUsage,
            memory: {
                used: usedMemory,
                total: totalMemory
            },
            network: networkSpeed
        };
    }

    updateDisplay(metrics) {
        // 更新 CPU
        this.cpuElement.textContent = `${metrics.cpu}%`;
        this.cpuProgress.style.width = `${metrics.cpu}%`;

        // 更新内存
        this.memoryElement.textContent = 
            `${metrics.memory.used}MB / ${metrics.memory.total}MB`;
        const memoryPercentage = 
            (metrics.memory.used / metrics.memory.total) * 100;
        this.memoryProgress.style.width = `${memoryPercentage}%`;

        // 更新网络
        this.networkElement.textContent = `${metrics.network}MB/s`;
        this.networkProgress.style.width = `${(metrics.network / 10) * 100}%`;
    }

    // 添加倒计时显示方法
    showCountdown(modal, endTime, type = 'seconds') {
        // 清除可能存在的旧计时器
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }

        const updateCountdown = () => {
            const now = Date.now();
            const remaining = endTime - now;

            if (remaining <= 0) {
                clearInterval(this.countdownTimer);
                modal.classList.remove('show');
                return;
            }

            let countdownText;
            if (type === 'minutes') {
                const minutes = Math.ceil(remaining / 60000);
                countdownText = `每30分钟内只能查询2次<br>请等待 ${minutes} 分钟后再试`;
            } else {
                const seconds = Math.ceil(remaining / 1000);
                countdownText = `两次查询需间隔10秒<br>请等待 ${seconds} 秒后再试`;
            }

            const messageSpan = modal.querySelector('.ip-details span');
            if (messageSpan) {
                messageSpan.innerHTML = countdownText;
            }
        };

        // 立即更新一次
        updateCountdown();
        // 设置定时器，每秒更新一次
        this.countdownTimer = setInterval(updateCountdown, 1000);

        // 添加关闭事件，清除计时器
        modal.querySelector('.ip-info-close').addEventListener('click', () => {
            clearInterval(this.countdownTimer);
            modal.classList.remove('show');
        });
    }

    async checkIP() {
        try {
            const now = Date.now();

            // 检查是否需要重置计数
            if (now - this.resetTime >= this.resetInterval) {
                this.queryCount = 0;
                this.resetTime = now;
                this.saveQueryRecord();
            }

            // 检查查询次数是否超限
            if (this.queryCount >= this.maxQueries) {
                const nextResetTime = this.resetTime + this.resetInterval;
                
                let modal = document.querySelector('.ip-info-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.className = 'ip-info-modal';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="ip-info-content">
                        <span class="ip-info-close">&times;</span>
                        <h2>查询次数已达上限</h2>
                        <div class="ip-details">
                            <span></span>
                        </div>
                    </div>
                `;
                modal.classList.add('show');

                // 显示分钟倒计时
                this.showCountdown(modal, nextResetTime, 'minutes');
                return;
            }

            // 检查查询间隔
            const timeSinceLastQuery = now - this.lastQueryTime;
            if (timeSinceLastQuery < this.queryInterval) {
                const nextQueryTime = this.lastQueryTime + this.queryInterval;
                
                let modal = document.querySelector('.ip-info-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.className = 'ip-info-modal';
                    document.body.appendChild(modal);
                }

                modal.innerHTML = `
                    <div class="ip-info-content">
                        <span class="ip-info-close">&times;</span>
                        <h2>查询过于频繁</h2>
                        <div class="ip-details">
                            <span></span>
                        </div>
                    </div>
                `;
                modal.classList.add('show');

                // 显示秒数倒计时
                this.showCountdown(modal, nextQueryTime);
                return;
            }

            // 更新查询记录
            this.lastQueryTime = now;
            this.queryCount++;
            if (this.queryCount === 1) {
                this.resetTime = now;
            }
            this.saveQueryRecord();  // 保存更新后的记录

            // 创建或获取模态框
            let modal = document.querySelector('.ip-info-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'ip-info-modal';
                document.body.appendChild(modal);
            }

            // 显示加载状态
            modal.innerHTML = `
                <div class="ip-info-content">
                    <span class="ip-info-close">&times;</span>
                    <h2>正在获取IP信息...</h2>
                    <div class="ip-details">
                        <span>正在查询中，请稍候...</span>
                    </div>
                </div>
            `;
            modal.classList.add('show');

            // 获取IP信息
            const API_KEY = '283aa35eb6444d80ab5c6afd173dfe6e';
            const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&lang=zh&fields=geo,isp,organization,continent_name,country_capital,state_prov,district,city,zipcode,latitude,longitude,time_zone,currency,connection_type`);
            const data = await response.json();

            // 构建详细信息
            const locationDetails = [
                {
                    label: 'IP地址',
                    value: data.ip
                },
                {
                    label: '国家/地区',
                    value: data.country_name_chinese || data.country_name
                },
                {
                    label: '省份',
                    value: data.state_prov || '未知'
                },
                {
                    label: '城市',
                    value: data.city || '未知'
                },
                {
                    label: '运营商',
                    value: data.isp || '未知'
                },
                {
                    label: '网络类型',
                    value: data.connection_type || '未知'
                },
                {
                    label: '时区',
                    value: `${data.time_zone?.name || '未知'} (${data.time_zone?.offset || ''})`
                }
            ];

            // 更新模态框内容
            modal.innerHTML = `
                <div class="ip-info-content">
                    <span class="ip-info-close">&times;</span>
                    <h2>IP信息查询结果</h2>
                    <div class="ip-details">
                        ${locationDetails.map(item => `
                            <span>
                                <strong>${item.label}</strong>
                                <div class="value">${item.value}</div>
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;

            // 添加关闭事件
            modal.querySelector('.ip-info-close').addEventListener('click', () => {
                modal.classList.remove('show');
            });

            // 点击外部区域关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });

        } catch (error) {
            console.error('IP查询错误:', error);
            // 显示错误信息
            if (modal) {
                modal.innerHTML = `
                    <div class="ip-info-content">
                        <span class="ip-info-close">&times;</span>
                        <h2>查询失败</h2>
                        <div class="ip-details">
                            <span>IP信息获取失败，请稍后重试</span>
                        </div>
                    </div>
                `;
            }
        }
    }

    // 添加日志方法
    addLog(type, message) {
        const logContainer = document.querySelector('.log-container');
        const time = new Date().toLocaleTimeString();
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-type ${type}">${type === 'info' ? '信息' : type === 'warning' ? '警告' : '成功'}</span>
            <span class="log-message">${message}</span>
        `;
        
        // 在顶部插入新日志
        logContainer.insertBefore(logItem, logContainer.firstChild);
        
        // 保持最多显示 10 条日志
        while (logContainer.children.length > 10) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    // 添加保存记录方法
    saveQueryRecord() {
        const queryRecord = {
            lastQueryTime: this.lastQueryTime,
            queryCount: this.queryCount,
            resetTime: this.resetTime
        };
        localStorage.setItem('queryRecord', JSON.stringify(queryRecord));
    }
} 

// 初始化监控系统
document.addEventListener('DOMContentLoaded', function() {
    const monitor = new SystemMonitor();
}); 