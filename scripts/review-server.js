import { readdirSync, statSync, createReadStream, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const PPT_ROOT = 'E:/all_ppt_images'
const PROJECT = 'E:/scan-mini-app'
const PORT = 3456

// ---- group each image as its own product ----
function groupBySlide() {
  const groups = [] // each file = one group
  const dirs = readdirSync(PPT_ROOT)
  for (const dir of dirs) {
    const full = join(PPT_ROOT, dir)
    if (!statSync(full).isDirectory()) continue
    for (const f of readdirSync(full)) {
      const fp = join(full, f)
      const size = statSync(fp).size
      const key = `${dir}/${f.replace(/\.\w+$/, '')}` // e.g. "ppt1/slide11_img024"
      groups.push({ key, ppt: dir, files: [{ name: f, path: fp, size, ext: extname(f).toLowerCase() }] })
    }
  }
  groups.sort((a, b) => {
    if (a.ppt !== b.ppt) return a.ppt.localeCompare(b.ppt)
    return a.key.localeCompare(b.key)
  })
  return groups
}

// ---- load existing match data ----
function loadMatched() {
  const matchFile = join(PROJECT, 'scripts', 'cross-match.json')
  if (!existsSync(matchFile)) return new Set()
  const data = JSON.parse(readFileSync(matchFile, 'utf-8'))
  const set = new Set()
  for (const m of data.matched) {
    // Extract just the PPT relative path
    const pptPart = m.pptPath.replace(/\\/g, '/')
    set.add(pptPart)
  }
  return set
}

// ---- load saved progress if any ----
function loadProgress() {
  const pf = join(PROJECT, 'scripts', 'review-progress.json')
  if (existsSync(pf)) return JSON.parse(readFileSync(pf, 'utf-8'))
  return {}
}

// ---- MIME ----
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
}

// ---- HTML page ----
function renderPage(groups, matchedSet, progress) {
  const CATEGORIES = [
    { id: 'c1', name: '锁扣与板托' },
    { id: 'c2', name: '胶链与合页' },
    { id: 'c3', name: '滑轨与导轨' },
    { id: 'c4', name: '吊码与支架' },
    { id: 'c5', name: '拉手与衣柜五金' },
    { id: 'c6', name: '柜脚与脚垫' },
    { id: 'c7', name: '功能五金配件' },
  ]

  const groupsJSON = JSON.stringify(groups).replace(/</g, '\\u003c')
  const progressJSON = JSON.stringify(progress).replace(/</g, '\\u003c')
  const catsJSON = JSON.stringify(CATEGORIES)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>产品图片审核工具 — scan-mini-app</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #F2F2F7; color: #1D1D1F; }
.topbar {
  position: sticky; top:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding: 10px 16px; background: rgba(242,242,247,0.9);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #D1D1D6;
}
.topbar h1 { font-size: 17px; font-weight: 600; }
.topbar-actions { display:flex; gap:8px; align-items:center; }
.btn { padding: 7px 14px; border:none; border-radius: 8px; font-size:13px; font-weight:500; cursor:pointer; }
.btn-primary { background: #007AFF; color: #fff; }
.btn-secondary { background: #E5E5EA; color: #1D1D1F; }
.btn-export { background: #34C759; color: #fff; }
.stats { font-size: 12px; color: #8E8E93; margin-right: 8px; }
.filter-bar { display:flex; gap:6px; padding: 10px 16px; overflow-x: auto; flex-shrink:0; }
.filter-chip { padding:6px 13px; border-radius:16px; border:1px solid #D1D1D6; background:#FFF; font-size:12px; cursor:pointer; white-space:nowrap; }
.filter-chip.active { background: #007AFF; color:#FFF; border-color: #007AFF; }
.content { padding: 8px 16px 60px; }
.slide-group { margin-bottom: 14px; background: #FFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.slide-header { display:flex; align-items:center; justify-content:space-between; padding: 10px 14px; background: #FAFAFA; border-bottom:1px solid #EEE; }
.slide-label { font-size: 13px; font-weight: 600; color: #3A3A3C; }
.slide-badge { font-size: 11px; color: #8E8E93; padding:2px 8px; background:#E5E5EA; border-radius:10px; }
.slide-badge.matched { background:#34C759; color:#FFF; }
.thumb-row { display:flex; gap:6px; padding:10px 14px; overflow-x:auto; -webkit-overflow-scrolling: touch; }
.thumb { width:80px; height:80px; border-radius:8px; object-fit:cover; cursor:pointer; border:2px solid transparent; flex-shrink:0; background:#F2F2F7; }
.thumb:hover { border-color:#007AFF; }
.thumb.selected { border-color:#007AFF; box-shadow: 0 0 0 2px rgba(0,122,255,0.3); }
.thumb.matched-img { border-color:#34C759; }
.input-row { display:flex; gap:6px; padding:0 14px 12px; flex-wrap:wrap; align-items:center; }
.input-row input, .input-row select { padding:7px 10px; border:1px solid #D1D1D6; border-radius:7px; font-size:12px; background:#FFF; }
.input-row input.name-input { flex:1; min-width:140px; }
.input-row input.desc-input { flex:2; min-width:180px; }
.input-row select { min-width:100px; }
.empty-state { text-align:center; padding:60px 20px; color:#8E8E93; }
.progress-bar { height:2px; background:#007AFF; position:fixed; top:0; left:0; z-index:200; transition: width 0.3s; }
</style>
</head>
<body>
<div class="progress-bar" id="progressBar"></div>
<div class="topbar">
  <h1>产品图片审核</h1>
  <div class="topbar-actions">
    <span class="stats" id="stats">0 / 0</span>
    <button class="btn btn-secondary" onclick="saveProgress()">保存进度</button>
    <button class="btn btn-primary" onclick="exportData()">导出 products.json</button>
  </div>
</div>
<div class="filter-bar" id="filterBar"></div>
<div class="content" id="content">
  <div class="empty-state">加载中...</div>
</div>
<script>/*!!!INLINE_JS_START!!!*/</script>
<script>
const GROUPS = ${groupsJSON};
const PROGRESS = ${progressJSON};
const CATS = ${catsJSON};

var selectedPrimary = {};
var productData = {};

// Initialize from progress
for (var k in PROGRESS) {
  if (!PROGRESS.hasOwnProperty(k)) continue;
  if (PROGRESS[k].primary) selectedPrimary[k] = PROGRESS[k].primary;
  if (PROGRESS[k].name) {
    productData[k] = { name: PROGRESS[k].name || '', categoryId: PROGRESS[k].categoryId || 'c1', desc: PROGRESS[k].desc || '' };
  }
}

var currentFilter = 'all';

function buildFilters() {
  var pptSet = {};
  for (var i = 0; i < GROUPS.length; i++) { pptSet[GROUPS[i].ppt] = true; }
  var pptList = Object.keys(pptSet).sort();
  var frag = document.createDocumentFragment();

  var allChip = document.createElement('button');
  allChip.className = 'filter-chip' + (currentFilter === 'all' ? ' active' : '');
  allChip.textContent = '全部 (' + GROUPS.length + ')';
  allChip.onclick = function() { currentFilter = 'all'; render(); };
  frag.appendChild(allChip);

  for (var j = 0; j < pptList.length; j++) {
    var ppt = pptList[j];
    var count = 0;
    for (var k = 0; k < GROUPS.length; k++) { if (GROUPS[k].ppt === ppt) count++; }
    var chip = document.createElement('button');
    chip.className = 'filter-chip' + (currentFilter === ppt ? ' active' : '');
    chip.textContent = ppt + ' (' + count + ')';
    chip.onclick = (function(p) { return function() { currentFilter = p; render(); }; })(ppt);
    frag.appendChild(chip);
  }

  var named = 0;
  for (var key in productData) { if (productData[key].name) named++; }
  var todoChip = document.createElement('button');
  todoChip.className = 'filter-chip' + (currentFilter === 'todo' ? ' active' : '');
  todoChip.textContent = '待命名 (' + (GROUPS.length - named) + ')';
  todoChip.onclick = function() { currentFilter = 'todo'; render(); };
  frag.appendChild(todoChip);

  var fb = document.getElementById('filterBar');
  fb.innerHTML = '';
  fb.appendChild(frag);
}

function render() {
  buildFilters();
  var content = document.getElementById('content');
  var groups = GROUPS;
  if (currentFilter !== 'all') {
    if (currentFilter === 'todo') {
      groups = GROUPS.filter(function(g) { return !productData[g.key] || !productData[g.key].name; });
    } else {
      groups = GROUPS.filter(function(g) { return g.ppt === currentFilter; });
    }
  }
  if (groups.length === 0) {
    content.innerHTML = '<div class="empty-state">全部产品已命名！可以导出了</div>';
  } else {
    var html = '';
    for (var i = 0; i < groups.length; i++) { html += renderGroup(groups[i]); }
    content.innerHTML = html;
  }
  updateStats();
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderGroup(g) {
  var pd = productData[g.key] || { name: '', categoryId: 'c1', desc: '' };
  var prim = selectedPrimary[g.key] || g.files[0].name || '';
  var hasName = !!pd.name;

  var thumbs = '';
  for (var i = 0; i < g.files.length; i++) {
    var f = g.files[i];
    var isPrim = f.name === prim;
    var cls = 'thumb';
    if (isPrim) cls += ' selected';
    thumbs += '<img class="' + cls + '" src="/img/' + encodeURIComponent(g.ppt) + '/' + encodeURIComponent(f.name)
      + '" title="' + esc(f.name) + ' (' + (f.size/1024).toFixed(0) + 'KB)"'
      + ' data-gkey="' + esc(g.key) + '" data-fname="' + esc(f.name) + '"'
      + ' loading="lazy" />';
  }

  var catsHTML = '';
  for (var j = 0; j < CATS.length; j++) {
    var c = CATS[j];
    catsHTML += '<option value="' + esc(c.id) + '"' + (pd.categoryId === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
  }

  return '<div class="slide-group">'
    + '<div class="slide-header">'
    + '<span class="slide-label">' + esc(g.key) + '</span>'
    + '<span class="slide-badge' + (hasName ? ' matched' : '') + '">'
    + (hasName ? '已命名: ' + esc(pd.name) : g.files.length + ' 张图')
    + '</span></div>'
    + '<div class="thumb-row">' + thumbs + '</div>'
    + '<div class="input-row">'
    + '<input class="name-input" placeholder="产品名称..." value="' + esc(pd.name) + '"'
    + ' data-gkey="' + esc(g.key) + '" data-field="name" />'
    + '<select data-gkey="' + esc(g.key) + '" data-field="cat">' + catsHTML + '</select>'
    + '<input class="desc-input" placeholder="描述/规格..." value="' + esc(pd.desc) + '"'
    + ' data-gkey="' + esc(g.key) + '" data-field="desc" />'
    + '</div></div>';
}

// Event delegation
document.getElementById('content').addEventListener('click', function(e) {
  var img = e.target;
  while (img && img !== this) {
    if (img.tagName === 'IMG' && img.className.indexOf('thumb') >= 0) break;
    img = img.parentNode;
  }
  if (!img || img === this) return;
  var gkey = img.getAttribute('data-gkey');
  var fname = img.getAttribute('data-fname');
  if (gkey && fname) {
    selectedPrimary[gkey] = fname;
    render();
  }
});

document.getElementById('content').addEventListener('change', function(e) {
  var el = e.target;
  var gkey = el.getAttribute('data-gkey');
  var field = el.getAttribute('data-field');
  if (!gkey || !field) return;
  if (!productData[gkey]) productData[gkey] = { name: '', categoryId: 'c1', desc: '' };
  if (field === 'name') productData[gkey].name = el.value;
  else if (field === 'cat') productData[gkey].categoryId = el.value;
  else if (field === 'desc') productData[gkey].desc = el.value;
});

function updateStats() {
  var named = 0;
  for (var k in productData) { if (productData[k] && productData[k].name) named++; }
  document.getElementById('stats').textContent = '已命名: ' + named + ' / ' + GROUPS.length;
  var pct = GROUPS.length > 0 ? (named / GROUPS.length * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}

async function saveProgress() {
  var data = {};
  for (var i = 0; i < GROUPS.length; i++) {
    var g = GROUPS[i];
    var entry = {};
    var pd = productData[g.key];
    if (pd) { entry.name = pd.name; entry.categoryId = pd.categoryId; entry.desc = pd.desc; }
    if (selectedPrimary[g.key]) entry.primary = selectedPrimary[g.key];
    if (Object.keys(entry).length > 0) data[g.key] = entry;
  }
  await fetch('/save', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  alert('进度已保存！');
}

async function exportData() {
  if (!confirm('确认导出？')) return;
  var resp = await fetch('/export', { method:'POST' });
  var result = await resp.json();
  if (result.ok) {
    alert('导出成功！新增 ' + result.added + ' 个产品');
  } else {
    alert('导出失败: ' + result.error);
  }
}

render();
</script>
</body>
</html>`
}

// ---- Main server ----
const groups = groupBySlide()
const matchedSet = loadMatched()
const progress = loadProgress()

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost:' + PORT)

    // Serve images from PPT root
    if (url.pathname.startsWith('/img/')) {
      const relPath = decodeURIComponent(url.pathname.slice(5)) // remove /img/
      const safePath = join(PPT_ROOT, relPath)
      // Normalize separators for startsWith check on Windows
      const normalizedRoot = PPT_ROOT.replace(/\\/g, '/').replace(/\/$/, '')
      const normalizedPath = safePath.replace(/\\/g, '/')
      if (!normalizedPath.startsWith(normalizedRoot + '/') && normalizedPath !== normalizedRoot) {
        res.writeHead(403); res.end(); return
      }
      if (!existsSync(safePath)) { res.writeHead(404); res.end(); return }
      const ext = extname(safePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      createReadStream(safePath).pipe(res)
      return
    }

    // Save progress
    if (url.pathname === '/save' && req.method === 'POST') {
      let body = ''
      req.on('data', c => body += c)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          writeFileSync(join(PROJECT, 'scripts', 'review-progress.json'), JSON.stringify(data, null, 2))
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch(e) {
          res.writeHead(400); res.end(JSON.stringify({ error: e.message }))
        }
      })
      return
    }

    // Export products.json and copy images
    if (url.pathname === '/export' && req.method === 'POST') {
      const progress = loadProgress()
      const existingProducts = JSON.parse(readFileSync(join(PROJECT, 'src', 'data', 'products.json'), 'utf-8'))
      const existingIds = new Set(existingProducts.map(p => p.id))
      const existingImages = new Set(existingProducts.map(p => p.image.replace('/images/', '')))

      let maxP = 0
      for (const p of existingProducts) {
        const n = parseInt(p.id.replace('p', ''))
        if (n > maxP) maxP = n
      }
      let maxV = 0
      for (const p of existingProducts) {
        for (const v of p.variants) {
          const n = parseInt(v.id.replace('v', ''))
          if (n > maxV) maxV = n
        }
      }

      const newProducts = []
      const pubDir = join(PROJECT, 'public', 'images')

      for (const g of groups) {
        const pd = progress[g.key]
        if (!pd || !pd.name) continue // skip unnamed
        const primaryFile = pd.primary || g.files[0]?.name
        if (!primaryFile) continue

        maxP++
        maxV++
        const pId = 'p' + maxP
        const vId = 'v' + maxV

        // Copy image to public/images/
        const srcPath = join(PPT_ROOT, g.ppt, primaryFile)
        const dstName = pId + '_' + sanitizeFilename(primaryFile)
        const dstPath = join(pubDir, dstName)
        if (!existsSync(dstPath)) {
          copyFileSync(srcPath, dstPath)
        }

        newProducts.push({
          id: pId,
          categoryId: pd.categoryId || 'c1',
          name: pd.name,
          image: '/images/' + dstName,
          desc: pd.desc || '',
          variants: [{ id: vId, label: pd.name, spec: '' }],
        })
      }

      const allProducts = [...existingProducts, ...newProducts]
      writeFileSync(join(PROJECT, 'src', 'data', 'products.json'), JSON.stringify(allProducts, null, 2))

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, added: newProducts.length }))
      return
    }

    // Serve main page
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(renderPage(groups, matchedSet, progress))
  } catch(e) {
    console.error(e)
    res.writeHead(500)
    res.end('Server Error: ' + e.message)
  }
})

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_{2,}/g, '_')
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('  ============================================')
  console.log('   产品图片审核工具已启动')
  console.log('   打开浏览器: http://localhost:' + PORT)
  console.log('  ============================================')
  console.log('')
  console.log('  ' + groups.length + ' 个产品组 (PPT幻灯片)')
  console.log('  按类别命名 → 保存进度 → 一键导出')
  console.log('')
})
