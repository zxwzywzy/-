function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 3 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    particle.style.opacity = Math.random();
    particle.style.transition = 'all 2s linear';
    particle.style.boxShadow = '0 0 10px currentColor';
    
    return particle;
}

function animateParticles() {
    const particlesContainer = document.getElementById('particles');
    const maxParticles = 50;
    let particles = [];

    function createNewParticle() {
        if (particles.length >= maxParticles) return;
        
        const particle = createParticle();
        particles.push(particle);
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
            
            setTimeout(() => {
                particlesContainer.removeChild(particle);
                particles = particles.filter(p => p !== particle);
            }, 2000);
        }, 100);
    }

    // 初始化统计图表的填充动画
    document.querySelectorAll('.stat').forEach(stat => {
        const value = stat.querySelector('.stat-value').textContent;
        const percentage = parseInt(value);
        stat.querySelector('.stat-fill').style.setProperty('--fill-percentage', percentage + '%');
    });

    setInterval(createNewParticle, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    animateParticles();
});

// 添加鼠标移动效果
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    document.querySelectorAll('.cyber-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angleX = (y - centerY) / 30;
        const angleY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
}); 