import { readdirSync, statSync, createReadStream, writeFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { createHash } from 'node:crypto'

const PPT_ROOT = 'E:/all_ppt_images'
const PUB_IMG = 'E:/scan-mini-app/public/images'

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('md5')
    const stream = createReadStream(filePath)
    stream.on('data', d => hash.update(d))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function collectHashes(rootDir, flat = false) {
  const map = new Map() // hash -> path
  if (flat) {
    for (const f of readdirSync(rootDir)) {
      const fp = join(rootDir, f)
      if (!statSync(fp).isFile()) continue
      try {
        const h = await hashFile(fp)
        map.set(h, fp)
      } catch(e) { console.error('err:', fp, e.message) }
    }
  } else {
    const dirs = readdirSync(rootDir)
    for (const d of dirs) {
      const full = join(rootDir, d)
      if (!statSync(full).isDirectory()) continue
      for (const f of readdirSync(full)) {
        const fp = join(full, f)
        try {
          const h = await hashFile(fp)
          map.set(h, fp)
        } catch(e) { console.error('err:', fp, e.message) }
      }
    }
  }
  return map
}

async function main() {
  // Hash all PPT images
  console.log('Hashing PPT images...')
  const pptHashes = await collectHashes(PPT_ROOT)
  console.log(`  ${pptHashes.size} PPT hashes`)

  // Hash all public/images (flat directory)
  console.log('Hashing existing public/images...')
  const pubHashes = await collectHashes(PUB_IMG, true)
  console.log(`  ${pubHashes.size} public/images hashes`)

  // Cross-reference: which public images exist in PPT?
  const matched = []
  const unmatched = []
  for (const [h, pubPath] of pubHashes) {
    if (pptHashes.has(h)) {
      matched.push({
        publicPath: pubPath.replace(PUB_IMG + '/', ''),
        pptPath: pptHashes.get(h).replace(PPT_ROOT + '/', ''),
      })
    } else {
      unmatched.push({
        publicPath: pubPath.replace(PUB_IMG + '/', ''),
      })
    }
  }

  // Also: PPT images NOT in public (new images to add)
  const pubHashSet = new Set(pubHashes.keys())
  const newInPPT = []
  for (const [h, pptPath] of pptHashes) {
    if (!pubHashSet.has(h)) {
      newInPPT.push(pptPath.replace(PPT_ROOT + '/', ''))
    }
  }

  writeFileSync('E:/scan-mini-app/scripts/cross-match.json', JSON.stringify({
    summary: {
      publicTotal: pubHashes.size,
      pptTotal: pptHashes.size,
      matched: matched.length,
      unmatchedInPublic: unmatched.length,
      newInPPT: newInPPT.length,
    },
    matched,
    unmatchedInPublic: unmatched,
  }, null, 2))

  console.log(`\n===== 交叉匹配结果 =====`)
  console.log(`public/images: ${pubHashes.size} 个唯一文件`)
  console.log(`PPT 图片总数:  ${pptHashes.size} 个唯一文件`)
  console.log(`✅ 已匹配:     ${matched.length} (public 中已有的 PPT 源文件)`)
  console.log(`❌ public 独有: ${unmatched.length} (不在 PPT 里的)`)
  console.log(`🆕 PPT 新文件: ${newInPPT.length} (可以新增的产品图)`)
  console.log(`\n详细报告: E:/scan-mini-app/scripts/cross-match.json`)

  if (matched.length > 0) {
    console.log(`\n--- 匹配清单 ---`)
    matched.forEach(m => console.log(`  public/${m.publicPath}  ←  ${m.pptPath}`))
  }
  if (unmatched.length > 0) {
    console.log(`\n--- public 独有(不在PPT中) ---`)
    unmatched.forEach(u => console.log(`  ${u.publicPath}`))
  }
}
main().catch(e => { console.error(e); process.exit(1) })
