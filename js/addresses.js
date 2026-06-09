const addressList = document.getElementById('addressList');
const addressModal = document.getElementById('addressModal');
const addressForm = document.getElementById('addressForm');
const formTitle = document.getElementById('formTitle');
const tagOptions = document.getElementById('tagOptions');

let selectedTag = '家';

function renderAddresses() {
  const list = AddressStore.getAll();
  if (!list.length) {
    addressList.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">📍</span>
        <p>还没有收货地址</p>
        <button class="btn-order-primary" id="btnAddEmpty">添加地址</button>
      </div>
    `;
    document.getElementById('btnAddEmpty')?.addEventListener('click', openAddForm);
    return;
  }

  addressList.innerHTML = list
    .map(
      (a) => `
      <div class="address-card ${a.isDefault ? 'default' : ''}" data-id="${a.id}">
        <div class="address-card-top">
          <span class="address-tag">${a.tag}</span>
          ${a.isDefault ? '<span class="address-default-badge">默认</span>' : ''}
        </div>
        <div class="address-card-region">${a.region} ${a.detail}</div>
        <div class="address-card-contact">${a.name} ${a.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</div>
        <div class="address-card-actions">
          ${!a.isDefault ? `<button class="addr-action" data-action="default">设为默认</button>` : ''}
          <button class="addr-action" data-action="edit">编辑</button>
          <button class="addr-action danger" data-action="delete">删除</button>
        </div>
      </div>
    `
    )
    .join('');
}

function openModal() {
  addressModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  addressModal.hidden = true;
  document.body.style.overflow = '';
  addressForm.reset();
  document.getElementById('formId').value = '';
  selectedTag = '家';
  tagOptions.querySelectorAll('.tag-option').forEach((t, i) => {
    t.classList.toggle('active', i === 0);
  });
}

function openAddForm() {
  formTitle.textContent = '新增地址';
  document.getElementById('formId').value = '';
  openModal();
}

function openEditForm(id) {
  const addr = AddressStore.getById(id);
  if (!addr) return;
  formTitle.textContent = '编辑地址';
  document.getElementById('formId').value = addr.id;
  document.getElementById('formName').value = addr.name;
  document.getElementById('formPhone').value = addr.phone;
  document.getElementById('formRegion').value = addr.region;
  document.getElementById('formDetail').value = addr.detail;
  document.getElementById('formDefault').checked = addr.isDefault;
  selectedTag = addr.tag;
  tagOptions.querySelectorAll('.tag-option').forEach((t) => {
    t.classList.toggle('active', t.dataset.tag === addr.tag);
  });
  openModal();
}

function bindEvents() {
  document.getElementById('btnAdd').addEventListener('click', openAddForm);
  document.getElementById('btnCancel').addEventListener('click', closeModal);
  addressModal.addEventListener('click', (e) => {
    if (e.target === addressModal) closeModal();
  });

  tagOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-option');
    if (!btn) return;
    selectedTag = btn.dataset.tag;
    tagOptions.querySelectorAll('.tag-option').forEach((t) => {
      t.classList.toggle('active', t === btn);
    });
  });

  addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('formId').value;
    const data = {
      name: document.getElementById('formName').value.trim(),
      phone: document.getElementById('formPhone').value.trim(),
      region: document.getElementById('formRegion').value.trim(),
      detail: document.getElementById('formDetail').value.trim(),
      tag: selectedTag,
      isDefault: document.getElementById('formDefault').checked,
    };
    if (id) {
      AddressStore.update(id, data);
    } else {
      AddressStore.add(data);
    }
    closeModal();
    renderAddresses();
  });

  addressList.addEventListener('click', (e) => {
    const card = e.target.closest('.address-card');
    if (!card) return;
    const id = card.dataset.id;
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'edit') openEditForm(id);
    if (action === 'delete') {
      if (confirm('确定删除该地址？')) {
        AddressStore.remove(id);
        renderAddresses();
      }
    }
    if (action === 'default') {
      AddressStore.setDefault(id);
      renderAddresses();
    }
  });
}

renderAddresses();
bindEvents();
