/**
 * 收货地址存储
 */
const AddressStore = (() => {
  const KEY = 'food-saver-addresses';

  const SAMPLE = [
    {
      id: 1,
      name: '张先生',
      phone: '13888888888',
      region: '北京市朝阳区',
      detail: '望京 SOHO T3 座 1808',
      tag: '家',
      isDefault: true,
    },
    {
      id: 2,
      name: '张先生',
      phone: '13888888888',
      region: '北京市海淀区',
      detail: '中关村大街 1 号 科技大厦 5层',
      tag: '公司',
      isDefault: false,
    },
  ];

  function load() {
    try {
      const data = localStorage.getItem(KEY);
      if (data) return JSON.parse(data);
    } catch {
      /* ignore */
    }
    localStorage.setItem(KEY, JSON.stringify(SAMPLE));
    return [...SAMPLE];
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function formatShort(addr) {
    return `${addr.region} ${addr.detail} · ${addr.name} ${addr.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`;
  }

  return {
    getAll() {
      return load().sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    },

    getDefault() {
      const list = load();
      return list.find((a) => a.isDefault) || list[0] || null;
    },

    getById(id) {
      return load().find((a) => a.id === Number(id));
    },

    formatShort,

    add(data) {
      const list = load();
      const addr = { id: Date.now(), ...data, isDefault: data.isDefault || list.length === 0 };
      if (addr.isDefault) list.forEach((a) => { a.isDefault = false; });
      list.push(addr);
      save(list);
      return addr;
    },

    update(id, data) {
      const list = load();
      const idx = list.findIndex((a) => a.id === Number(id));
      if (idx === -1) return null;
      if (data.isDefault) list.forEach((a) => { a.isDefault = false; });
      list[idx] = { ...list[idx], ...data, id: list[idx].id };
      save(list);
      return list[idx];
    },

    remove(id) {
      let list = load().filter((a) => a.id !== Number(id));
      if (list.length && !list.some((a) => a.isDefault)) {
        list[0].isDefault = true;
      }
      save(list);
      return list;
    },

    setDefault(id) {
      const list = load();
      list.forEach((a) => { a.isDefault = a.id === Number(id); });
      save(list);
    },
  };
})();
