/* PropSnap landing page: the engine, the tabs, and the calculator. */
(function () {
  'use strict';

  ScrollCraft.mount(document.body);

  /* ---- Tabs follow the reader, like the extension's own chrome ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  var sections = tabs.map(function (t) { return document.getElementById(t.dataset.tab); }).filter(Boolean);
  function markTab() {
    var line = window.innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
    tabs.forEach(function (t) { t.setAttribute('aria-current', String(t.dataset.tab === current.id)); });
  }
  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; markTab(); });
  }, { passive: true });
  markTab();

  /* ---- Calculator: the same 2026/27 tables as the extension -------------
     Copied from PropSnap's src/services/calculators.ts (purchaseTax).
     Check against GOV.UK and the Welsh Revenue Authority each April. */
  var SDLT_STANDARD = [[125000, 0], [250000, 2], [925000, 5], [1500000, 10], [Infinity, 12]];
  var SDLT_FIRST_TIME = [[300000, 0], [500000, 5]];
  var LTT_MAIN = [[225000, 0], [400000, 6], [750000, 7.5], [1500000, 10], [Infinity, 12]];
  var LTT_HIGHER = [[180000, 5], [250000, 8.5], [400000, 10], [750000, 12.5], [1500000, 15], [Infinity, 17]];

  function bands(price, table, extra) {
    var total = 0, from = 0;
    for (var i = 0; i < table.length; i++) {
      if (price <= from) break;
      var to = Math.min(price, table[i][0]);
      total += (to - from) * (table[i][1] + (extra || 0)) / 100;
      from = table[i][0];
    }
    return Math.floor(total);
  }

  function purchaseTax(price, region, buyer) {
    if (region === 'wales') {
      if (buyer === 'additional' && price >= 40000) return { name: 'Land Transaction Tax', total: bands(price, LTT_HIGHER), note: 'Higher rates for an additional property' };
      return { name: 'Land Transaction Tax', total: bands(price, LTT_MAIN), note: buyer === 'first_time' ? 'Wales has no first-time buyer relief' : '' };
    }
    if (buyer === 'first_time') {
      if (price <= 500000) return { name: 'Stamp Duty Land Tax', total: bands(price, SDLT_FIRST_TIME), note: 'First-time buyer relief' };
      return { name: 'Stamp Duty Land Tax', total: bands(price, SDLT_STANDARD), note: 'No first-time buyer relief above £500,000' };
    }
    if (buyer === 'additional' && price >= 40000) return { name: 'Stamp Duty Land Tax', total: bands(price, SDLT_STANDARD, 5), note: 'Includes the 5% surcharge for an additional property' };
    return { name: 'Stamp Duty Land Tax', total: bands(price, SDLT_STANDARD), note: '' };
  }

  var form = document.getElementById('calc');
  var priceEl = document.getElementById('price');
  var rentEl = document.getElementById('rent');
  var money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  var num = function (el) { return Number(String(el.value).replace(/[^0-9.]/g, '')) || 0; };

  function update() {
    var price = num(priceEl), rent = num(rentEl);
    var region = form.querySelector('[name=region]:checked').value;
    var buyer = form.querySelector('[name=buyer]:checked').value;
    var tax = purchaseTax(price, region, buyer);
    document.getElementById('tax-name').textContent = tax.name;
    document.getElementById('tax').textContent = price > 0 ? money.format(tax.total) : '£0';
    document.getElementById('yield').textContent = price > 0 && rent > 0 ? (rent * 12 / price * 100).toFixed(1) + '%' : '0%';
    document.getElementById('tax-note').textContent = tax.note;
  }

  // Keep the thousands separators while typing, without fighting the caret on every key
  function tidy(el) {
    var n = num(el);
    el.value = n ? n.toLocaleString('en-GB') : '';
  }
  [priceEl, rentEl].forEach(function (el) {
    el.addEventListener('input', update);
    el.addEventListener('blur', function () { tidy(el); });
  });
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  update();
})();
