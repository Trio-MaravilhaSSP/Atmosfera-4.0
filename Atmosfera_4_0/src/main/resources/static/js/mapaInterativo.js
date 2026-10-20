// Configurações e Estado do Mapa 3D
const state = {
    rotateX: 55,   // Ângulo de inclinação padrão (graus)
    rotateZ: -35,  // Ângulo de rotação horizontal padrão (graus)
    scale: 1,      // Fator de Zoom
    isDragging: false,
    startX: 0,
    startY: 0
};

const viewport = document.getElementById('viewport');
const mapPlane = document.getElementById('mapPlane');

// Atualiza a transformação no plano do mapa e compensa nos pins
function renderTransform() {
    // Aplica a rotação e o zoom no container do mapa
    mapPlane.style.transform = `rotateX(${state.rotateX}deg) rotateZ(${state.rotateZ}deg) scale(${state.scale})`;

    // Atualiza todos os pins para compensar a rotação e ficarem virados para a câmera (Billboard effect)
    const pins = document.querySelectorAll('.pin-billboard');
    pins.forEach(pin => {
        pin.style.transform = `rotateZ(${-state.rotateZ}deg) rotateX(${-state.rotateX}deg)`;
    });
}

// --- Eventos de Mouse Dragging (Clique e Arraste) ---

viewport.addEventListener('mousedown', (e) => {
    state.isDragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;

    // Ajusta a sensibilidade do movimento
    state.rotateZ += deltaX * 0.4;
    state.rotateX -= deltaY * 0.4;

    // Clampa/Limita a rotação X para evitar inversão da câmera
    state.rotateX = Math.max(15, Math.min(80, state.rotateX));

    state.startX = e.clientX;
    state.startY = e.clientY;

    renderTransform();
});

window.addEventListener('mouseup', () => {
    state.isDragging = false;
});

// Suporte a Touch / Mobile
viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        state.isDragging = true;
        state.startX = e.touches[0].clientX;
        state.startY = e.touches[0].clientY;
    }
});

window.addEventListener('touchmove', (e) => {
    if (!state.isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - state.startX;
    const deltaY = e.touches[0].clientY - state.startY;

    state.rotateZ += deltaX * 0.4;
    state.rotateX -= deltaY * 0.4;
    state.rotateX = Math.max(15, Math.min(80, state.rotateX));

    state.startX = e.touches[0].clientX;
    state.startY = e.touches[0].clientY;

    renderTransform();
});

window.addEventListener('touchend', () => {
    state.isDragging = false;
});

// Inicializa as transformações na montagem da tela
renderTransform();