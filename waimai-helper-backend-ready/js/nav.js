/**
 * 底部导航公共组件
 */
function initBottomNav(activePage) {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;

  const pages = {
    home: { href: 'index.html', label: '首页' },
    discover: { href: 'discover.html', label: '发现' },
    coupons: { href: 'coupons.html', label: '优惠券' },
    profile: { href: 'profile.html', label: '我的' },
  };

  nav.querySelectorAll('.nav-item').forEach((item) => {
    const page = item.dataset.page;
    if (pages[page]) {
      item.href = pages[page].href;
    }
    item.classList.toggle('active', page === activePage);
  });

  const couponLink = nav.querySelector('[data-page="coupons"]');
  if (couponLink && activePage !== 'coupons') {
    FoodAPI.getAvailableCouponCount().then((count) => {
      let badge = couponLink.querySelector('.nav-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'nav-badge';
          couponLink.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    });
  }
}
