// i18n dictionary
const i18n = {
  bn: {
    'site.title':'VAT & TAX ক্যালকুলেটর (বাংলাদেশ)',
    'hero.head':'সহজে VAT & TAX হিসাব করুন',
    'hero.sub':'ক্যাটেগরি বেছে নিন, এমাউন্ট দিন, আর বাকি কাজ আমাদের ক্যালকুলেটর করবে। মোবাইল ও ডেস্কটপ—সব জায়গায় সুন্দরভাবে কাজ করে।',
    'input.title':'ইনপুট','input.category':'ক্যাটেগরি','input.rateSource':'হারের উৎস','input.rateSource.list':'লিস্ট থেকে (ফাইল অনুযায়ী)','input.rateSource.custom':'কাস্টম হার','input.amountType':'পরিমাণের ধরন','input.amountType.base':'বেস এমাউন্ট (VAT/TDS ছাড়া)','input.amountType.incvat':'VAT সহ মোট এমাউন্ট (TDS ছাড়ার আগে)','input.amountType.net':'নেট পেমেন্ট (VAT যোগ, TDS বাদে)','input.amount':'পরিমাণ (Tk)',
    'btn.calculate':'ক্যালকুলেট','btn.reset':'রিসেট','btn.download':'ডাউনলোড (PDF)',
    'result.title':'রেজাল্ট','result.base':'বেস এমাউন্ট','result.gross':'মোট বিল (VAT সহ)','result.net':'নেট পেমেন্ট','result.note':'নোট: এখানে TDS ধরা হয়েছে বেস এমাউন্টের উপর প্রযোজ্য (সাধারণ প্র্যাকটিস)। প্রয়োজনে কাস্টম হার বেছে নিন।',
    'tips.title':'টিপস','tips.t1':'ড্রপডাউনটি সার্চেবল—কেবল টাইপ করুন, দ্রুত ফিল্টার হবে।','tips.t2':'ক্যালকুলেট চাপলেই একটি শান্তিপূর্ণ ও মজার অ্যানিমেশন দেখাবে।','tips.t3':'PDF বাটনে ক্লিক করলে আজকের তারিখসহ পুরো পেইজের স্ক্রিনশট PDF হবে।',
    'footer.copy':'© ২০২৬ VAT & TAX ক্যালকুলেটর · GitHub Pages দিয়ে হোস্টেড'
  },
  en: {
    'site.title':'VAT & TAX Calculator (Bangladesh)',
    'hero.head':'Calculate VAT & TDS in seconds',
    'hero.sub':'Pick a category, enter an amount, and get instant results. Beautiful on mobile and desktop.',
    'input.title':'Input','input.category':'Category','input.rateSource':'Rate Source','input.rateSource.list':'From list (file-based)','input.rateSource.custom':'Custom rates','input.amountType':'Amount Type','input.amountType.base':'Base amount (excl. VAT/TDS)','input.amountType.incvat':'Amount including VAT','input.amountType.net':'Net payment (after TDS)','input.amount':'Amount (Tk)',
    'btn.calculate':'Calculate','btn.reset':'Reset','btn.download':'Download (PDF)',
    'result.title':'Results','result.base':'Base Amount','result.gross':'Gross (incl. VAT)','result.net':'Net Payment','result.note':'Note: TDS is applied on base amount (common practice). Switch to custom to adjust as needed.',
    'tips.title':'Tips','tips.t1':'Dropdown is searchable—just type to filter.','tips.t2':'A soothing, playful animation appears on Calculate.','tips.t3':'PDF button saves a dated screenshot of this page.',
    'footer.copy':'© 2026 VAT & TAX Calculator · Hosted on GitHub Pages'
  }
};

function setLang(lang){
  localStorage.setItem('lang', lang);
  document.documentElement.lang = (lang==='bn'?'bn':'en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const str = (i18n[lang] && i18n[lang][key]) || i18n.bn[key] || i18n.en[key] || el.textContent;
    el.textContent = str;
  });
  // Toggle button highlight
  document.getElementById('btnBN').classList.toggle('active', lang==='bn');
  document.getElementById('btnEN').classList.toggle('active', lang==='en');
}

async function loadRates(){
  const res = await fetch('data/rates.json');
  return res.json();
}

function round2(x){ return Math.round((x + Number.EPSILON) * 100) / 100; }

function compute(type, amount, vat, tax){
  const v = vat/100.0; const t = tax/100.0;
  let base;
  if(type==='base') base = amount;
  else if(type==='inc_vat') base = amount / (1+v);
  else if(type==='net') base = amount / (1+v - t);
  const vatTk = base * v;
  const taxTk = base * t; // TDS on base
  const gross = base + vatTk;
  const net = gross - taxTk;
  return { base:round2(base), vatTk:round2(vatTk), taxTk:round2(taxTk), gross:round2(gross), net:round2(net) };
}

function animateNumbers(values){
  const targets = [
    {id:'baseOut', val:values.base},
    {id:'vatOut', val:values.vatTk},
    {id:'taxOut', val:values.taxTk},
    {id:'grossOut', val:values.gross},
    {id:'netOut', val:values.net}
  ];
  targets.forEach(t=>{
    const el = document.getElementById(t.id);
    const from = Number(el.textContent.replace(/[^0-9.]/g,'')) || 0;
    anime({ targets:{n:from}, n:t.val, duration:1000, easing:'easeOutExpo', update:anim=>{ el.textContent = anim.animations[0].currentValue.toFixed(2); } });
  });
}

function rippleAndConfetti(){
  const ov = document.getElementById('effect-overlay');
  ov.classList.add('show');
  setTimeout(()=>ov.classList.remove('show'), 900);
  // Confetti burst
  if(window.confetti){
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.2 } });
    setTimeout(()=>confetti({ particleCount: 80, angle: 120, spread: 60, origin:{ x:0.1, y:0.6 }}), 250);
    setTimeout(()=>confetti({ particleCount: 80, angle: 60, spread: 60, origin:{ x:0.9, y:0.6 }}), 350);
  }
}

function makePDF(){
  const { jsPDF } = window.jspdf;
  const d = new Date();
  const site = location.href;
  const title = document.getElementById('siteTitle').textContent;
  html2canvas(document.body, {scale:2, useCORS:true, backgroundColor:'#070b14'}).then(canvas=>{
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p','mm','a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Header
    pdf.setFontSize(12);
    pdf.text(`${title}`, 10, 10);
    pdf.setFontSize(9);
    pdf.text(`${site}`, 10, 16);
    pdf.text(`${d.toLocaleString()}`, 10, 22);
    // Image sizing
    const imgWidth = pageWidth - 20; // 10mm margin
    const imgHeight = imgWidth * (canvas.height/canvas.width);
    pdf.addImage(imgData, 'PNG', 10, 28, imgWidth, imgHeight);
    pdf.save('vat_tax_calculator.pdf');
  });
}

(async function init(){
  // Language setup
  const stored = localStorage.getItem('lang');
  setLang(stored || 'bn');
  document.getElementById('btnBN').addEventListener('click',()=>setLang('bn'));
  document.getElementById('btnEN').addEventListener('click',()=>setLang('en'));

  // Background particles (simple orbs moving)
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  window.addEventListener('resize', resize); resize();
  const orbs = Array.from({length:18}, ()=>({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: 40+Math.random()*80, s: .2+Math.random()*.6,
    c: `hsla(${Math.random()*360},70%,50%,.08)`
  }));
  (function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    orbs.forEach(o=>{ ctx.beginPath(); ctx.fillStyle=o.c; ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill(); o.x+=Math.sin(o.y*0.002)*o.s; o.y+=Math.cos(o.x*0.002)*o.s; if(o.x<-100) o.x=canvas.width+100; if(o.x>canvas.width+100) o.x=-100; if(o.y<-100) o.y=canvas.height+100; if(o.y>canvas.height+100) o.y=-100; });
    requestAnimationFrame(loop);
  })();

  const rateSrc = document.getElementById('rateSource');
  const vatInp = document.getElementById('vat');
  const taxInp = document.getElementById('tax');
  const amountType = document.getElementById('amountType');
  const amountInp = document.getElementById('amount');
  const out = { base: document.getElementById('baseOut'), vat: document.getElementById('vatOut'), tax: document.getElementById('taxOut'), gross: document.getElementById('grossOut'), net: document.getElementById('netOut') };

  // Load rates and build searchable dropdown (Choices.js)
  const data = await loadRates();
  const catSelect = document.getElementById('category');
  data.forEach(r=>{
    const opt = document.createElement('option');
    opt.value = JSON.stringify(r); opt.textContent = r.item; catSelect.appendChild(opt);
  });
  const choices = new Choices(catSelect, { searchEnabled: true, itemSelectText:'', shouldSort: false, placeholderValue: 'Select...', searchResultLimit: 50 });

  function setRatesFromCategory(){
    if(rateSrc.value==='custom'){ vatInp.disabled=false; taxInp.disabled=false; return; }
    const v = choices.getValue(true); // raw value
    if(!v){ vatInp.value=''; taxInp.value=''; return; }
    try{ const r = JSON.parse(v); vatInp.value = r.vat_rate ?? ''; taxInp.value = r.tax_rate ?? ''; vatInp.disabled = true; taxInp.disabled = true; } catch(e){}
  }
  catSelect.addEventListener('change', setRatesFromCategory);
  rateSrc.addEventListener('change', ()=>{ const custom = rateSrc.value==='custom'; vatInp.disabled=!custom; taxInp.disabled=!custom; });

  function doCalc(){
    const type = amountType.value; const amt = parseFloat(amountInp.value||'0'); const vat = parseFloat(vatInp.value||'0'); const tax = parseFloat(taxInp.value||'0');
    const res = compute(type, amt, vat, tax);
    animateNumbers(res);
    rippleAndConfetti();
  }

  document.getElementById('calcBtn').addEventListener('click', doCalc);
  document.getElementById('resetBtn').addEventListener('click', ()=>{ amountInp.value=1000; choices.removeActiveItems(); vatInp.value=''; taxInp.value=''; setRatesFromCategory(); animateNumbers({base:0,vatTk:0,taxTk:0,gross:0,net:0}); });
  document.getElementById('pdfBtn').addEventListener('click', makePDF);

  // Initial
  setRatesFromCategory();
  animateNumbers({base:0,vatTk:0,taxTk:0,gross:0,net:0});

  // Parallax tilt on cards
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)/r.height - .5)*-6; // tilt X
      const ry = ((e.clientX - r.left)/r.width - .5)*6; // tilt Y
      card.style.setProperty('--rx', rx+'deg');
      card.style.setProperty('--ry', ry+'deg');
    });
    card.addEventListener('mouseleave', ()=>{ card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
  });
})();
