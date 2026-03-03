// i18n strings
const i18n = {
  bn: {
    'site.title':'বিডি VAT & TAX — ড্যাশবোর্ড',
    'history.title':'হিস্ট্রি', 'history.clear':'ক্লিয়ার',
    'input.category':'ক্যাটেগরি', 'input.rateSource':'হারের উৎস', 'input.rateSource.list':'লিস্ট থেকে', 'input.rateSource.custom':'কাস্টম', 'input.amount':'বিল এমাউন্ট (Tk)', 'input.currency':'কারেন্সি',
    'btn.calculate':'ক্যালকুলেট', 'btn.save':'সেভ', 'btn.pdf':'PDF', 'theme':'থিম',
    'view1.title':'Calculation VAT & TAX (Gross UP) - Please Follow the Rules any Local Bill Amount',
    'view2.title':'Calculation VAT & TAX - Procurement/Vendor',
    'view3.title':'AMOUNT INCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view4.title':'AMOUNT EXCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view5.title':'AMOUNT EXCLUDING VAT — VAT & TAX DEDUCTION',
    'col.base':'বেস ভ্যালু', 'col.total':'মোট', 'col.bill':'বিল এমাউন্ট', 'col.actual':'Actual Pay'
  },
  en: {
    'site.title':'BD VAT & TAX — Dashboard',
    'history.title':'History', 'history.clear':'Clear',
    'input.category':'Category', 'input.rateSource':'Rate Source', 'input.rateSource.list':'From list', 'input.rateSource.custom':'Custom', 'input.amount':'Bill Amount (Tk)', 'input.currency':'Currency',
    'btn.calculate':'Calculate', 'btn.save':'Save', 'btn.pdf':'PDF', 'theme':'Theme',
    'view1.title':'Calculation VAT & TAX (Gross UP) - Please Follow the Rules any Local Bill Amount',
    'view2.title':'Calculation VAT & TAX - Procurement/Vendor',
    'view3.title':'AMOUNT INCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view4.title':'AMOUNT EXCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view5.title':'AMOUNT EXCLUDING VAT — VAT & TAX DEDUCTION',
    'col.base':'Base Value', 'col.total':'Total Amount', 'col.bill':'Bill amount', 'col.actual':'Actual Pay'
  }
};

function setLang(lang){
  localStorage.setItem('lang', lang);
  document.documentElement.lang = (lang==='bn'?'bn':'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    const str=(i18n[lang]&&i18n[lang][key])||i18n.bn[key]||i18n.en[key]||el.textContent;
    el.textContent=str;
  });
  document.getElementById('btnBN').classList.toggle('active', lang==='bn');
  document.getElementById('btnEN').classList.toggle('active', lang==='en');
}

async function loadRates(){
  const res = await fetch('data/rates.json');
  return res.json();
}

function fmt(n){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}); }
function round2(x){ return Math.round((x+Number.EPSILON)*100)/100; }

// Excel-like calculations for 5 views
function calcAll(bill, v, t){
  const V=v/100, T=t/100;
  // View 1: Gross UP (assume entered bill is Base; Total adds both VAT & TAX)
  const v1_base = bill; const v1_vat = v1_base*V; const v1_tax=v1_base*T; const v1_total=v1_base+v1_vat+v1_tax;

  // View 2: Procurement/Vendor
  // Total Amount = base + VAT (invoice total), TAX is withheld on base; Actual Pay = base - TAX
  const v2_vat = bill*V; const v2_tax = bill*T; const v2_total = bill+v2_vat; const v2_actual = bill - v2_tax;

  // View 3: Amount INCLUDING VAT & TAX (input includes VAT)
  const v3_base = bill/(1+V); const v3_vat = bill - v3_base; const v3_tax = v3_base*T; const v3_net = bill - v3_vat - v3_tax;

  // View 4: Amount EXCLUDING VAT & TAX (input excludes both)
  const v4_add_tax = bill*T; const v4_add_vat = bill*V; const v4_total = bill + v4_add_tax + v4_add_vat; const v4_less_vat = v4_add_vat; const v4_less_tax = v4_add_tax; const v4_net = v4_total - v4_less_vat - v4_less_tax; // == bill

  // View 5: Amount EXCLUDING VAT (input excludes only VAT)
  const v5_add_vat = bill*V; const v5_total = bill + v5_add_vat; const v5_less_vat = v5_add_vat; const v5_less_tax = bill*T; const v5_net = bill - v5_less_tax;

  return {
    v1:{base:v1_base, vat:v1_vat, tax:v1_tax, total:v1_total},
    v2:{actual:v2_actual, vat:v2_vat, tax:v2_tax, total:v2_total},
    v3:{bill:bill, vat:v3_vat, tax:v3_tax, net:v3_net, v:v, t:t},
    v4:{bill:bill, add_tax:v4_add_tax, add_vat:v4_add_vat, total:v4_total, less_vat:v4_less_vat, less_tax:v4_less_tax, net:v4_net, v:v, t:t},
    v5:{bill:bill, add_vat:v5_add_vat, total:v5_total, less_vat:v5_less_vat, less_tax:v5_less_tax, net:v5_net, v:v, t:t}
  };
}

function saveHistory(entry){
  const key='vat_tax_history';
  const list = JSON.parse(localStorage.getItem(key)||'[]');
  list.unshift(entry); // push to top
  if(list.length>50) list.pop();
  localStorage.setItem(key, JSON.stringify(list));
}
function loadHistory(){ return JSON.parse(localStorage.getItem('vat_tax_history')||'[]'); }
function clearHistory(){ localStorage.removeItem('vat_tax_history'); }

function renderHistory(cur){
  const list = loadHistory();
  const el = document.getElementById('historyList');
  el.innerHTML='';
  list.forEach((h,idx)=>{
    const div=document.createElement('div'); div.className='hist-item';
    const left=document.createElement('div'); left.innerHTML=`<div><strong>${h.item}</strong> — ${h.amount} @ VAT ${h.v}% | TAX ${h.t}%</div><div class="meta">${new Date(h.ts).toLocaleString()}</div>`;
    const right=document.createElement('div');
    const btn=document.createElement('button'); btn.className='btn'; btn.innerHTML='<i class="fa-solid fa-rotate-right"></i>';
    btn.onclick=()=>{ // reapply
      document.getElementById('amount').value=h.amount; document.getElementById('vat').value=h.v; document.getElementById('tax').value=h.t; calc(); };
    right.appendChild(btn);
    div.appendChild(left); div.appendChild(right);
    el.appendChild(div);
  });
}

function setThemeToggle(){
  const cur = localStorage.getItem('theme')||'auto';
  if(cur==='light' || cur==='dark') document.documentElement.setAttribute('data-theme', cur);
  else { const dark = window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.setAttribute('data-theme', dark?'dark':'light'); }
  document.getElementById('themeToggle').onclick=()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme', next); localStorage.setItem('theme', next);
  };
}

function makePDF(){ const { jsPDF } = window.jspdf; const d=new Date(); const title=document.getElementById('siteTitle').textContent; html2canvas(document.body,{scale:2}).then(canvas=>{ const pdf=new jsPDF('p','mm','a4'); const pageWidth=pdf.internal.pageSize.getWidth(); pdf.setFontSize(12); pdf.text(title,10,10); pdf.setFontSize(9); pdf.text(location.href,10,16); pdf.text(d.toLocaleString(),10,22); const imgW=pageWidth-20; const imgH=imgW*(canvas.height/canvas.width); pdf.addImage(canvas.toDataURL('image/png'),'PNG',10,28,imgW,imgH); pdf.save('bd_vat_tax.pdf'); }); }

async function init(){
  // Language
  setLang(localStorage.getItem('lang')||'bn');
  document.getElementById('btnBN').onclick=()=>setLang('bn');
  document.getElementById('btnEN').onclick=()=>setLang('en');

  setThemeToggle();

  // Load category list
  const rates = await loadRates();
  const cat = document.getElementById('category');
  rates.forEach(r=>{ const opt=document.createElement('option'); opt.value=JSON.stringify(r); opt.textContent=`${r.item_bn} / ${r.item_en}`; cat.appendChild(opt);});
  const choices = new Choices(cat, { searchEnabled:true, shouldSort:false, itemSelectText:'', searchResultLimit:200});

  const rateSrc = document.getElementById('rateSource');
  const vatInp = document.getElementById('vat');
  const taxInp = document.getElementById('tax');
  cat.addEventListener('change', ()=>{
    if(rateSrc.value==='custom') return;
    try{ const r=JSON.parse(choices.getValue(true)); vatInp.value=r.vat_rate; taxInp.value=r.tax_rate; vatInp.disabled=true; taxInp.disabled=true; }catch(e){}
  });
  rateSrc.onchange=()=>{ const custom=rateSrc.value==='custom'; vatInp.disabled=!custom; taxInp.disabled=!custom; };

  document.getElementById('calcBtn').onclick = calc;
  document.getElementById('saveBtn').onclick = ()=>{
    const amt = parseFloat(document.getElementById('amount').value||'0');
    const v = parseFloat(vatInp.value||'0');
    const t = parseFloat(taxInp.value||'0');
    const item = (choices.getValue(true)? JSON.parse(choices.getValue(true)).item_bn : 'Custom');
    saveHistory({amount:amt, v:v, t:t, item:item, ts:Date.now()});
    renderHistory();
  };
  document.getElementById('clearHistory').onclick=()=>{ clearHistory(); renderHistory(); };
  document.getElementById('pdfBtn').onclick=makePDF;

  renderHistory();

  // Set defaults from first item
  if(rates[0]){ vatInp.value=rates[0].vat_rate; taxInp.value=rates[0].tax_rate; }
  calc();
}

function calc(){
  const amt = parseFloat(document.getElementById('amount').value||'0');
  const v = parseFloat(document.getElementById('vat').value||'0');
  const t = parseFloat(document.getElementById('tax').value||'0');
  const cur = document.getElementById('currency').value || '';
  const out = calcAll(amt, v, t);

  // View 1
  document.getElementById('v1_base').textContent = cur+fmt(out.v1.base);
  document.getElementById('v1_vat').textContent  = cur+fmt(out.v1.vat);
  document.getElementById('v1_tax').textContent  = cur+fmt(out.v1.tax);
  document.getElementById('v1_total').textContent= cur+fmt(out.v1.total);

  // View 2
  document.getElementById('v2_actual').textContent = cur+fmt(out.v2.actual);
  document.getElementById('v2_vat').textContent    = cur+fmt(out.v2.vat);
  document.getElementById('v2_tax').textContent    = cur+fmt(out.v2.tax);
  document.getElementById('v2_total').textContent  = cur+fmt(out.v2.total);

  // View 3
  document.getElementById('hdr3_amt').textContent = cur+fmt(amt);
  document.getElementById('hdr3_v').textContent = v.toFixed(2);
  document.getElementById('hdr3_t').textContent = t.toFixed(2);
  document.getElementById('v3_bill').textContent = cur+fmt(out.v3.bill);
  document.getElementById('v3_vat').textContent  = cur+fmt(out.v3.vat);
  document.getElementById('v3_tax').textContent  = cur+fmt(out.v3.tax);
  document.getElementById('v3_net').textContent  = cur+fmt(out.v3.net);

  // View 4
  document.getElementById('hdr4_amt').textContent = cur+fmt(amt);
  document.getElementById('hdr4_v').textContent = v.toFixed(2);
  document.getElementById('hdr4_t').textContent = t.toFixed(2);
  document.getElementById('v4_bill').textContent = cur+fmt(out.v4.bill);
  document.getElementById('v4_add_tax').textContent = cur+fmt(out.v4.add_tax);
  document.getElementById('v4_add_vat').textContent = cur+fmt(out.v4.add_vat);
  document.getElementById('v4_total').textContent   = cur+fmt(out.v4.total);
  document.getElementById('v4_less_vat').textContent = cur+fmt(out.v4.less_vat);
  document.getElementById('v4_less_tax').textContent = cur+fmt(out.v4.less_tax);
  document.getElementById('v4_net').textContent     = cur+fmt(out.v4.net);

  // View 5
  document.getElementById('hdr5_amt').textContent = cur+fmt(amt);
  document.getElementById('hdr5_v').textContent = v.toFixed(2);
  document.getElementById('hdr5_t').textContent = t.toFixed(2);
  document.getElementById('v5_bill').textContent = cur+fmt(out.v5.bill);
  document.getElementById('v5_add_vat').textContent = cur+fmt(out.v5.add_vat);
  document.getElementById('v5_total').textContent   = cur+fmt(out.v5.total);
  document.getElementById('v5_less_vat').textContent = cur+fmt(out.v5.less_vat);
  document.getElementById('v5_less_tax').textContent = cur+fmt(out.v5.less_tax);
  document.getElementById('v5_net').textContent     = cur+fmt(out.v5.net);
}

window.addEventListener('DOMContentLoaded', init);
