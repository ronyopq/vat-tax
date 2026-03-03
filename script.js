// ---------- Shortcuts ----------
const $ = (sel) => document.querySelector(sel);

const formatBDT = (n) => {
  try {
    return n.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 });
  } catch {
    return '৳ ' + (Math.round(n * 100) / 100).toLocaleString('en-US');
  }
};
const parseNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ---------- Theme Toggle ----------
(function initTheme() {
  const key = 'vatTaxTheme';
  const saved = localStorage.getItem(key);
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);

  const btn = $('#themeToggle');
  const refreshIcon = () => {
    const mode = document.documentElement.getAttribute('data-theme');
    btn.innerHTML = mode === 'light' ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-brightness-high"></i>';
    btn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  };
  refreshIcon();
  btn?.addEventListener('click', () => {
    const mode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(key, mode);
    refreshIcon();
  });
})();

// ---------- Preset handler ----------
$('#preset')?.addEventListener('change', (e) => {
  const val = e.target.value;
  if (!val) return;
  const [name, vat, tax] = val.split('|');
  $('#vat').value = vat || '';
  $('#tax').value = tax || '';
  pulse($('#vat')); pulse($('#tax'));
});
function pulse(el) {
  el.style.boxShadow = '0 0 0 0.35rem rgba(0, 234, 255, 0.25)';
  setTimeout(() => el.style.boxShadow = '', 350);
}

// ---------- Base resolver ----------
/*
  mode: 'including_both' | 'excluding_both' | 'excluding_vat'
  amount: user input number
  vat, tax: rate FRACTIONS (0.15 = 15%)
  treatment: 'add' | 'deduct'
*/
function resolveBase(mode, amount, vat, tax, treatment) {
  if (treatment === 'add') {
    if (mode === 'including_both') return amount / (1 + vat + tax);
    if (mode === 'excluding_vat')  return amount / (1 + tax);
    return amount; // excluding_both
  } else {
    // withholding: invoice shows base + VAT; TAX withheld
    if (mode === 'including_both') return amount / (1 + vat);
    if (mode === 'excluding_vat')  return amount;   // practically treat as base given
    return amount; // excluding_both
  }
}

// ---------- Build scenarios (VAT & TAX Deduction view) ----------
/* এখানে ৩টি কার্ডই VAT & TAX Deduction হিসেবে দেখানো হবে (স্ক্রিনশট লজিক):
   Net Payment = Base  */
function buildScenarios(base, vat, tax) {
  const V = base * vat;
  const T = base * tax;

  const inc = {
    bill: base + V + T,
    add_vat: 0, add_tax: 0,
    total: base + V + T,
    less_vat: V, less_tax: T,
    net: base
  };

  const excBoth = {
    bill: base,
    add_tax: T, add_vat: V,
    total: base + V + T,
    less_vat: V, less_tax: T,
    net: base
  };

  const excVat = {
    bill: base + T,
    add_tax: 0, add_vat: V,
    total: base + V + T,
    less_vat: V, less_tax: T,
    net: base
  };

  return { inc, excBoth, excVat, V, T };
}

// ---------- Rendering ----------
function renderScenarioBoardFromForm() {
  const mode = $('#mode').value;
  const amount = parseNum($('#amount').value);
  const vat = parseNum($('#vat').value) / 100;
  const tax = parseNum($('#tax').value) / 100;
  const treatment = document.querySelector('input[name="tax_treatment"]:checked')?.value || 'deduct';

  if (!(amount > 0)) { alert('অনুগ্রহ করে বৈধ অংক দিন।'); return; }
  if (vat < 0 || tax < 0) { alert('VAT/TAX নেগেটিভ হতে পারে না।'); return; }

  const base = resolveBase(mode, amount, vat, tax, treatment);
  renderScenarioBoard(base, vat, tax);
}

function renderScenarioBoard(base, vat, tax) {
  const { inc, excBoth, excVat } = buildScenarios(base, vat, tax);
  const rates = { vr: (vat * 100).toFixed(2) + '%', tr: (tax * 100).toFixed(2) + '%' };

  // Including
  $('#inc_vr').textContent = rates.vr;
  $('#inc_tr').textContent = rates.tr;
  $('#inc_bill').textContent = formatBDT(inc.bill);
  $('#inc_bill2').textContent = formatBDT(inc.bill);
  $('#inc_add_tax').textContent = formatBDT(inc.add_tax);
  $('#inc_add_vat').textContent = formatBDT(inc.add_vat);
  $('#inc_total').textContent = formatBDT(inc.total);
  $('#inc_less_vat').textContent = formatBDT(inc.less_vat);
  $('#inc_less_tax').textContent = formatBDT(inc.less_tax);
  $('#inc_net').textContent = formatBDT(inc.net);

  // Excluding both
  $('#exc_both_vr').textContent = rates.vr;
  $('#exc_both_tr').textContent = rates.tr;
  $('#exc_both_bill').textContent = formatBDT(excBoth.bill);
  $('#exc_both_bill2').textContent = formatBDT(excBoth.bill);
  $('#exc_both_add_tax').textContent = formatBDT(excBoth.add_tax);
  $('#exc_both_add_vat').textContent = formatBDT(excBoth.add_vat);
  $('#exc_both_total').textContent = formatBDT(excBoth.total);
  $('#exc_both_less_vat').textContent = formatBDT(excBoth.less_vat);
  $('#exc_both_less_tax').textContent = formatBDT(excBoth.less_tax);
  $('#exc_both_net').textContent = formatBDT(excBoth.net);

  // Excluding VAT
  $('#exc_vat_vr').textContent = rates.vr;
  $('#exc_vat_tr').textContent = rates.tr;
  $('#exc_vat_bill').textContent = formatBDT(excVat.bill);
  $('#exc_vat_bill2').textContent = formatBDT(excVat.bill);
  $('#exc_vat_add_tax').textContent = formatBDT(excVat.add_tax);
  $('#exc_vat_add_vat').textContent = formatBDT(excVat.add_vat);
  $('#exc_vat_total').textContent = formatBDT(excVat.total);
  $('#exc_vat_less_vat').textContent = formatBDT(excVat.less_vat);
  $('#exc_vat_less_tax').textContent = formatBDT(excVat.less_tax);
  $('#exc_vat_net').textContent = formatBDT(excVat.net);

  // Show & announce
  $('#resultBoard').classList.remove('d-none');
  $('#liveRegion').textContent = `ফলাফল প্রস্তুত। বেস ${Math.round(base)} টাকা, ভ্যাট ${(base*vat).toFixed(0)} টাকা, ট্যাক্স ${(base*tax).toFixed(0)} টাকা।`;
}

// Hook submit + reset
$('#calcForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  renderScenarioBoardFromForm();
});
$('#resetBtn')?.addEventListener('click', () => {
  $('#calcForm').reset();
  $('#preset').value = '';
  $('#resultBoard')?.classList.add('d-none');
});

// ---------- Copy / Export ----------
$('#btnCopy')?.addEventListener('click', () => {
  const t = collectBoardText();
  navigator.clipboard.writeText(t).then(() => toast('ফলাফল কপি হয়েছে ✅')).catch(() => alert('কপি করা গেল না 😕'));
});
$('#btnCsv')?.addEventListener('click', () => {
  const csv = collectBoardCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vat_tax_scenarios.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV ডাউনলোড শুরু হয়েছে 📥');
});
$('#btnPdf')?.addEventListener('click', () => window.print());

function collectBoardText() {
  const rows = [
    // Including
    '[INCLUDING VAT & TAX]',
    'Bill amount: ' + $('#inc_bill2').textContent,
    'Add: TAX ' + $('#inc_add_tax').textContent + ', VAT ' + $('#inc_add_vat').textContent,
    'Total: ' + $('#inc_total').textContent,
    'Less: VAT ' + $('#inc_less_vat').textContent + ', TAX ' + $('#inc_less_tax').textContent,
    'Net Payment: ' + $('#inc_net').textContent,
    '',
    // Excluding both
    '[EXCLUDING VAT & TAX]',
    'Bill amount: ' + $('#exc_both_bill2').textContent,
    'Add: TAX ' + $('#exc_both_add_tax').textContent + ', VAT ' + $('#exc_both_add_vat').textContent,
    'Total: ' + $('#exc_both_total').textContent,
    'Less: VAT ' + $('#exc_both_less_vat').textContent + ', TAX ' + $('#exc_both_less_tax').textContent,
    'Net Payment: ' + $('#exc_both_net').textContent,
    '',
    // Excluding VAT
    '[EXCLUDING VAT]',
    'Bill amount: ' + $('#exc_vat_bill2').textContent,
    'Add: TAX ' + $('#exc_vat_add_tax').textContent + ', VAT ' + $('#exc_vat_add_vat').textContent,
    'Total: ' + $('#exc_vat_total').textContent,
    'Less: VAT ' + $('#exc_vat_less_vat').textContent + ', TAX ' + $('#exc_vat_less_tax').textContent,
    'Net Payment: ' + $('#exc_vat_net').textContent
  ];
  return rows.join('\n');
}

function collectBoardCSV() {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const header = ['Scenario', 'Field', 'Amount'];
  const lines = [header];

  const pushRows = (name, ids) => {
    ids.forEach(([label, id]) => lines.push([name, label, document.getElementById(id).textContent]));
  };

  pushRows('Including VAT & TAX', [
    ['Bill amount', 'inc_bill2'], ['Add TAX', 'inc_add_tax'], ['Add VAT', 'inc_add_vat'],
    ['Total', 'inc_total'], ['Less VAT', 'inc_less_vat'], ['Less TAX', 'inc_less_tax'],
    ['Net Payment', 'inc_net']
  ]);
  pushRows('Excluding VAT & TAX', [
    ['Bill amount', 'exc_both_bill2'], ['Add TAX', 'exc_both_add_tax'], ['Add VAT', 'exc_both_add_vat'],
    ['Total', 'exc_both_total'], ['Less VAT', 'exc_both_less_vat'], ['Less TAX', 'exc_both_less_tax'],
    ['Net Payment', 'exc_both_net']
  ]);
  pushRows('Excluding VAT', [
    ['Bill amount', 'exc_vat_bill2'], ['Add TAX', 'exc_vat_add_tax'], ['Add VAT', 'exc_vat_add_vat'],
    ['Total', 'exc_vat_total'], ['Less VAT', 'exc_vat_less_vat'], ['Less TAX', 'exc_vat_less_tax'],
    ['Net Payment', 'exc_vat_net']
  ]);

  return lines.map(r => r.map(esc).join(',')).join('\n');
}

// ---------- Tiny toast ----------
function toast(msg = 'Done') {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed',
    bottom: '18px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,.75)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '10px',
    zIndex: 99999,
    fontSize: '14px'
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .25s'; }, 1100);
  setTimeout(() => t.remove(), 1500);
}