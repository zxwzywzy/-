document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子效果
    initParticles();

    const currentSteps = document.getElementById('currentSteps');
    const runStatus = document.getElementById('runStatus');
    const logContent = document.getElementById('logContent');
    
    // 获取或初始化存储的数据
    let stepsData = JSON.parse(localStorage.getItem('stepsData')) || {
        steps: Math.floor(Math.random() * 2000) + 3000,
        targetSteps: Math.floor(Math.random() * 20000) + 35000,
        lastUpdate: new Date().toDateString()
    };

    let steps = stepsData.steps;
    let targetSteps = stepsData.targetSteps;
    const minSteps = 35000;
    const maxSteps = 55000;

    // 检查是否需要重置（凌晨1点）
    function checkReset() {
        const now = new Date();
        const lastUpdate = new Date(stepsData.lastUpdate);
        
        // 如果是新的一天且当前时间在凌晨1点之后
        if (now.toDateString() !== lastUpdate.toDateString() && now.getHours() >= 1) {
            steps = Math.floor(Math.random() * 2000) + 3000;
            targetSteps = Math.floor(Math.random() * 20000) + 35000;
            stepsData = {
                steps: steps,
                targetSteps: targetSteps,
                lastUpdate: now.toDateString()
            };
            localStorage.setItem('stepsData', JSON.stringify(stepsData));
            addLog('新的一天开始，重置步数和目标');
        }
    }

    // 更新显示
    document.getElementById('targetSteps').textContent = targetSteps.toLocaleString();

    // 添加日志
    function addLog(message) {
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${time}] ${message}`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    // 更新步数
    async function updateSteps() {
        try {
            checkReset(); // 检查是否需要重置

            const remainingSteps = targetSteps - steps;
            const timeLeft = (24 - new Date().getHours()) * 3600 / 4;
            const avgIncrease = Math.max(1, Math.ceil(remainingSteps / (timeLeft * 2)));
            
            const maxIncreasePerUpdate = 6;
            const increase = Math.min(
                maxIncreasePerUpdate,
                Math.floor(Math.random() * 2) + avgIncrease
            );
            steps += increase;

            if (steps >= targetSteps) {
                steps = Math.floor(Math.random() * 1000) + 3000;
                addLog('达到目标步数，重置为初始值');
            }

            // 保存当前步数
            stepsData.steps = steps;
            localStorage.setItem('stepsData', JSON.stringify(stepsData));

            const url = `https://steps.api.030101.xyz/api?account=2790712971@qq.com&password=zy739452.&steps=${steps}`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'no-cors'
            });
            
            currentSteps.textContent = steps.toLocaleString();
            addLog(`步数更新成功：${steps} (+${increase})`);
            
            if (steps >= minSteps) {
                runStatus.textContent = '已达标';
                runStatus.style.color = '#00ff00';
            } else {
                runStatus.textContent = '运行中';
                runStatus.style.color = '#00ffff';
            }
        } catch (error) {
            addLog(`更新失败：${error.message}`);
            runStatus.textContent = '出错';
            runStatus.style.color = '#ff0000';
        }
    }

    // 初始化
    addLog('系统启动');
    addLog(`今日目标步数：${targetSteps.toLocaleString()}`);
    if (steps > 3000) {
        addLog(`继续执行，当前步数：${steps.toLocaleString()}`);
    }
    updateSteps();
    setInterval(updateSteps, 8000);

    // 每分钟检查一次是否需要重置
    setInterval(checkReset, 60000);
});

// 初始化粒子效果
function initParticles() {
    particlesJS('particles-js', {
        // 使用与主页相同的粒子配置
        particles: {
            number: { value: 100, density: { enable: true, value_area: 1000 } },
            color: { value: ['#ffffff', '#ff8533', '#ff6700'] },
            shape: {
                type: ['circle', 'triangle'],
                stroke: { width: 0, color: '#ffffff' }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'bounce',
                bounce: true,
                attract: { enable: true, rotateX: 1200, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: ['grab', 'bubble'] },
                onclick: { enable: true, mode: 'push' },
                resize: true
            },
            modes: {
                grab: { distance: 200, line_linked: { opacity: 0.8 } },
                bubble: { distance: 200, size: 6, duration: 0.3, opacity: 0.8, speed: 3 },
                repulse: { distance: 200, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true
    });
} 