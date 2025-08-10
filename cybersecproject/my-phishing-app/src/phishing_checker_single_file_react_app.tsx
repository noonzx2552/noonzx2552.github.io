import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Download,
  Info,
  Link2,
  ListFilter,
  RotateCw,
  ScanSearch,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X
} from "lucide-react";

// =================== Utility helpers ===================
const riskyTLDs = new Set([
  "zip","mov","click","gq","tk","ml","cf","xyz","top","quest","work","cam","rest","country","fit","men","loan","review","date","party","kim","bar","surf","accountants","bid","racing"
]);

const shorteners = new Set([
  "bit.ly","t.co","tinyurl.com","goo.gl","ow.ly","is.gd","buff.ly","rebrand.ly","cutt.ly","bl.ink","rb.gy","s.id","lnkd.in"
]);

const brandDomains: Record<string,string[]> = {
  google: ["google.com","accounts.google.com","goo.gl"],
  microsoft: ["microsoft.com","live.com","outlook.com","office.com"],
  apple: ["apple.com","icloud.com"],
  paypal: ["paypal.com"],
  facebook: ["facebook.com","fb.com","meta.com"],
  amazon: ["amazon.com"],
  bank: ["scb.co.th","kbank.co.th","krungsri.com","bangkokbank.com","ktb.co.th","uob.co.th"],
};

function normalizeUrl(u: string) {
  try {
    if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
    return new URL(u);
  } catch {
    return null;
  }
}

function extractUrls(text: string): string[] {
  // Match URLs with or without protocol
  const urlRegex = /((https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\:[0-9]{2,5})?(\/[\w#%&@./=?+\-]*)?)/gi;
  const matches = new Set<string>();
  let m;
  while ((m = urlRegex.exec(text)) !== null) matches.add(m[0]);
  return [...matches];
}

function hasNonAscii(str: string) { return /[^\x00-\x7F]/.test(str); }
function isIPv4(host: string) { return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(host); }
function countSubdomains(host: string) { return host.split(".").length - 2; }
function tldOf(host: string) { const p = host.split("."); return p[p.length-1]?.toLowerCase() || ""; }
function baseDomain(host: string) { const parts = host.split("."); return parts.length<=2?host.toLowerCase():parts.slice(-2).join(".").toLowerCase(); }

function textSignals(text: string) {
  const lc = text.toLowerCase();
  const signals: string[] = [];
  const keywords = [
    "urgent","immediately","limited time","verify your account","reset your password","security alert","suspended","unusual activity","confirm your identity","unlock","otp","gift card","invoice","payment failed","click the link","download attachment"
  ];
  keywords.forEach(k => { if (lc.includes(k)) signals.push(`พบคำเร่งเร้า/ชวนเชื่อ: "${k}"`); });
  const thaiKeywords = ["ด่วน","รีเซ็ตรหัสผ่าน","ตรวจสอบบัญชี","บัญชีถูกระงับ","กิจกรรมที่น่าสงสัย","ยืนยันตัวตน","ของขวัญ","บัตรของขวัญ","ชำระเงิน","โอนเงิน","กดลิงก์"]; 
  thaiKeywords.forEach(k => { if (lc.includes(k)) signals.push(`พบคำต้องสงสัย: "${k}"`); });
  if (/javascript:\/\//i.test(lc)) signals.push("ลิงก์ใช้ javascript: scheme (อาจโจมตี XSS)");
  if (/data:\s*text\/html/i.test(lc)) signals.push("อาจมี data: URL ฝัง HTML");
  if (/\u200B|\u200C|\u200D|\uFEFF/.test(text)) signals.push("ตรวจพบ Zero-width char (ซ่อนตัวอักษร)");
  return signals;
}

function domainLooksLikeBrandMismatch(host: string, text: string) {
  const lcText = text.toLowerCase();
  const bad: string[] = [];
  for (const brand of Object.keys(brandDomains)) {
    if (lcText.includes(brand)) {
      const ok = new Set(brandDomains[brand].map(d=>d.toLowerCase()));
      if (!ok.has(baseDomain(host))) bad.push(`อ้างถึงแบรนด์ "${brand}" แต่โดเมนคือ ${host}`);
    }
  }
  return bad;
}

function urlSignals(u: URL, _raw: string, fullText: string) {
  const host = u.hostname; const bd = baseDomain(host);
  const signals: string[] = [];
  if (host.includes("@")) signals.push("โดเมนมี '@' ผิดปกติ");
  if (u.port) signals.push(`ใช้พอร์ตที่ระบุ (${u.port})`);
  if (hasNonAscii(host)) signals.push("โดเมนมีตัว Unicode อาจเป็น homograph");
  if (host.startsWith("xn--")) signals.push("โดเมนเป็น Punycode (xn--)");
  if (isIPv4(host)) signals.push("ใช้ IP แทนโดเมน");
  const subs = countSubdomains(host); if (subs>=3) signals.push(`ซับโดเมนยาวผิดปกติ (${subs} ชั้น)`);
  const tld = tldOf(host); if (riskyTLDs.has(tld)) signals.push(`TLD เสี่ยง: .${tld}`);
  if (shorteners.has(bd)) signals.push("ลิงก์ย่อ (shortener) ซ่อนที่หมายจริง");
  if (/login|verify|secure|confirm|account|update|payment|invoice|token|session|redirect|url=|id=|otp=/i.test(u.href)) signals.push("พาธ/พารามิเตอร์อ่อนไหว (login/verify/...)");
  if (/-/.test(bd)) signals.push("โดเมนมีขีดกลาง อาจเลียนแบบแบรนด์");
  signals.push(...domainLooksLikeBrandMismatch(host, fullText));
  return signals;
}

// score with adjustable weights
type Weights = { text: number; urlSevere: number; urlMedium: number; urlMild: number };

// Category types
 type UrlCategory = 'trusted' | 'malicious' | 'risky' | 'ok';
const defaultWeights: Weights = { text: 5, urlSevere: 15, urlMedium: 10, urlMild: 6 };

function scoreFromSignals(textFlags: string[], urlFlags: string[][], w: Weights) {
  let score = 0;
  score += textFlags.length * w.text;
  urlFlags.forEach(flags => flags.forEach(f => {
    if (/Punycode|Unicode|homograph|IP|shortener|แบรนด์|ซับโดเมน/i.test(f)) score += w.urlSevere;
    else if (/TLD|login|verify|confirm|พอร์ต/i.test(f)) score += w.urlMedium;
    else score += w.urlMild;
  }));
  return Math.min(100, Math.round(score));
}

function riskLabel(score: number) {
  if (score >= 70) return { label: "เสี่ยงสูง", color: "bg-red-500", hint: "อย่าคลิกหรือกรอกข้อมูลส่วนตัว" };
  if (score >= 40) return { label: "เสี่ยงปานกลาง", color: "bg-amber-500", hint: "ตรวจสอบผู้ส่งและโดเมนให้แน่ใจ" };
  return { label: "เสี่ยงต่ำ", color: "bg-emerald-500", hint: "ยังควรระวังและตรวจสอบแหล่งที่มา" };
}

// persist helpers
const loadSet = (k: string) => new Set<string>(JSON.parse(localStorage.getItem(k) || "[]"));
const saveSet = (k: string, s: Set<string>) => localStorage.setItem(k, JSON.stringify([...s]));

// =================== Main Component ===================
export default function App() {
  const [input, setInput] = useState("");
  const [weights, setWeights] = useState<Weights>(() => {
    const raw = localStorage.getItem("pc_weights");
    return raw ? JSON.parse(raw) : defaultWeights;
  });
  const [whitelist, setWhitelist] = useState<Set<string>>(()=>loadSet("pc_whitelist"));
  const [blacklist, setBlacklist] = useState<Set<string>>(()=>loadSet("pc_blacklist"));
  const [filter, setFilter] = useState<'all'|'trusted'|'mal'|'risky'|'clean'>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ localStorage.setItem("pc_weights", JSON.stringify(weights)); },[weights]);
  useEffect(()=>{ saveSet("pc_whitelist", whitelist); },[whitelist]);
  useEffect(()=>{ saveSet("pc_blacklist", blacklist); },[blacklist]);

  // drag & drop
  useEffect(()=>{
    const el = dropRef.current; if (!el) return;
    const prevent = (e: DragEvent)=>{ e.preventDefault(); e.stopPropagation(); };
    const handleDrop = async (e: DragEvent)=>{
      prevent(e);
      const f = e.dataTransfer?.files?.[0]; if (!f) return;
      const text = await f.text(); setInput(prev => (prev ? prev+"\n\n" : "") + text);
    };
    el.addEventListener('dragover', prevent);
    el.addEventListener('drop', handleDrop);
    return ()=>{
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('drop', handleDrop);
    };
  },[]);

  const urls = useMemo(()=> extractUrls(input), [input]);
  const textFlags = useMemo(()=> input? textSignals(input): [], [input]);

  type UrlAnalysis = { raw: string; ok: boolean; url?: string; host?: string; basedomain?: string; tld?: string; flags: string[]; error?: string; score: number; category: UrlCategory };

  const urlAnalyses: UrlAnalysis[] = useMemo(()=>{
    return urls.map(raw => {
      const u = normalizeUrl(raw);
      if (!u) return { raw, ok:false, flags:[], error:"URL ไม่ถูกต้อง", score:0, category: 'ok' };
      const flags = urlSignals(u, raw, input);
      const bd = baseDomain(u.hostname);
      let category: UrlCategory = 'ok';
      if (whitelist.has(bd)) { flags.push("อยู่ในรายการอนุญาต (Whitelist)"); category = 'trusted'; }
      if (blacklist.has(bd)) { flags.push("อยู่ในบัญชีดำ (Blacklist)"); category = 'malicious'; }
      const tmpScore = scoreFromSignals([], [flags], weights);
      if (category==='ok') {
        if (tmpScore >= 70) category = 'malicious';
        else if (tmpScore >= 40) category = 'risky';
        else category = 'ok';
      }
      return { raw, ok:true, url: u.href, host: u.hostname, basedomain: bd, tld: tldOf(u.hostname), flags, score: tmpScore, category };
    });
  }, [urls, input, whitelist, blacklist, weights]);

  const totalScore = useMemo(()=>{
    // combine text + top risky urls
    const score = scoreFromSignals(textFlags, urlAnalyses.map(a=>a.flags), weights);
    return score;
  }, [textFlags, urlAnalyses, weights]);

  const risk = useMemo(()=>riskLabel(totalScore), [totalScore]);

  const filtered = useMemo(()=>{
    if (filter==='all') return urlAnalyses;
    if (filter==='mal') return urlAnalyses.filter(u=>u.category==='malicious');
    if (filter==='trusted') return urlAnalyses.filter(u=>u.category==='trusted');
    if (filter==='risky') return urlAnalyses.filter(u=>u.category==='risky');
    return urlAnalyses.filter(u=>u.category==='ok');
  },[filter, urlAnalyses]);

  function addToWhitelist(domain: string){
    if (blacklist.has(domain)) return; // mutual-exclusive: if in blacklist, block adding to whitelist
    const s = new Set(whitelist); s.add(domain); setWhitelist(s);
  }
  function addToBlacklist(domain: string){
    if (whitelist.has(domain)) return; // mutual-exclusive: if in whitelist, block adding to blacklist
    const s = new Set(blacklist); s.add(domain); setBlacklist(s);
  }
  function removeFromWhitelist(domain: string){ const s = new Set(whitelist); s.delete(domain); setWhitelist(s); }
  function removeFromBlacklist(domain: string){ const s = new Set(blacklist); s.delete(domain); setBlacklist(s); }

  function handleUpload(ev: React.ChangeEvent<HTMLInputElement>){
    const f = ev.target.files?.[0]; if (!f) return; f.text().then(txt => setInput(prev => (prev? prev+"\n\n" : "") + txt));
    ev.target.value = "";
  }

  function copyAllUrls(){
    const text = urls.join("\n");
    navigator.clipboard.writeText(text);
  }

  function exportCSV(){
    const header = ["url","host","base_domain","tld","flags","score"]; 
    const rows = urlAnalyses.map(u=>[
      JSON.stringify(u.url||u.raw),
      JSON.stringify(u.host||""),
      JSON.stringify(u.basedomain||""),
      JSON.stringify(u.tld||""),
      JSON.stringify(u.flags.join(" | ")), 
      String(u.score)
    ].join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `phishing-report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  function downloadJSON(){
    const report = {
      created_at: new Date().toISOString(),
      summary: { score: totalScore, risk: risk.label, weights },
      text_findings: textFlags,
      urls: urlAnalyses,
      snippet: input.slice(0, 8000),
      whitelist: [...whitelist],
      blacklist: [...blacklist]
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `phishing-report-${new Date().toISOString().slice(0,10)}.json`; a.click();
  }

  function clearAll(){ setInput(""); }

  function autoAddFromSelection(list: 'white'|'black'){
    // add every basedomain from current analyses
    const domains = new Set(urlAnalyses.filter(u=>u.basedomain).map(u=>u.basedomain!));
    if (list==='white') setWhitelist(new Set([...whitelist, ...domains]));
    else setBlacklist(new Set([...blacklist, ...domains]));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3"><ShieldCheck className="w-8 h-8"/> ตัวตรวจจับ Phishing</h1>
              <p className="text-slate-300 mt-1">วางข้อความ/อีเมล หรืออัปโหลดไฟล์ (.txt, .eml, .html) ระบบจะวิเคราะห์สัญญาณเสี่ยงและให้คะแนนแบบออฟไลน์</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer">
                <Upload className="w-4 h-4"/> นำเข้าไฟล์
                <input type="file" accept=".txt,.eml,.html,.log" className="hidden" onChange={handleUpload}/>
              </label>
              <button onClick={()=>setInput(exampleText)} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700"><ScanSearch className="w-4 h-4"/> ใส่ตัวอย่าง</button>
              <button onClick={clearAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700"><RotateCw className="w-4 h-4"/> ล้าง</button>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left: Input */}
          <div className="bg-slate-900/60 rounded-2xl p-4 shadow-lg border border-slate-800" ref={dropRef}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold flex items-center gap-2"><Link2 className="w-5 h-5"/> ข้อความ / อีเมล</h2>
              <div className="flex items-center gap-2">
                <button onClick={copyAllUrls} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm inline-flex items-center gap-2" title="คัดลอก URL ทั้งหมด"><ClipboardCopy className="w-4 h-4"/>คัดลอกลิงก์</button>
              </div>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="วางเนื้อหาอีเมล/ข้อความที่มี URL หรือ ลากไฟล์มาวางที่กรอบนี้..." className="w-full h-72 md:h-80 p-4 rounded-xl bg-slate-950/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-vertical"/>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="text-slate-400">พบ URL: <span className="text-white font-medium">{urls.length}</span></div>
              <div className="flex items-center gap-2">
                <button onClick={downloadJSON} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-2"><Download className="w-4 h-4"/> JSON</button>
                <button onClick={exportCSV} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-2"><ArrowDownToLine className="w-4 h-4"/> CSV</button>
              </div>
            </div>
          </div>

          {/* Right: Summary + Weights */}
          <div className="bg-slate-900/60 rounded-2xl p-4 shadow-lg border border-slate-800">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> สรุปความเสี่ยง</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">คะแนนรวม</span>
                  <span className="text-2xl font-bold">{totalScore}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-xl mt-2 overflow-hidden">
                  <div className={`h-full ${risk.color}`} style={{ width: `${totalScore}%` }}/>
                </div>
                <div className="mt-2 text-sm"><span className={`inline-flex items-center px-2 py-0.5 rounded-full ${risk.color} bg-opacity-20 border border-white/10`}>{risk.label}</span> · {risk.hint}</div>
              </div>

              <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800">
                <h3 className="font-medium mb-2 flex items-center gap-2 text-slate-200"><AlertTriangle className="w-4 h-4"/> สัญญาณจากข้อความ</h3>
                {textFlags.length === 0 ? (
                  <p className="text-slate-400 text-sm">ไม่พบคำที่น่าสงสัยในข้อความ แต่ยังควรตรวจสอบผู้ส่งและโดเมน</p>
                ) : (
                  <ul className="list-disc list-inside text-sm space-y-1 text-slate-200">{textFlags.map((f,i)=>(<li key={i}>{f}</li>))}</ul>
                )}
              </div>

              {/* Weights */}
              <details className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 group">
                <summary className="cursor-pointer list-none flex items-center gap-2 text-slate-200"><Settings2 className="w-4 h-4"/> ปรับน้ำหนักคะแนน (Advanced) <ChevronRight className="w-4 h-4 group-open:hidden"/><ChevronDown className="w-4 h-4 hidden group-open:block"/></summary>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  {([['ข้อความ', 'text'], ['URL รุนแรง', 'urlSevere'], ['URL ปานกลาง','urlMedium'], ['URL เล็กน้อย','urlMild']] as const).map(([label, key])=> (
                    <div key={key} className="col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-between mb-1"><span className="text-slate-300">{label}</span><span className="text-slate-200 font-medium">{(weights as any)[key]}</span></div>
                      <input type="range" min={1} max={25} value={(weights as any)[key]} onChange={e=> setWeights(prev=> ({...prev, [key]: Number(e.target.value)} as Weights))} className="w-full"/>
                    </div>
                  ))}
                </div>
              </details>

              <div className="text-xs text-slate-400 flex items-start gap-2"><Info className="w-4 h-4 mt-0.5"/> การวิเคราะห์นี้ทำแบบออฟไลน์ ไม่ดึงข้อมูล WHOIS/DNS จริง ผลลัพธ์เป็นการประเมินเบื้องต้น</div>
            </div>
          </div>
        </div>

        {/* Toolbar: filters + lists */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2">
            <ListFilter className="w-4 h-4"/>
            <button className={`px-3 py-1.5 rounded-xl border ${filter==='all'?'bg-slate-800 text-white border-slate-700':'bg-slate-900 border-slate-800'}`} onClick={()=>setFilter('all')}>ทั้งหมด</button>
            <button className={`px-3 py-1.5 rounded-xl border ${filter==='trusted'?'bg-slate-800 text-white border-slate-700':'bg-slate-900 border-slate-800'}`} onClick={()=>setFilter('trusted')}>จริง (Whitelist)</button>
            <button className={`px-3 py-1.5 rounded-xl border ${filter==='mal'?'bg-slate-800 text-white border-slate-700':'bg-slate-900 border-slate-800'}`} onClick={()=>setFilter('mal')}>ปลอม/อันตราย</button>
            <button className={`px-3 py-1.5 rounded-xl border ${filter==='risky'?'bg-slate-800 text-white border-slate-700':'bg-slate-900 border-slate-800'}`} onClick={()=>setFilter('risky')}>เสี่ยง</button>
            <button className={`px-3 py-1.5 rounded-xl border ${filter==='clean'?'bg-slate-800 text-white border-slate-700':'bg-slate-900 border-slate-800'}`} onClick={()=>setFilter('clean')}>ไม่เสี่ยง</button>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button onClick={()=>autoAddFromSelection('white')} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 inline-flex items-center gap-2"><Check className="w-4 h-4"/> เพิ่มโดเมนทั้งหมดเข้าขาว</button>
            <button onClick={()=>autoAddFromSelection('black')} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 inline-flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> เพิ่มโดเมนทั้งหมดเข้าดำ</button>
          </div>
        </div>

        {/* URL list */}
        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-slate-400 text-sm">วางข้อความที่มีลิงก์เพื่อดูรายละเอียด เช่น โดเมน, TLD, และสัญญาณเสี่ยง</div>
          )}
          {filtered.map((u, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-emerald-300" title={u.url || u.raw}>{u.url || u.raw}</div>
                  <div className="text-slate-300 text-sm">โดเมนหลัก: <span className="font-medium text-white">{u.basedomain || '-'}</span> · TLD: .{u.tld || '-'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.category==='malicious' ? 'bg-red-500' : u.category==='risky' ? 'bg-amber-500' : u.category==='trusted' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                    {u.category==='malicious' ? 'ปลอม/อันตราย' : u.category==='risky' ? 'เสี่ยง' : u.category==='trusted' ? 'จริง (Whitelist)' : 'ไม่เสี่ยง'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.score>=70? 'bg-red-500': u.score>=40? 'bg-amber-500':'bg-emerald-600'}`}>{u.score}</span>
                  <button onClick={()=> setExpanded(prev => ({...prev, [u.raw]: !prev[u.raw]}))} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-2">รายละเอียด {expanded[u.raw]? <ChevronDown className="w-4 h-4"/>:<ChevronRight className="w-4 h-4"/>}</button>
                  {u.basedomain && !whitelist.has(u.basedomain) && !blacklist.has(u.basedomain) && (
                  <>
                    <button onClick={()=>addToWhitelist(u.basedomain!)} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 inline-flex items-center gap-2"><Check className="w-4 h-4"/> ขึ้นบัญชีขาว</button>
                    <button onClick={()=>addToBlacklist(u.basedomain!)} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 inline-flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> ใส่บัญชีดำ</button>
                  </>
                  )}
                </div>
              </div>
              {expanded[u.raw] && (
                <div className="mt-3">
                  {u.ok ? (
                    u.flags.length===0 ? (
                      <div className="text-sm text-slate-400">ไม่พบสัญญาณเสี่ยงเฉพาะของลิงก์นี้</div>
                    ) : (
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-200">{u.flags.map((f,j)=>(<li key={j}>{f}</li>))}</ul>
                    )
                  ) : (
                    <div className="text-sm text-red-300">{u.error}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Lists manager */}
        <section className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Whitelist</h3>
            {whitelist.size===0 ? (<p className="text-sm text-slate-400">ยังไม่มีโดเมนในบัญชีขาว</p>) : (
              <ul className="text-sm space-y-1">{[...whitelist].map(d => (
                <li key={d} className="flex items-center justify-between gap-2 bg-slate-950/50 rounded-lg px-3 py-1.5">
                  <span className="font-mono text-emerald-300">{d}</span>
                  <button onClick={()=>removeFromWhitelist(d)} className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-1"><X className="w-3 h-3"/>ลบ</button>
                </li>
              ))}</ul>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Blacklist</h3>
            {blacklist.size===0 ? (<p className="text-sm text-slate-400">ยังไม่มีโดเมนในบัญชีดำ</p>) : (
              <ul className="text-sm space-y-1">{[...blacklist].map(d => (
                <li key={d} className="flex items-center justify-between gap-2 bg-slate-950/50 rounded-lg px-3 py-1.5">
                  <span className="font-mono text-red-300">{d}</span>
                  <button onClick={()=>removeFromBlacklist(d)} className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-1"><X className="w-3 h-3"/>ลบ</button>
                </li>
              ))}</ul>
            )}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-10">
          <h2 className="font-semibold text-lg mb-3">เคล็ดลับความปลอดภัย</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">ใช้การยืนยันแบบหลายปัจจัย (MFA) และเปิดการแจ้งเตือนความปลอดภัยกับบริการสำคัญ</div>
            <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">ตรวจโดเมนตัวสะกดให้ชัด โดยเฉพาะตัวอักษรที่คล้ายกัน เช่น rn ↔ m, l ↔ I ↔ 1</div>
            <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">หลีกเลี่ยงการกรอกข้อมูลผ่านลิงก์จากอีเมล เข้าผ่านเว็บไซต์ทางการด้วยตนเอง</div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-start gap-2"><Bug className="w-4 h-4 mt-0.5"/> แอปนี้เป็นตัวอย่างสำหรับประเมินความเสี่ยงเบื้องต้น ควรใช้ร่วมกับระบบป้องกัน/นโยบายองค์กร</div>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-500">Build: Offline, no network calls · Export JSON/CSV · Drag & Drop supported</footer>
      </div>
    </div>
  );
}

const exampleText = `เรื่อง: แจ้งเตือนความปลอดภัยบัญชีของคุณ\n\nเรียนผู้ใช้,\nบัญชีของคุณถูกระงับชั่วคราวจากกิจกรรมที่น่าสงสัย กรุณา\nยืนยันตัวตนภายใน 24 ชั่วโมง มิเช่นนั้นบัญชีจะถูกปิดถาวร\n\nเข้าสู่ระบบที่นี่: http://secure-login-google.com/verify?session=abc\nหรือสำรอง: bit.ly/4PhishLink\n\nขออภัยในความไม่สะดวก,\nGoogle Security Team`;