import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';

const PORT = Number(process.env.PILOT_DASHBOARD_PORT || 8787);
const ROOT = path.resolve(process.cwd(), 'data', 'secret-agents-pilot');

async function walk(dir, out = []) {
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else {
      const s = await fs.stat(p);
      out.push({ rel: path.relative(ROOT, p).replace(/\\/g,'/'), size: s.size, mtime: s.mtime.toISOString() });
    }
  }
  return out.sort((a,b)=>b.mtime.localeCompare(a.mtime));
}
function safe(rel) {
  if (!rel || rel.includes('..')) return null;
  const full = path.resolve(ROOT, rel);
  return full.startsWith(ROOT) ? full : null;
}
function html() {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Pilot Dashboard</title>
<style>body{font-family:Segoe UI,Arial;margin:20px;background:#f6f8fa}.box{background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #eee;padding:8px;text-align:left}pre{background:#111;color:#eee;padding:12px;border-radius:8px;white-space:pre-wrap}</style></head>
<body><h2>Secret Agents File Dashboard</h2><div class="box"><table><thead><tr><th>File</th><th>Size</th><th>Modified</th><th>Actions</th></tr></thead><tbody id="rows"></tbody></table></div><br/><div class="box"><pre id="pv">Select Preview</pre></div>
<script>
fetch('/api/files').then(r=>r.json()).then(d=>{
 const rows=document.getElementById('rows');
 rows.innerHTML=(d.files||[]).map(f=>\`<tr><td>\${f.rel}</td><td>\${f.size}</td><td>\${new Date(f.mtime).toLocaleString()}</td><td><a href="#" data-p="\${encodeURIComponent(f.rel)}">Preview</a> | <a href="/download?path=\${encodeURIComponent(f.rel)}">Download</a></td></tr>\`).join('');
 rows.querySelectorAll('[data-p]').forEach(a=>a.onclick=async(ev)=>{ev.preventDefault();const p=decodeURIComponent(a.dataset.p);const r=await fetch('/preview?path='+encodeURIComponent(p));const j=await r.json();document.getElementById('pv').textContent=j.content||j.error||'No preview';});
});
</script></body></html>`;
}
const server = http.createServer(async (req,res)=>{
  const u = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (u.pathname === '/') { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(html()); return; }
  if (u.pathname === '/api/files') { const files = await walk(ROOT); res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({root:ROOT, files})); return; }
  if (u.pathname === '/preview') {
    const rel = u.searchParams.get('path') || ''; const full = safe(rel); if (!full) { res.writeHead(400); res.end(JSON.stringify({error:'invalid path'})); return; }
    try { const txt = await fs.readFile(full, 'utf8'); res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({content: txt.slice(0,120000)})); }
    catch { res.writeHead(404); res.end(JSON.stringify({error:'not found'})); }
    return;
  }
  if (u.pathname === '/download') {
    const rel = u.searchParams.get('path') || ''; const full = safe(rel); if (!full) { res.writeHead(400); res.end('invalid path'); return; }
    try { const b = await fs.readFile(full); res.writeHead(200, {'content-type':'application/octet-stream'}); res.end(b); }
    catch { res.writeHead(404); res.end('not found'); }
    return;
  }
  res.writeHead(404); res.end('not found');
});
server.listen(PORT, ()=>{ console.log(`Dashboard: http://localhost:${PORT}`); console.log(`Root: ${ROOT}`); });
