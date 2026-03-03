// === i18n ===
const _i18n = {
  bn: {
    'site.title':'বিডি VAT & TAX — ড্যাশবোর্ড',
    'history.title':'হিস্ট্রি','history.clear':'ক্লিয়ার','history.export':'এক্সপোর্ট CSV','history.share':'শেয়ার',
    'input.category':'ক্যাটেগরি','input.rateSource':'হারের উৎস','input.rateSource.list':'লিস্ট থেকে','input.rateSource.custom':'কাস্টম','input.amount':'বিল এমাউন্ট (Tk)','input.currency':'কারেন্সি',
    'btn.calculate':'ক্যালকুলেট','btn.save':'সেভ','btn.pdf':'PDF','btn.report':'রিপোর্ট', 'theme':'থিম',
    'mini.comp':'কম্পোজিশন','mini.compare':'ভিউ তুলনা',
    'view1.title':'Calculation VAT & TAX (Gross UP) - Please Follow the Rules any Local Bill Amount',
    'view2.title':'Calculation VAT & TAX - Procurement/Vendor',
    'view3.title':'AMOUNT INCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view4.title':'AMOUNT EXCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view5.title':'AMOUNT EXCLUDING VAT — VAT & TAX DEDUCTION',
    'col.base':'বেস ভ্যালু','col.total':'মোট','col.bill':'বিল এমাউন্ট','col.actual':'Actual Pay'
  },
  en: {
    'site.title':'BD VAT & TAX — Dashboard',
    'history.title':'History','history.clear':'Clear','history.export':'Export CSV','history.share':'Share',
    'input.category':'Category','input.rateSource':'Rate Source','input.rateSource.list':'From list','input.rateSource.custom':'Custom','input.amount':'Bill Amount (Tk)','input.currency':'Currency',
    'btn.calculate':'Calculate','btn.save':'Save','btn.pdf':'PDF','btn.report':'Report','theme':'Theme',
    'mini.comp':'Composition','mini.compare':'Compare views',
    'view1.title':'Calculation VAT & TAX (Gross UP) - Please Follow the Rules any Local Bill Amount',
    'view2.title':'Calculation VAT & TAX - Procurement/Vendor',
    'view3.title':'AMOUNT INCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view4.title':'AMOUNT EXCLUDING VAT & TAX — VAT & TAX DEDUCTION',
    'view5.title':'AMOUNT EXCLUDING VAT — VAT & TAX DEDUCTION',
    'col.base':'Base Value','col.total':'Total Amount','col.bill':'Bill amount','col.actual':'Actual Pay'
  }
};

function setLang(lang){
  window.localStorage.setItem('lang', lang);
  document.documentElement.lang = (lang==='bn'?'bn':'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const str = (_i18n[lang] && _i18n[lang][key]) || _i18n.bn[key] || _i18n.en[key] || el.textContent;
    el.textContent = str;
  });
  document.getElementById('btnBN')?.classList.toggle('active', lang==='bn');
  document.getElementById('btnEN')?.classList.toggle('active', lang==='en');
}

async function loadRates(){
  const res = await fetch('data/rates.json', {cache:'no-store'});
  return res.ok ? res.json() : [];
}

function fmt(n){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}); }

// Excel-like calculations for 5 views
function calcAll(bill, v, t){
  const V=v/100, T=t/100;
  // View 1: Gross UP (input as Base)
  const v1_base = bill; const v1_vat = v1_base*V; const v1_tax=v1_base*T; const v1_total=v1_base+v1_vat+v1_tax;
  // View 2: Procurement/Vendor
  const v2_vat = bill*V; const v2_tax = bill*T; const v2_total = bill+v2_vat; const v2_actual = bill - v2_tax;
  // View 3: Including VAT
  const v3_base = bill/(1+V); const v3_vat = bill - v3_base; const v3_tax = v3_base*T; const v3_net = bill - v3_vat - v3_tax;
  // View 4: Excluding VAT & TAX
  const v4_add_tax = bill*T; const v4_add_vat = bill*V; const v4_total = bill + v4_add_tax + v4_add_vat; const v4_less_vat = v4_add_vat; const v4_less_tax = v4_add_tax; const v4_net = v4_total - v4_less_vat - v4_less_tax; // = bill
  // View 5: Excluding VAT only
  const v5_add_vat = bill*V; const v5_total = bill + v5_add_vat; const v5_less_vat = v5_add_vat; const v5_less_tax = bill*T; const v5_net = bill - v5_less_tax;
  return { v1:{base:v1_base, vat:v1_vat, tax:v1_tax, total:v1_total}, v2:{actual:v2_actual, vat:v2_vat, tax:v2_tax, total:v2_total}, v3:{bill:bill, vat:v3_vat, tax:v3_tax, net:v3_net}, v4:{bill:bill, add_tax:v4_add_tax, add_vat:v4_add_vat, total:v4_total, less_vat:v4_less_vat, less_tax:v4_less_tax, net:v4_net}, v5:{bill:bill, add_vat:v5_add_vat, total:v5_total, less_vat:v5_less_vat, less_tax:v5_less_tax, net:v5_net} };
}

// history helpers
function saveHistory(entry){ const key='vat_tax_history'; const list = JSON.parse(localStorage.getItem(key)||'[]'); list.unshift(entry); if(list.length>200) list.pop(); localStorage.setItem(key, JSON.stringify(list)); }
function loadHistory(){ return JSON.parse(localStorage.getItem('vat_tax_history')||'[]'); }
function clearHistory(){ localStorage.removeItem('vat_tax_history'); }

function renderHistory(){
  const list = loadHistory();
  const el = document.getElementById('historyList');
  el.innerHTML='';
  list.forEach(h=>{
    const div=document.createElement('div'); div.className='hist-item';
    const left=document.createElement('div'); left.innerHTML=`<div><strong>${h.item}</strong> — ${fmt(h.amount)} @ VAT ${h.v}% | TAX ${h.t}%</div><div class="meta">${new Date(h.ts).toLocaleString()}</div>`;
    const right=document.createElement('div');
    const btn=document.createElement('button'); btn.className='btn'; btn.innerHTML='<i class="fa-solid fa-rotate-right"></i>';
    btn.onclick=()=>{ document.getElementById('amount').value=h.amount; document.getElementById('vat').value=h.v; document.getElementById('tax').value=h.t; calc(); };
    right.appendChild(btn); div.appendChild(left); div.appendChild(right); el.appendChild(div);
  });
}

// Export history CSV
function exportHistoryCSV(){
  const rows = loadHistory();
  const header = ['item','amount','vat','tax','timestamp'];
  const lines = [header.join(',')].concat(rows.map(r=>[`"${(r.item||'').replace('"','\"')}"`, r.amount, r.v, r.t, new Date(r.ts).toISOString()].join(',')));
  const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='vat_tax_history.csv'; a.click(); URL.revokeObjectURL(url);
}

function shareCurrent(){
  const amt = document.getElementById('amount').value; const v=document.getElementById('vat').value; const t=document.getElementById('tax').value;
  const q = new URLSearchParams({ a:amt, v:v, t:t }).toString();
  const link = location.origin+location.pathname+"?"+q;
  if(navigator.share){ navigator.share({title:document.getElementById('siteTitle').textContent, url:link}); } else { navigator.clipboard.writeText(link); alert('Link copied!'); }
}

// mini charts
let donut=null, bar=null;
function updateCharts(out){
  const d = [out.v1.base, out.v1.vat, out.v1.tax];
  if(!donut){ const ctx=document.getElementById('chartDonut'); donut=new Chart(ctx,{type:'doughnut',data:{labels:['Base','VAT','TAX'],datasets:[{data:d,backgroundColor:['#22d3ee','#8b5cf6','#f59e0b']}]},options:{plugins:{legend:{position:'bottom'}}, cutout:'55%'}); } else { donut.data.datasets[0].data=d; donut.update(); }
  const bars=[out.v1.total, out.v2.actual, out.v3.net, out.v4.net, out.v5.net];
  if(!bar){ const ctx2=document.getElementById('chartBar'); bar=new Chart(ctx2,{type:'bar',data:{labels:['GrossUp Total','Actual Pay','Incl. Net','Excl. Net','Excl VAT Net'],datasets:[{data:bars, backgroundColor:'#22d3ee'}]},options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}); } else { bar.data.datasets[0].data=bars; bar.update(); }
}

// PDF report (tabular, reportable)
async function makeReport(out){
  const { jsPDF } = window.jspdf; const doc=new jsPDF('p','mm','a4');
  const title=document.getElementById('siteTitle').textContent; const d=new Date(); doc.setFontSize(14); doc.text(title, 10, 12); doc.setFontSize(10); doc.text(location.href,10,18); doc.text(d.toLocaleString(),10,24);
  const cur=document.getElementById('currency').value||'';
  const sections=[
    {name:'Gross UP', rows:[['Base Value',cur+fmt(out.v1.base)],['VAT',cur+fmt(out.v1.vat)],['TAX',cur+fmt(out.v1.tax)],['Total Amount',cur+fmt(out.v1.total)]]},
    {name:'Procurement/Vendor', rows:[['Actual Pay',cur+fmt(out.v2.actual)],['VAT',cur+fmt(out.v2.vat)],['TAX',cur+fmt(out.v2.tax)],['Total Amount',cur+fmt(out.v2.total)]]},
    {name:'Including VAT & TAX', rows:[['Bill amount',cur+fmt(out.v3.bill)],['VAT',cur+fmt(out.v3.vat)],['TAX',cur+fmt(out.v3.tax)],['Net Payment',cur+fmt(out.v3.net)]]},
    {name:'Excluding VAT & TAX', rows:[['Bill amount',cur+fmt(out.v4.bill)],['Add: TAX',cur+fmt(out.v4.add_tax)],['Add: VAT',cur+fmt(out.v4.add_vat)],['Total',cur+fmt(out.v4.total)],['Less: VAT',cur+fmt(out.v4.less_vat)],['Less: TAX',cur+fmt(out.v4.less_tax)],['Net Payment',cur+fmt(out.v4.net)]]},
    {name:'Excluding VAT', rows:[['Bill amount',cur+fmt(out.v5.bill)],['Add: VAT',cur+fmt(out.v5.add_vat)],['Total',cur+fmt(out.v5.total)],['Less: VAT',cur+fmt(out.v5.less_vat)],['Less: TAX',cur+fmt(out.v5.less_tax)],['Net Payment',cur+fmt(out.v5.net)]]}
  ];
  let y=30;
  sections.forEach((s,idx)=>{
    doc.setFontSize(12); doc.text(`${idx+1}) ${s.name}`,10,y); y+=4;
    doc.autoTable({startY:y, body:s.rows, theme:'grid', styles:{fontSize:10}, margin:{left:10, right:10}});
    y = doc.lastAutoTable.finalY + 6;
    if(y>260){ doc.addPage(); y=20; }
  });
  doc.save('vat_tax_report.pdf');
}

// Global calc + UI binding
async function init(){
  // language
  const lang = localStorage.getItem('lang')||'bn'; setLang(lang);
  document.getElementById('btnBN').onclick=()=>setLang('bn');
  document.getElementById('btnEN').onclick=()=>setLang('en');

  // theme
  document.getElementById('themeToggle').onclick=()=>{ const cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme', cur); localStorage.setItem('theme', cur); };
  const storedTheme = localStorage.getItem('theme'); if(storedTheme){ document.documentElement.setAttribute('data-theme', storedTheme); }

  // load rates
  const rates = await loadRates(); const cat = document.getElementById('category');
  cat.innerHTML=''; rates.forEach(r=>{ const opt=document.createElement('option'); opt.value=JSON.stringify(r); opt.textContent=`${r.item_bn} / ${r.item_en}`; cat.appendChild(opt); });
  // last used category from storage or query
  const params=new URLSearchParams(location.search); const qA=params.get('a'); const qV=params.get('v'); const qT=params.get('t');
  const lastCat = localStorage.getItem('last_category');
  if(lastCat){ for(const o of cat.options){ try{ if(JSON.parse(o.value).item_bn===lastCat){ o.selected=true; break; } }catch(e){} } }
  const choices = new Choices(cat, { searchEnabled:true, shouldSort:false, itemSelectText:'', searchResultLimit:200 });

  const rateSrc = document.getElementById('rateSource'); const vatInp=document.getElementById('vat'); const taxInp=document.getElementById('tax');

  function setRatesFromCategory(){
    if(rateSrc.value==='custom'){ vatInp.disabled=false; taxInp.disabled=false; return; }
    const raw = choices.getValue(true) || cat.value; if(!raw){ vatInp.value=''; taxInp.value=''; return; }
    const r = JSON.parse(raw); vatInp.value=r.vat_rate; taxInp.value=r.tax_rate; vatInp.disabled=true; taxInp.disabled=true; localStorage.setItem('last_category', r.item_bn);
  }

  cat.addEventListener('change', setRatesFromCategory); rateSrc.addEventListener('change', setRatesFromCategory);

  // set defaults
  if(rates[0] && !lastCat){ vatInp.value=rates[0].vat_rate; taxInp.value=rates[0].tax_rate; }
  if(qV) vatInp.value=qV; if(qT) taxInp.value=qT; if(qA) document.getElementById('amount').value=qA;

  function calc(){
    const amt=parseFloat(document.getElementById('amount').value||'0'); const v=parseFloat(vatInp.value||'0'); const t=parseFloat(taxInp.value||'0'); const cur=document.getElementById('currency').value||'';
    const out = calcAll(amt, v, t);
    // Fill redesigned views
    document.getElementById('hdr1_base').textContent=cur+fmt(out.v1.base); document.getElementById('hdr1_v').textContent=v.toFixed(2); document.getElementById('hdr1_t').textContent=t.toFixed(2);
    document.getElementById('v1_base').textContent=cur+fmt(out.v1.base); document.getElementById('v1_vat').textContent=cur+fmt(out.v1.vat); document.getElementById('v1_tax').textContent=cur+fmt(out.v1.tax); document.getElementById('v1_total').textContent=cur+fmt(out.v1.total);
    document.getElementById('hdr2_base').textContent=cur+fmt(amt); document.getElementById('hdr2_v').textContent=v.toFixed(2); document.getElementById('hdr2_t').textContent=t.toFixed(2);
    document.getElementById('v2_actual').textContent=cur+fmt(out.v2.actual); document.getElementById('v2_vat').textContent=cur+fmt(out.v2.vat); document.getElementById('v2_tax').textContent=cur+fmt(out.v2.tax); document.getElementById('v2_total').textContent=cur+fmt(out.v2.total);
    document.getElementById('hdr3_amt').textContent=cur+fmt(amt); document.getElementById('hdr3_v').textContent=v.toFixed(2); document.getElementById('hdr3_t').textContent=t.toFixed(2);
    document.getElementById('v3_bill').textContent=cur+fmt(out.v3.bill); document.getElementById('v3_vat').textContent=cur+fmt(out.v3.vat); document.getElementById('v3_tax').textContent=cur+fmt(out.v3.tax); document.getElementById('v3_net').textContent=cur+fmt(out.v3.net);
    document.getElementById('hdr4_amt').textContent=cur+fmt(amt); document.getElementById('hdr4_v').textContent=v.toFixed(2); document.getElementById('hdr4_t').textContent=t.toFixed(2);
    document.getElementById('v4_bill').textContent=cur+fmt(out.v4.bill); document.getElementById('v4_add_tax').textContent=cur+fmt(out.v4.add_tax); document.getElementById('v4_add_vat').textContent=cur+fmt(out.v4.add_vat); document.getElementById('v4_total').textContent=cur+fmt(out.v4.total); document.getElementById('v4_less_vat').textContent=cur+fmt(out.v4.less_vat); document.getElementById('v4_less_tax').textContent=cur+fmt(out.v4.less_tax); document.getElementById('v4_net').textContent=cur+fmt(out.v4.net);
    document.getElementById('hdr5_amt').textContent=cur+fmt(amt); document.getElementById('hdr5_v').textContent=v.toFixed(2); document.getElementById('hdr5_t').textContent=t.toFixed(2);
    document.getElementById('v5_bill').textContent=cur+fmt(out.v5.bill); document.getElementById('v5_add_vat').textContent=cur+fmt(out.v5.add_vat); document.getElementById('v5_total').textContent=cur+fmt(out.v5.total); document.getElementById('v5_less_vat').textContent=cur+fmt(out.v5.less_vat); document.getElementById('v5_less_tax').textContent=cur+fmt(out.v5.less_tax); document.getElementById('v5_net').textContent=cur+fmt(out.v5.net);
    updateCharts(out);
    return out;
  }

  // actions
  document.getElementById('calcBtn').onclick = ()=>{ const out=calc(); };
  document.getElementById('saveBtn').onclick = ()=>{
    const itemRaw = choices.getValue(true) || cat.value; const r = itemRaw? JSON.parse(itemRaw): {item_bn:'Custom'};
    const entry={ item:r.item_bn, amount:parseFloat(document.getElementById('amount').value||'0'), v:parseFloat(vatInp.value||'0'), t:parseFloat(taxInp.value||'0'), ts:Date.now() };
    saveHistory(entry); renderHistory();
  };
  document.getElementById('pdfBtn').onclick = async ()=>{ const out=calc(); const { jsPDF } = window.jspdf; const d=new Date(); const title=document.getElementById('siteTitle').textContent; const canvas=await html2canvas(document.body,{scale:2}); const pdf=new jsPDF('p','mm','a4'); const w=pdf.internal.pageSize.getWidth(); pdf.setFontSize(12); pdf.text(title,10,10); pdf.setFontSize(9); pdf.text(location.href,10,16); pdf.text(d.toLocaleString(),10,22); const imgW=w-20; const imgH=imgW*(canvas.height/canvas.width); pdf.addImage(canvas.toDataURL('image/png'),'PNG',10,28,imgW,imgH); pdf.save('bd_vat_tax.pdf'); };
  document.getElementById('reportBtn').onclick = ()=>{ const out=calc(); makeReport(out); };
  document.getElementById('exportCSV').onclick = exportHistoryCSV;
  document.getElementById('shareLink').onclick = shareCurrent;
  document.getElementById('clearHistory').onclick = ()=>{ clearHistory(); renderHistory(); };

  // initial
  setRatesFromCategory(); renderHistory(); calc();
}

window.addEventListener('DOMContentLoaded', init);
