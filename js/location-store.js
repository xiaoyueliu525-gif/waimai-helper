/**
 * 首页定位状态
 * 优先使用浏览器定位，其次使用默认收货地址。
 */
const LocationStore = (() => {
  const KEY = 'food-saver-current-location';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function save(location) {
    const next = {
      ...location,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function fromAddress(addr) {
    if (!addr) return null;
    return save({
      type: 'address',
      label: addr.tag ? `${addr.tag} · ${addr.detail}` : addr.detail,
      address: `${addr.region} ${addr.detail}`,
      lat: addr.lat || null,
      lng: addr.lng || null,
    });
  }

  function getCurrent() {
    const stored = load();
    if (stored) return stored;
    if (typeof AddressStore !== 'undefined') {
      return fromAddress(AddressStore.getDefault());
    }
    return null;
  }

  function useBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('当前浏览器不支持定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(save({
            type: 'gps',
            label: '当前位置',
            address: '浏览器定位',
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy || 0),
          }));
        },
        (error) => {
          reject(new Error(error.message || '定位失败，请检查浏览器权限'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        }
      );
    });
  }

  function toQuery(location) {
    const params = new URLSearchParams();
    if (!location) return params;
    if (location.lat != null) params.set('lat', location.lat);
    if (location.lng != null) params.set('lng', location.lng);
    if (location.address) params.set('address', location.address);
    return params;
  }

  return {
    getCurrent,
    fromAddress,
    useBrowserLocation,
    toQuery,
  };
})();
