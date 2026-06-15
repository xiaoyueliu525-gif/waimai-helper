const orderList = document.getElementById('orderList');
const orderTabs = document.getElementById('orderTabs');
const orderDetail = document.getElementById('orderDetail');
const detailContent = document.getElementById('detailContent');
const detailOverlay = document.getElementById('detailOverlay');

const params = new URLSearchParams(location.search);
const highlightId = params.get('id');

let currentStatus = 'all';

const STATUS_LABEL = {
  delivering: '配送中',
  completed: '已完成',
  pending: '待支付',
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function renderOrderCard(order) {
  const highlight = Number(highlightId) === order.id ? ' highlight' : '';
  return `
    <div class="order-card${highlight}" data-id="${order.id}">
      <div class="order-card-header">
        <a href="merchant.html?id=${order.merchantId}" class="order-merchant">
          ${order.merchantEmoji} ${order.merchantName}
        </a>
        <span class="order-status ${order.status}">${STATUS_LABEL[order.status]}</span>
      </div>
      <div class="order-card-body" data-action="detail">
        <div class="order-items-preview">
          ${order.items.map((i) => `<span class="order-item-chip">${i.emoji} ${i.name} ×${i.qty}</span>`).join('')}
        </div>
        <div class="order-card-meta">
          <span>${formatDate(order.createdAt)}</span>
          <span>共 ${order.items.reduce((s, i) => s + i.qty, 0)} 件</span>
        </div>
      </div>
      <div class="order-card-footer">
        <span class="order-total">实付 <strong>¥${order.total.toFixed(1)}</strong></span>
        <div class="order-actions">
          ${order.status === 'delivering' ? '<button class="btn-order-secondary" data-action="track">追踪配送</button>' : ''}
          <button class="btn-order-primary" data-action="reorder">再来一单</button>
        </div>
      </div>
    </div>
  `;
}

function renderOrders(orders) {
  if (!orders.length) {
    const emptyMsg = {
      all: '还没有订单',
      delivering: '没有进行中的订单',
      completed: '还没有完成的订单',
    };
    orderList.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">📋</span>
        <p>${emptyMsg[currentStatus]}</p>
        <a href="index.html" class="btn-go-home">去首页逛逛</a>
      </div>
    `;
    return;
  }
  orderList.innerHTML = orders.map(renderOrderCard).join('');
}

function showDetail(order) {
  detailContent.innerHTML = `
    <h2 class="detail-title">${STATUS_LABEL[order.status]}</h2>
    <p class="detail-sub">${order.status === 'delivering' ? `预计 ${order.deliveryTime} 送达` : '感谢您的惠顾'}</p>
    <div class="detail-merchant">
      <span class="detail-emoji">${order.merchantEmoji}</span>
      <span>${order.merchantName}</span>
    </div>
    <div class="detail-items">
      ${order.items
        .map(
          (i) => `
        <div class="detail-item-row">
          <span>${i.emoji} ${i.name}</span>
          <span>×${i.qty}</span>
          <span>¥${(i.price * i.qty).toFixed(1)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    <div class="detail-fees">
      <div class="detail-fee-row"><span>配送费</span><span>¥${order.deliveryFee}</span></div>
      <div class="detail-fee-row total"><span>合计</span><span>¥${order.total.toFixed(1)}</span></div>
    </div>
    <p class="detail-time">下单时间：${formatDate(order.createdAt)}</p>
    <div class="detail-actions">
      ${order.status === 'delivering' ? `<a href="tracking.html?id=${order.id}" class="btn-order-secondary full">查看配送</a>` : ''}
      <a href="merchant.html?id=${order.merchantId}" class="btn-order-primary full">再来一单</a>
    </div>
  `;
  orderDetail.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  orderDetail.hidden = true;
  document.body.style.overflow = '';
}

function bindEvents() {
  orderTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.order-tab');
    if (!tab || tab.dataset.status === currentStatus) return;
    currentStatus = tab.dataset.status;
    orderTabs.querySelectorAll('.order-tab').forEach((t) => {
      t.classList.toggle('active', t === tab);
    });
    renderOrders(OrderStore.getAll(currentStatus));
  });

  orderList.addEventListener('click', (e) => {
    const card = e.target.closest('.order-card');
    if (!card) return;
    const order = OrderStore.getById(card.dataset.id);
    if (!order) return;

    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'reorder') {
      location.href = `merchant.html?id=${order.merchantId}`;
      return;
    }
    if (action === 'track') {
      location.href = `tracking.html?id=${order.id}`;
      return;
    }
    if (action === 'detail' || e.target.closest('.order-card-body')) {
      showDetail(order);
    }
  });

  detailOverlay.addEventListener('click', closeDetail);
}

function init() {
  bindEvents();
  renderOrders(OrderStore.getAll());

  if (highlightId) {
    const order = OrderStore.getById(highlightId);
    if (order) {
      if (order.status === 'delivering' && !params.get('detail')) {
        location.replace(`tracking.html?id=${order.id}`);
        return;
      }
      setTimeout(() => showDetail(order), 300);
    }
  }
}

init();
