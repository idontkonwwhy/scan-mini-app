import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const PPT_ROOT = 'E:/all_ppt_images'
const PROJECT = 'E:/scan-mini-app'

// ---- group each image as its own product ----
function groupBySlide() {
  const groups = []
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

// ---- Load slide texts ----
const slideTexts = JSON.parse(readFileSync(join(PROJECT, 'scripts', 'ppt-slide-texts.json'), 'utf-8'))

// ---- Category guesser based on product name ----
const CATEGORY_KEYWORDS = [
  { id: 'c1', name: '锁扣与板托', kw: ['锁扣', '板托', '三合一', '轮', '盖', '连接杆', '预埋件', '快装杆', '纤维板钉', '玻璃扣', '层板托', '法兰', '隔板托', '床角撑', '地钉', '角码', '塞'] },
  { id: 'c2', name: '胶链与合页', kw: ['胶链', '合页', '十字胶', '合页孔塞', '反弹器', '插销'] },
  { id: 'c3', name: '滑轨与导轨', kw: ['滑轨', '键盘托', '滑扣', '趟门轮', '脚轮', '毛条', '毛边'] },
  { id: 'c4', name: '吊码与支架', kw: ['吊码', '蛇形管', '透气网', '透气风'] },
  { id: 'c5', name: '拉手与衣柜五金', kw: ['拉手', '挂衣杆', '衣托', '衣架', '鞋架', '衣钩', '衣柜', '衣座', '酒杯架', '拉直器', '抽屉'] },
  { id: 'c6', name: '柜脚与脚垫', kw: ['柜脚', '脚垫', '脚钉', '伸缩脚', '防滑', '脚轮', '防撞角', '防水垫'] },
  { id: 'c7', name: '功能五金配件', kw: ['家具锁', '螺母', '赌头', '线盒', '孔塞', '下水口', '活性炭', '功能'] },
]

function guessCategory(name, desc) {
  const text = (name + ' ' + (desc || '')).toLowerCase()
  let best = null
  let bestScore = 0
  for (const cat of CATEGORY_KEYWORDS) {
    let score = 0
    for (const kw of cat.kw) {
      if (text.includes(kw)) score += kw.length
    }
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best ? best.id : 'c7'
}

// ---- Parse slide text into product name + desc ----
function parseSlideText(text) {
  if (!text || !text.trim()) return null
  // Remove trailing "更多产品..." suffix
  text = text.replace(/\s*\|\s*更多产品正在更新中.*$/, '').trim()
  if (!text) return null

  // Split by pipe
  const parts = text.split('|').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return null

  const name = parts[0]
  const desc = parts.length > 1 ? parts.slice(1).join(' | ') : ''

  return { name, desc }
}

// ---- Main mapping ----
const groups = groupBySlide()
const progress = {}

// Load existing progress if any
let existing = {}
try {
  existing = JSON.parse(readFileSync(join(PROJECT, 'scripts', 'review-progress.json'), 'utf-8'))
} catch (e) {
  // OK, no existing progress
}

let filled = 0
let skipped = 0
const skippedReasons = []

for (const g of groups) {
  const existingEntry = existing[g.key]
  if (existingEntry && existingEntry.name) {
    // Keep user's manual entries
    progress[g.key] = existingEntry
    continue
  }

  // Parse slide number from key: "ppt1/slide11_img024" -> "slide11", or "ppt1/named" -> "named"
  const keySuffix = g.key.split('/')[1]
  const slideMatch = keySuffix.match(/^(slide\d+)/)
  const slideKey = slideMatch ? slideMatch[1] : keySuffix // "slide11" or "named"
  const pptKey = g.ppt
  const slideData = slideTexts[pptKey] && slideTexts[pptKey][slideKey]

  if (!slideData || !slideData.trim()) {
    skipped++
    if (skipped < 10) skippedReasons.push(`${g.key}: slide is empty`)
    continue
  }

  const parsed = parseSlideText(slideData)
  if (!parsed) {
    skipped++
    continue
  }

  const categoryId = guessCategory(parsed.name, parsed.desc)
  const primary = g.files[0]?.name || ''

  progress[g.key] = {
    name: parsed.name,
    desc: parsed.desc,
    categoryId,
    primary,
  }
  filled++
}

writeFileSync(
  join(PROJECT, 'scripts', 'review-progress.json'),
  JSON.stringify(progress, null, 2)
)

console.log(`Total groups: ${groups.length}`)
console.log(`Auto-filled:  ${filled}`)
console.log(`Skipped:      ${skipped} (empty slides or "named" groups)`)
console.log(`Kept manual:  ${Object.keys(existing).filter(k => existing[k] && existing[k].name).length}`)
if (skippedReasons.length > 0) {
  console.log(`\nSample skipped:`)
  skippedReasons.forEach(r => console.log(`  ${r}`))
}

// Show what was filled
console.log(`\n=== Sample auto-fills ===`)
let shown = 0
for (const [k, v] of Object.entries(progress)) {
  if (shown >= 15) break
  if (v.name) {
    console.log(`  ${k}: "${v.name}" [${v.categoryId}]`)
    shown++
  }
}

console.log(`\nProgress saved to scripts/review-progress.json`)
console.log(`Restart review server and refresh browser to see auto-filled data.`)
