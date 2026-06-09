const statOrders = document.getElementById('statOrders');
const statCoupons = document.getElementById('statCoupons');
const statSaved = document.getElementById('statSaved');
const deliveringBadge = document.getElementById('deliveringBadge');
const recentOrders = document.getElementById('recentOrders');

const STATUS_LABEL = {
  delivering: '配送中',
  completed: '已完成',
  pending: '待支付',
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function renderRecentOrder(order) {
  const href = order.status === 'delivering'
    ? `tracking.html?id=${order.id}`
    : `orders.html?id=${order.id}&detail=1`;
  return `
    <a href="${href}" class="recent-order-card">
      <div class="recent-order-top">
        <span>${order.merchantEmoji} ${order.merchantName}</span>
        <span class="order-status ${order.status}">${STATUS_LABEL[order.status] || order.status}</span>
      </div>
      <div class="recent-order-items">${OrderStore.formatItemsSummary(order.items)}</div>
      <div class="recent-order-bottom">
        <span>${formatDate(order.createdAt)}</span>
        <span class="recent-order-total">¥${order.total.toFixed(1)}</span>
      </div>
    </a>
  `;
}

function bindEvents() {
  document.getElementById('btnHelp').addEventListener('click', () => {
    alert('客服热线：400-123-4567\n工作时间：9:00 - 22:00');
  });

  document.getElementById('btnSettings').addEventListener('click', () => {
    alert('设置功能开发中\n可配置：消息通知、隐私、账号安全');
  });

  document.getElementById('editProfile').addEventListener('click', () => {
    const name = prompt('修改昵称', '美食探索家');
    if (name?.trim()) {
      document.getElementById('profileName').textContent = name.trim();
      localStorage.setItem('food-saver-nickname', name.trim());
    }
  });

}

async function init() {
  initBottomNav('profile');
  bindEvents();

  const savedName = localStorage.getItem('food-saver-nickname');
  if (savedName) document.getElementById('profileName').textContent = savedName;

  const stats = OrderStore.getStats();
  const couponCount = await FoodAPI.getAvailableCouponCount();
  const defaultAddr = AddressStore.getDefault();
  const addrEl = document.getElementById('defaultAddressText');
  if (defaultAddr) {
    addrEl.textContent = AddressStore.formatShort(defaultAddr);
  } else {
    addrEl.textContent = '请添加收货地址';
  }

  statOrders.textContent = stats.total;
  statCoupons.textContent = couponCount;
  statSaved.textContent = stats.saved;

  if (stats.delivering > 0) {
    deliveringBadge.hidden = false;
    deliveringBadge.textContent = `${stats.delivering}单配送中`;
  }

  const orders = OrderStore.getAll().slice(0, 2);
  recentOrders.innerHTML = orders.length
    ? orders.map(renderRecentOrder).join('')
    : '<div class="empty-state"><p>还没有订单，去首页逛逛吧</p></div>';
}

init();
