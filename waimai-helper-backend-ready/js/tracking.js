const params = new URLSearchParams(location.search);
const orderId = params.get('id');

const STEPS = [
  { key: 'ordered', label: '订单已提交', icon: '📝' },
  { key: 'accepted', label: '商家已接单', icon: '✅' },
  { key: 'picked', label: '骑手已取餐', icon: '🛵' },
  { key: 'delivering', label: '正在配送', icon: '📦' },
  { key: 'arrived', label: '即将送达', icon: '🏠' },
];

function getProgress(order) {
  if (order.status === 'completed') return { step: 4, percent: 100 };
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  if (elapsed < 1) return { step: 0, percent: 10 };
  if (elapsed < 3) return { step: 1, percent: 30 };
  if (elapsed < 6) return { step: 2, percent: 55 };
  if (elapsed < 12) return { step: 3, percent: 75 };
  return { step: 4, percent: 92 };
}

function parseMinutes(str) {
  const m = str?.match(/(\d+)/);
  return m ? Number(m[1]) : 20;
}

function renderTimeline(step) {
  document.getElementById('timeline').innerHTML = STEPS.map((s, i) => `
    <div class="timeline-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''} ${i > step ? 'pending' : ''}">
      <div class="timeline-dot">${s.icon}</div>
      <div class="timeline-label">${s.label}</div>
    </div>
  `).join('');
}

function animateRider(percent) {
  const rider = document.getElementById('mapRider');
  const top = 15 + (percent / 100) * 65;
  const left = 20 + Math.sin((percent / 100) * Math.PI) * 15;
  rider.style.top = `${top}%`;
  rider.style.left = `${left}%`;
}

function renderOrderSummary(order) {
  const addr = AddressStore.getDefault();
  document.getElementById('orderSummary').innerHTML = `
    <div class="tracking-order-row">
      <span>${order.merchantEmoji} ${order.merchantName}</span>
      <span>¥${order.total.toFixed(1)}</span>
    </div>
    <div class="tracking-order-items">${OrderStore.formatItemsSummary(order.items)}</div>
    ${addr ? `<div class="tracking-order-addr">📍 ${AddressStore.formatShort(addr)}</div>` : ''}
  `;
}

function startLiveUpdate(order) {
  function tick() {
    if (order.status === 'completed') return;
    const { step, percent } = getProgress(order);
    renderTimeline(step);
    animateRider(percent);

    const mins = parseMinutes(order.deliveryTime);
    const remaining = Math.max(1, Math.round(mins * (1 - percent / 100)));
    document.getElementById('etaText').textContent = `预计 ${remaining} 分钟送达`;
  }
  tick();
  setInterval(tick, 5000);
}

function init() {
  if (!orderId) {
    location.href = 'orders.html';
    return;
  }

  const order = OrderStore.getById(orderId);
  if (!order) {
    location.href = 'orders.html';
    return;
  }

  if (order.status === 'completed') {
    document.getElementById('trackingStatus').innerHTML = `
      <h1>已送达</h1>
      <p>订单已完成，感谢使用</p>
    `;
  }

  document.getElementById('merchantEmoji').textContent = order.merchantEmoji;
  document.getElementById('merchantLabel').textContent = order.merchantName;
  document.title = `配送追踪 - ${order.merchantName}`;

  const { step, percent } = getProgress(order);
  renderTimeline(step);
  animateRider(percent);
  renderOrderSummary(order);
  startLiveUpdate(order);
}

init();
