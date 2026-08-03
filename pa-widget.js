/* Phil-Am Life Quote widget — external loader build.
   Embed with:  <div id="pa-quote"></div><script src="https://cdn.jsdelivr.net/gh/philaminsurance/life-quoter@main/pa-widget.js" defer></script>  */
(function(){
  if(!document.getElementById('pa-fonts')){
    var l=document.createElement('link');l.id='pa-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Dosis:wght@600;700&family=Metrophobic&display=swap';
    document.head.appendChild(l);
  }
})();

(function () {
  var ROOT = document.getElementById("pa-quote");

  /* ---- REAL Final Expense rate engine (monthly premium at $10k, TX, female non-tobacco) ---- */
  var FE = [
    { id:"moo", name:"Mutual of Omaha", product:"Living Promise", modal:0.089, statesNA:["NY"],
      tiers:{ Level:{min:45,max:85,minFace:2000,maxFace:50000,fee:36,tobF:1.41,aF:{55:27.71,65:41.01,75:72.41},aM:{55:35.95,65:56.48,75:99.97}},
              Graded:{min:45,max:80,minFace:2000,maxFace:20000,fee:12,noTob:1,statesNA:["AR","MT","NC"],aF:{55:33.74,65:49.93,75:88.16},mF:1.371}}},
    { id:"amc", name:"Americo", product:"Eagle Select", modal:0.095, statesNA:["NY"],
      tiers:{ Level:{min:50,max:85,minFace:2000,maxFace:30000,fee:40,tobF:1.70,aF:{55:29.59,65:41.63,75:72.40},aM:{55:35.94,65:54.15,75:97.10}}}},
    { id:"tra", name:"Transamerica", product:"Immediate Solution", modal:0.086, statesNA:["NY"],
      tiers:{ Level:{min:50,max:85,minFace:1000,maxFace:50000,fee:42,tobF:1.54,aF:{55:27.60,65:40.77,75:70.94},aM:{55:35.76,65:53.97,75:97.30}}}},
    { id:"aet", name:"Aetna / CVS Health", product:"Accendo", modal:0.0875, statesNA:["NY"],
      tiers:{ Level:{min:45,max:89,minFace:2000,maxFace:50000,fee:40,tobF:1.36,aF:{55:34.39,65:47.60,75:75.86},aM:{55:44.10,65:58.19,75:101.41}}}},
    { id:"lba", name:"Liberty Bankers", product:"SIMPL", modal:0.0925, statesNA:["NY"],
      tiers:{ Level:{min:45,max:85,minFace:2000,maxFace:40000,fee:50,tobF:1.56,aF:{55:30.91,65:44.95,75:81.58},aM:{55:38.59,65:58.00,75:103.02}}}},
    { id:"for", name:"Foresters", product:"PlanRight", modal:0.0833, statesNA:[],
      tiers:{ Level:{min:50,max:85,minFace:5000,maxFace:35000,fee:38,tobF:1.55,aF:{55:32.47,65:43.38,75:82.13},aM:{55:39.25,65:57.72,75:109.38}},
              Graded:{min:50,max:85,minFace:5000,maxFace:35000,fee:38,tobF:1.37,aF:{55:43.79,65:65.52,75:131.67},aM:{55:59.85,65:94.82,75:171.36}}}},
    { id:"cor", name:"Corebridge", product:"Guaranteed Issue", modal:0.0833, statesNA:["NY","ME"],
      tiers:{ GI:{min:50,max:85,minFace:5000,maxFace:25000,fee:0,noTob:1,faceCurve:{10000:1.0,25000:2.745},aF:{55:48.79,65:72.22,75:127.50},mF:1.368}}},
    { id:"rn", name:"Royal Neighbors", product:"Ensured Legacy", modal:0.0833, statesNA:["AL","AK","HI","LA","MA","NH","NY"],
      tiers:{ Level:{min:50,max:85,minFace:5000,maxFace:25000,fee:52,tobF:1.44,aF:{55:27.97,65:41.19,75:71.34},aM:{55:36.19,65:54.38,75:97.31}},
              Graded:{min:50,max:85,minFace:5000,maxFace:25000,fee:52,tobF:1.48,aF:{55:48.02,65:64.29,75:126.93},aM:{55:63.51,65:85.39,75:180.96}},
              GI:{min:50,max:85,minFace:5000,maxFace:25000,fee:52,noTob:1,aF:{55:79.34,65:126.15,75:239.25},aM:{55:102.83,65:159.56,75:313.21}}}},
    { id:"mnl", name:"Manhattan Life", product:"Secure Advantage", modal:0.0833,
      statesNA:["AK","AZ","AR","CA","CT","DE","DC","HI","ID","IL","IA","KS","ME","MD","MA","MI","MN","MO","MT","NE","NH","NJ","NM","NY","ND","OH","OK","OR","PA","RI","VT","VA","WA","WV","WI","WY"],
      tiers:{ Level:{min:45,max:85,minFace:5000,maxFace:25000,fee:31,noTob:1,aF:{55:22.96,65:37.25,75:65.85,82:114.77},aM:{55:28.87,65:49.23,75:88.88}}}}
  ];
  var TIER_LABEL = { Level:"Good health", Graded:"Some health issues", GI:"Guaranteed — no health questions" };
  var STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  function interp(a, age){ var xs=Object.keys(a).map(Number).sort(function(x,y){return x-y;});
    var lo=xs[0], hi=xs[xs.length-1];
    if(age<=lo){var s=(a[xs[1]]-a[lo])/(xs[1]-lo); return Math.max(0.01,a[lo]+s*(age-lo));}
    if(age>=hi){var s=(a[hi]-a[xs[xs.length-2]])/(hi-xs[xs.length-2]); return a[hi]+s*(age-hi);}
    for(var i=0;i<xs.length-1;i++) if(age>=xs[i]&&age<=xs[i+1]){var t=(age-xs[i])/(xs[i+1]-xs[i]); return a[xs[i]]+(a[xs[i+1]]-a[xs[i]])*t;}
  }
  function interpFace(c, f){ var xs=Object.keys(c).map(Number).sort(function(x,y){return x-y;});
    var lo=xs[0], hi=xs[xs.length-1];
    if(f<=lo) return (f/lo)*c[lo];
    if(f>=hi){var s=(c[hi]-c[xs[xs.length-2]])/(hi-xs[xs.length-2]); return c[hi]+s*(f-hi);}
    for(var i=0;i<xs.length-1;i++) if(f>=xs[i]&&f<=xs[i+1]){var t=(f-xs[i])/(xs[i+1]-xs[i]); return c[xs[i]]+(c[xs[i+1]]-c[xs[i]])*t;}
  }
  function money(n){ return "$"+Math.round(n).toLocaleString("en-US"); }
  function money2(n){ return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function priceFE(c, o){ var t=c.tiers[o.tier]; if(!t) return null;
    if(o.age<t.min||o.age>t.max) return null;
    if(o.cov>t.maxFace||o.cov<t.minFace) return null;
    if((c.statesNA||[]).indexOf(o.state)>=0 || (t.statesNA||[]).indexOf(o.state)>=0) return null;
    var g = (o.gender==="M"&&t.aM)?t.aM:t.aF;
    var b = interp(g,o.age);
    if(o.gender==="M"&&!t.aM&&t.mF) b*=t.mF;
    var m;
    if(t.faceCurve){ var m10=b; if(o.tob&&!t.noTob) m10*=(t.tobF||1); m=m10*interpFace(t.faceCurve,o.cov); }
    else { var feeM=(t.fee||0)*c.modal; var ex=b-feeM; if(o.tob&&!t.noTob) ex*=(t.tobF||1); m=ex*(o.cov/10000)+feeM; }
    return { id:c.id, name:c.name, product:c.product, monthly:m };
  }

  /* ---- REAL Term rate engine (iPipeline List Reports, TX; Foresters = Your Term NON-medical) ---- */
  var TERM_G = {sym:1.383,cor:1.436,nam:1.417,moo:1.42,for:1.191};   // male / female
  var TERM_T = {sym:2.647,cor:2.769,nam:2.422,moo:2.46,for:2.679};   // tobacco / non-tobacco
  var TERM_NAME = {moo:"Mutual of Omaha",cor:"Corebridge",for:"Foresters",nam:"North American",sym:"Symetra"};
  var TERM_PROD = {moo:"Term Life Answers",cor:"Select-a-Term",for:"Your Term",nam:"ADDvantage",sym:"SwiftTerm"};
  var TERM_ORDER = ["moo","cor","for","nam","sym"];
  var TERM_DATA = {};
  TERM_DATA["sym"]={10:{35:{100000:9.74,150000:11.85,250000:14.03},45:{100000:15.89,150000:21.07,250000:24.07},55:{100000:26.90,150000:37.59,250000:47.09}},15:{35:{100000:11.38,150000:14.31,250000:17.00},45:{100000:17.79,150000:23.93,250000:30.44},55:{100000:33.40,150000:47.34,250000:57.53}},20:{35:{100000:12.96,250000:19.04},45:{100000:20.76,150000:28.38,250000:35.86},55:{100000:39.76,150000:56.88,250000:76.82}},30:{35:{100000:17.41,250000:29.65},45:{100000:30.63,150000:43.19,250000:56.29},55:{100000:71.79,150000:104.93,250000:150.62}}};
  TERM_DATA["cor"]={10:{35:{100000:11.43,150000:14.03,250000:14.45},45:{100000:16.16,250000:24.62},55:{100000:26.86,150000:37.17,250000:47.10},65:{100000:65.83,150000:95.62,250000:113.65}},15:{35:{100000:11.66,150000:14.36,250000:17.07},45:{100000:18.62,150000:24.80,250000:30.62},55:{100000:33.53,150000:47.17,250000:57.87},65:{100000:79.59,150000:116.26,250000:161.50}},20:{35:{100000:13.30,150000:16.83,250000:18.99},45:{100000:20.70,150000:27.93,250000:35.78},55:{100000:39.55,150000:56.20,250000:76.51},65:{100000:115.37,150000:169.92,250000:229.12}},25:{35:{100000:15.30,150000:19.83,250000:26.81},45:{100000:26.44,150000:36.53,250000:49.41},55:{100000:54.47,150000:78.58,250000:120.04}},30:{35:{100000:18.58,150000:24.75,250000:29.51},45:{100000:30.47,150000:42.58,250000:55.99},55:{100000:71.39,150000:103.96,250000:149.77}}};
  TERM_DATA["nam"]={10:{35:{100000:13.73,150000:17.73,250000:18.48},45:{100000:18.66,150000:25.12,250000:28.60},55:{100000:30.54,150000:42.94,250000:54.78},65:{100000:67.76,150000:98.78,250000:118.36}},15:{35:{100000:13.99,150000:18.13,250000:21.34},45:{100000:20.24,150000:27.50},55:{100000:37.14,150000:52.84,250000:74.14},65:{100000:83.25,150000:122.01,250000:173.58}},20:{35:{100000:15.40,150000:20.24,250000:25.30},45:{100000:23.14,150000:31.86,250000:42.68},55:{100000:45.41,150000:65.25,250000:88.66},65:{100000:120.91,150000:178.51,250000:256.52}},30:{35:{100000:21.03,150000:28.69,250000:33.44},45:{100000:34.85,150000:49.41,250000:69.08},55:{100000:83.34,150000:122.14,250000:172.70}}};
  TERM_DATA["moo"]={10:{35:{100000:14.32,150000:18.79,250000:27.73},45:{100000:19.74,150000:26.92,250000:29.67},55:{100000:34.36,150000:48.85,250000:60.85},65:{100000:81.66,150000:119.80,250000:151.58}},15:{35:{100000:15.52,150000:20.60,250000:30.76},45:{100000:24.73,150000:34.40,250000:38.92},55:{100000:47.86,150000:69.10,250000:76.97},65:{100000:127.32,150000:188.30,250000:222.96}},20:{35:{100000:16.64,150000:22.27,250000:24.51},45:{150000:35.56,250000:47.73},55:{100000:59.81,150000:87.03,250000:102.77},65:{100000:146.24,150000:216.68,250000:301.00}},30:{35:{100000:21.11,150000:28.98,250000:35.48},45:{100000:38.83,150000:55.56,250000:72.03},55:{150000:127.28,250000:187.48}}};
  TERM_DATA["for"]={10:{35:{100000:14.01,150000:17.94,250000:25.82},45:{100000:23.11,150000:31.59,250000:48.57},55:{100000:45.42,150000:65.06,250000:104.35},65:{100000:102.99,150000:151.42}},15:{35:{100000:15.84,150000:20.70,250000:30.41},45:{100000:29.49,150000:41.17,250000:64.54},55:{100000:63.01,150000:91.44,250000:148.32},65:{100000:149.81,150000:221.64}},20:{35:{100000:19.17,150000:25.69,250000:38.72},45:{100000:37.54,150000:53.25,250000:84.66},55:{100000:80.16,150000:117.17,250000:191.19},65:{100000:212.89,150000:316.27}},25:{35:{100000:24.51,150000:33.69,250000:52.07},45:{100000:43.06,150000:61.52,250000:98.44},55:{100000:91.01,150000:133.44,250000:218.32}},30:{35:{100000:28.97,150000:40.39,250000:63.22},45:{100000:51.98,150000:74.91,250000:120.76},55:{100000:97.39,150000:143.02,250000:234.29}}};

  function faceInterp(fm, face){ var xs=Object.keys(fm).map(Number).sort(function(a,b){return a-b;}); var lo=xs[0],hi=xs[xs.length-1];
    if(face<=lo){ if(xs.length<2) return fm[lo]*(face/lo); var s=(fm[xs[1]]-fm[lo])/(xs[1]-lo); return Math.max(1,fm[lo]+s*(face-lo)); }
    if(face>=hi){ var s=(fm[hi]-fm[xs[xs.length-2]])/(hi-xs[xs.length-2]); return fm[hi]+s*(face-hi); }
    for(var i=0;i<xs.length-1;i++) if(face>=xs[i]&&face<=xs[i+1]){ var t=(face-xs[i])/(xs[i+1]-xs[i]); return fm[xs[i]]+(fm[xs[i+1]]-fm[xs[i]])*t; } }
  function priceTerm(cid, o){ var g=TERM_DATA[cid]; if(!g) return null; var tm=g[o.term]; if(!tm) return null;
    var ages=Object.keys(tm).map(Number).sort(function(a,b){return a-b;}); var minA=ages[0], maxA=ages[ages.length-1];
    var capA=(cid==="sym")?60:maxA+5; if(o.age>capA) return null; if(o.age<minA-8) return null;
    function atAge(age){
      if(age<=minA){ var s=(faceInterp(tm[ages[1]],o.face)-faceInterp(tm[minA],o.face))/(ages[1]-minA); return Math.max(1,faceInterp(tm[minA],o.face)+s*(age-minA)); }
      if(age>=maxA){ var s=(faceInterp(tm[maxA],o.face)-faceInterp(tm[ages[ages.length-2]],o.face))/(maxA-ages[ages.length-2]); return faceInterp(tm[maxA],o.face)+s*(age-maxA); }
      for(var i=0;i<ages.length-1;i++) if(age>=ages[i]&&age<=ages[i+1]){ var t=(age-ages[i])/(ages[i+1]-ages[i]); var p0=faceInterp(tm[ages[i]],o.face), p1=faceInterp(tm[ages[i+1]],o.face); return p0+(p1-p0)*t; } }
    var base=atAge(o.age); if(o.gender==="M") base*=TERM_G[cid]; if(o.tob) base*=TERM_T[cid];
    return { id:cid, name:TERM_NAME[cid], product:TERM_PROD[cid], monthly:base }; }

  /* ---------- state ---------- */
  var S = { product:"fe", age:65, gender:"F", tob:false, state:"TX", tier:"Level", cov:10000, term:"20" };

  function scrollToForm(){ var el=document.getElementById("quote"); if(el){ el.scrollIntoView({behavior:"smooth"}); } else { window.location.hash="#quote"; } }

  /* ---------- render ---------- */
  function render(){
    var covMin = S.product==="fe"?2000:(S.product==="term"?100000:10000);
    var covMax = S.product==="fe"?50000:(S.product==="term"?500000:150000);
    var covStep = S.product==="fe"?1000:(S.product==="term"?25000:5000);
    if(S.cov<covMin) S.cov=covMin; if(S.cov>covMax) S.cov=covMax;
    var ageMin = S.product==="term"?25:40, ageMax = S.product==="term"?70:85;
    if(S.age<ageMin) S.age=ageMin; if(S.age>ageMax) S.age=ageMax;

    var results="";
    function resultCards(list, subtitle){
      var s='', best=list[0];
      s+='<div class="pa-hero"><div class="pa-hero-l">Estimated rates from</div><div class="pa-hero-p">'+money2(best.monthly)+'<span>/mo</span></div><div class="pa-hero-s">'+subtitle+'</div></div>';
      s+='<div class="pa-cards">';
      for(var j=0;j<list.length;j++){ var q=list[j];
        s+='<div class="pa-card'+(j===0?" is-best":"")+'"><div class="pa-card-main"><div class="pa-card-name">'+q.name+(j===0?' <span class="pa-badge">Lowest</span>':'')+'</div><div class="pa-card-sub">'+q.product+'</div></div><div class="pa-card-right"><div class="pa-card-price">'+money2(q.monthly)+'<span>/mo</span></div><button class="pa-mini" data-cta="1">Get this rate</button></div></div>';
      }
      return s+'</div>';
    }
    if(S.product==="fe"){
      var list=[]; for(var i=0;i<FE.length;i++){ var q=priceFE(FE[i],{age:S.age,gender:S.gender,tob:S.tob,state:S.state,tier:S.tier,cov:S.cov}); if(q) list.push(q); }
      list.sort(function(a,b){return a.monthly-b.monthly;});
      if(list.length){ results+=resultCards(list, money(S.cov)+' Final Expense · '+list.length+' carrier'+(list.length>1?"s":"")+' available'); }
      else { results+='<div class="pa-none">No match for these details in '+S.state+'. Try a different amount or health option — or <a href="#" data-cta="1">talk to an agent</a>.</div>'; }
    } else if(S.product==="term"){
      var list=[]; for(var i=0;i<TERM_ORDER.length;i++){ var q=priceTerm(TERM_ORDER[i],{age:S.age,gender:S.gender,tob:S.tob,term:parseInt(S.term,10),face:S.cov}); if(q) list.push(q); }
      list.sort(function(a,b){return a.monthly-b.monthly;});
      if(list.length){ results+=resultCards(list, money(S.cov)+' Term · '+S.term+'-year · '+list.length+' carrier'+(list.length>1?"s":"")); }
      else { results+='<div class="pa-none">No match for this age/term. Try adjusting — or <a href="#" data-cta="1">talk to an agent</a>.</div>'; }
    } else {
      results+='<div class="pa-soon"><div class="pa-soon-t">Your exact Whole Life quote is one step away</div><div class="pa-soon-s">We shop your A-rated carriers — Mutual of Omaha, Corebridge, Foresters and more — to build the right permanent policy for '+money(S.cov)+'.</div><button class="pa-cta" data-cta="1">Get my Whole Life quote</button></div>';
    }

    ROOT.innerHTML =
      '<div class="pa-wrap"><style>'+CSS+'</style>'+
      '<div class="pa-head"><div class="pa-eyebrow">Free · No obligation · 2-minute estimate</div><h3 class="pa-title">Check your rate in seconds</h3></div>'+
      '<div class="pa-tabs">'+tab("fe","Final Expense")+tab("term","Term Life")+tab("wl","Whole Life")+'</div>'+
      '<div class="pa-grid">'+
        '<div class="pa-panel">'+
          field("Age", '<div class="pa-row"><input type="range" min="'+ageMin+'" max="'+ageMax+'" value="'+S.age+'" data-k="age"><span class="pa-agev">'+S.age+'</span></div>')+
          field("Gender", toggle("gender",[["F","Female"],["M","Male"]]))+
          field("Tobacco / nicotine", toggle("tob",[[false,"No"],[true,"Yes"]]))+
          (S.product==="fe"?field("Health", toggle("tier",[["Level","Good"],["Graded","Some issues"],["GI","Guaranteed"]])):"")+
          (S.product==="term"?field("Term length", toggle("term",[["10","10"],["15","15"],["20","20"],["30","30"]])):"")+
          field("State", '<select data-k="state">'+STATES.map(function(s){return '<option '+(s===S.state?"selected":"")+'>'+s+'</option>';}).join("")+'</select>')+
          field("Coverage amount", '<div class="pa-cov">'+money(S.cov)+'</div><input type="range" min="'+covMin+'" max="'+covMax+'" step="'+covStep+'" value="'+S.cov+'" data-k="cov">')+
        '</div>'+
        '<div class="pa-results">'+results+'</div>'+
      '</div>'+
      '<div class="pa-foot">Estimates only — not a quote or offer of insurance. Actual rates depend on carrier, state, age, and underwriting. Final Expense &amp; Term figures are cross-validated to live carrier quotes; Whole Life shown after a quick agent quote.</div>'+
      '</div>';

    bind();
  }
  function tab(k,label){ return '<button class="pa-tab'+(S.product===k?" is-on":"")+'" data-tab="'+k+'">'+label+'</button>'; }
  function field(label,inner){ return '<div class="pa-field"><label>'+label+'</label>'+inner+'</div>'; }
  function toggle(key,opts){ return '<div class="pa-toggle">'+opts.map(function(o){var v=o[0];var on=String(S[key])===String(v);return '<button class="pa-tg'+(on?" is-on":"")+'" data-tk="'+key+'" data-tv="'+v+'">'+o[1]+'</button>';}).join("")+'</div>'; }

  function bind(){
    ROOT.querySelectorAll("[data-tab]").forEach(function(b){ b.onclick=function(){ S.product=b.getAttribute("data-tab"); if(S.product==="term"){ S.cov=250000; if(S.age>65)S.age=45; } else if(S.product==="wl"){ S.cov=25000; } else { S.cov=10000; if(S.age<45)S.age=65; } render(); }; });
    ROOT.querySelectorAll("[data-tk]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-tk"); var v=b.getAttribute("data-tv"); if(v==="true")v=true; else if(v==="false")v=false; S[k]=v; render(); }; });
    ROOT.querySelectorAll("[data-k]").forEach(function(el){ el.oninput=function(){ var k=el.getAttribute("data-k"); var v=el.value; if(k==="age"||k==="cov")v=parseInt(v,10); S[k]=v; if(k==="age"||k==="cov"){ var av=ROOT.querySelector(".pa-agev"); var cv=ROOT.querySelector(".pa-cov"); if(k==="age"&&av)av.textContent=S.age; if(k==="cov"&&cv)cv.textContent=money(S.cov); var r=ROOT.querySelector(".pa-results"); render(); } else { render(); } }; el.onchange=el.oninput; });
    ROOT.querySelectorAll("[data-cta]").forEach(function(b){ b.onclick=function(e){ e.preventDefault(); scrollToForm(); }; });
  }

  var CSS =
  ".pa-wrap{--navy:#0B2545;--gold:#F2B01E;--ink:#33414E;--muted:#7A8794;--card:#F7F9FC;--line:#E2E8F0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);max-width:960px;margin:0 auto;}"+
  ".pa-wrap *{box-sizing:border-box;}"+
  ".pa-head{text-align:center;margin-bottom:18px;}.pa-eyebrow{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#B57F0A;font-weight:bold;}.pa-title{font-family:Georgia,'Times New Roman',serif;font-size:30px;color:var(--navy);margin:6px 0 0;}"+
  ".pa-tabs{display:flex;gap:6px;background:var(--card);border:1px solid var(--line);padding:5px;border-radius:10px;max-width:470px;margin:0 auto 18px;}"+
  ".pa-tab{flex:1;border:0;background:transparent;padding:11px 6px;border-radius:7px;cursor:pointer;font-weight:bold;font-size:14px;color:var(--muted);font-family:inherit;}"+
  ".pa-tab.is-on{background:var(--navy);color:#fff;}"+
  ".pa-grid{display:grid;grid-template-columns:300px 1fr;gap:20px;}@media(max-width:760px){.pa-grid{grid-template-columns:1fr;}}"+
  ".pa-panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;}"+
  ".pa-field{margin-bottom:15px;}.pa-field>label{display:block;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:var(--navy);margin-bottom:6px;}"+
  ".pa-row{display:flex;align-items:center;gap:10px;}.pa-agev{font-weight:bold;min-width:28px;text-align:right;color:var(--navy);}"+
  ".pa-toggle{display:flex;gap:6px;flex-wrap:wrap;}.pa-tg{flex:1;min-width:52px;border:1px solid var(--line);background:var(--card);border-radius:8px;padding:10px 6px;cursor:pointer;font-size:13px;font-weight:bold;color:var(--muted);font-family:inherit;}"+
  ".pa-tg.is-on{background:var(--navy);border-color:var(--navy);color:#fff;}"+
  ".pa-wrap select{width:100%;border:1px solid var(--line);border-radius:8px;padding:11px 12px;font-size:15px;background:var(--card);color:var(--ink);font-family:inherit;}.pa-wrap select:focus{outline:none;border-color:var(--gold);background:#fff;}"+
  ".pa-wrap input[type=range]{width:100%;accent-color:var(--gold);}"+
  ".pa-cov{font-family:Georgia,serif;font-weight:bold;font-size:22px;color:var(--navy);margin-bottom:6px;}"+
  ".pa-results{min-width:0;}"+
  ".pa-hero{background:var(--navy);color:#fff;border-radius:12px;padding:22px 26px;margin-bottom:16px;}.pa-hero-l{font-size:13px;color:#D9E3F0;text-transform:uppercase;letter-spacing:.08em;}.pa-hero-p{font-family:Georgia,serif;font-size:38px;font-weight:bold;color:var(--gold);line-height:1.1;margin:2px 0;}.pa-hero-p span{font-size:16px;font-weight:normal;color:#D9E3F0;font-family:Arial;}.pa-hero-s{font-size:13px;color:#D9E3F0;}"+
  ".pa-cards{display:flex;flex-direction:column;gap:10px;}"+
  ".pa-card{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid var(--line);border-top:4px solid var(--gold);border-radius:12px;padding:14px 16px;}"+
  ".pa-card.is-best{box-shadow:0 2px 14px rgba(11,37,69,.10);}"+
  ".pa-card-name{font-family:Georgia,serif;font-weight:bold;font-size:16px;color:var(--navy);}.pa-badge{background:var(--navy);color:var(--gold);font-size:10px;font-weight:bold;padding:2px 8px;border-radius:20px;text-transform:uppercase;margin-left:6px;vertical-align:middle;}"+
  ".pa-card-sub{font-size:12px;color:var(--muted);margin-top:3px;}"+
  ".pa-card-right{text-align:right;flex:none;}.pa-card-price{font-family:Georgia,serif;font-weight:bold;font-size:20px;color:var(--navy);}.pa-card-price span{font-size:11px;color:var(--muted);font-weight:normal;font-family:Arial;}"+
  ".pa-mini{margin-top:6px;border:0;background:var(--gold);color:var(--navy);font-weight:bold;font-size:12px;padding:7px 13px;border-radius:7px;cursor:pointer;font-family:inherit;}.pa-mini:hover{filter:brightness(1.06);}"+
  ".pa-none{background:var(--card);border:1px dashed var(--line);border-radius:12px;padding:24px;text-align:center;color:var(--muted);}.pa-none a{color:var(--navy);font-weight:bold;}"+
  ".pa-soon{background:#fff;border:1px solid var(--line);border-top:4px solid var(--gold);border-radius:14px;padding:28px 22px;text-align:center;}.pa-soon-t{font-family:Georgia,serif;font-size:20px;font-weight:bold;color:var(--navy);}.pa-soon-s{font-size:14px;color:var(--muted);margin:8px 0 18px;line-height:1.5;}"+
  ".pa-cta{border:0;background:var(--gold);color:var(--navy);font-weight:bold;font-size:15px;padding:14px 28px;border-radius:8px;cursor:pointer;font-family:inherit;}.pa-cta:hover{filter:brightness(1.06);}"+
  ".pa-foot{font-size:11px;color:var(--muted);margin-top:16px;line-height:1.5;text-align:center;}"+".pa-wrap{--navy:#00267C;--gold:#FFCE47;font-family:'Metrophobic',Arial,sans-serif;}.pa-title,.pa-cov,.pa-hero-p,.pa-card-name,.pa-card-price,.pa-soon-t{font-family:'Inter',sans-serif;font-weight:800;}.pa-tab,.pa-mini,.pa-cta{font-family:'Dosis',sans-serif;letter-spacing:.03em;}.pa-mini,.pa-cta{border-radius:0;color:#033537;}";

  // Hook for the D.I.M.E. calculator: jump to the quoter with a coverage amount prefilled.
  window.paQuote = { set:function(product, cov){ if(product){ S.product=product; } if(cov){ S.cov=cov; } render(); try{ ROOT.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){} } };
  render();
})();
