/**
 * 老虎机抽奖动画
 */
const Lottery = (() => {
  const ITEM_HEIGHT = 72;
  let foods = [];
  let isRunning = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildReel(targetFood, pool) {
    const items = [];
    const filler = shuffle(pool).slice(0, 8);
    for (let i = 0; i < 20; i++) {
      items.push(filler[i % filler.length]);
    }
    items.push(targetFood);
    return items;
  }

  function renderReelItems(reelEl, items) {
    reelEl.innerHTML = items
      .map(
        (f) => `
        <div class="slot-item">
          <span class="slot-emoji">${f.emoji}</span>
          <span class="slot-name">${f.name}</span>
        </div>
      `
      )
      .join('');
  }

  function spawnConfetti(container) {
    const colors = ['#FF6B35', '#FFB347', '#667eea', '#764ba2', '#4ade80', '#f472b6'];
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 2000);
    }
  }

  async function run(options) {
    const {
      modal,
      slotPhase,
      resultPhase,
      reelEl,
      modalEmoji,
      modalResult,
      modalTip,
      onComplete,
    } = options;

    if (isRunning) return;
    isRunning = true;

    if (!foods.length) {
      foods = await FoodAPI.getFoods();
    }

    const target = await FoodAPI.drawFood();
    const reelItems = buildReel(target, foods);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    slotPhase.hidden = false;
    resultPhase.hidden = true;
    resultPhase.classList.remove('show');

    renderReelItems(reelEl, reelItems);
    reelEl.style.transition = 'none';
    reelEl.style.transform = 'translateY(0)';

    await new Promise((r) => requestAnimationFrame(r));

    const finalOffset = (reelItems.length - 1) * ITEM_HEIGHT;
    reelEl.style.transition = 'transform 2.8s cubic-bezier(0.12, 0.8, 0.2, 1)';
    reelEl.style.transform = `translateY(-${finalOffset}px)`;

    await new Promise((r) => setTimeout(r, 3000));

    slotPhase.hidden = true;
    resultPhase.hidden = false;
    modalEmoji.textContent = target.emoji;
    modalResult.textContent = target.name;
    modalTip.textContent = target.tip;

    requestAnimationFrame(() => {
      resultPhase.classList.add('show');
      spawnConfetti(modal.querySelector('.modal-confetti'));
    });

    isRunning = false;
    if (onComplete) onComplete(target);
    return target;
  }

  function close(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
    isRunning = false;
  }

  return { run, close, get isRunning() { return isRunning; } };
})();
