import { readdirSync, statSync, createReadStream, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { createHash } from 'node:crypto'

const ROOT = 'E:/all_ppt_images'

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('md5')
    const stream = createReadStream(filePath)
    stream.on('data', d => hash.update(d))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

async function main() {
  // Collect all files
  const allFiles = []
  const dirs = readdirSync(ROOT)
  for (const dir of dirs) {
    const full = join(ROOT, dir)
    if (!statSync(full).isDirectory()) continue
    for (const f of readdirSync(full)) {
      allFiles.push(join(full, f))
    }
  }

  console.log(`Scanning ${allFiles.length} files...\n`)

  // Compute hashes
  const hashMap = new Map() // hash -> [paths]
  let done = 0
  for (const f of allFiles) {
    try {
      const h = await hashFile(f)
      if (!hashMap.has(h)) hashMap.set(h, [])
      hashMap.get(h).push(f)
    } catch (e) {
      console.error(`Error: ${f} -> ${e.message}`)
    }
    done++
    if (done % 50 === 0) console.log(`  ${done}/${allFiles.length} done...`)
  }

  // Group: unique vs duplicate
  const unique = []
  const duplicates = []

  for (const [hash, paths] of hashMap) {
    const size = statSync(paths[0]).size
    if (paths.length === 1) {
      unique.push({ path: paths[0], size })
    } else {
      duplicates.push({ hash, paths, size })
    }
  }

  // Write report
  const report = {
    summary: {
      total: allFiles.length,
      uniqueFiles: unique.length,
      duplicateFiles: duplicates.reduce((sum, d) => sum + d.paths.length, 0),
      duplicateGroups: duplicates.length,
      duplicateUnique: duplicates.length,
      wastedBytes: duplicates.reduce((sum, d) => sum + d.size * (d.paths.length - 1), 0),
    },
    duplicates: duplicates.map(d => ({
      hash: d.hash,
      count: d.paths.length,
      size: d.size,
      sizeFormatted: formatSize(d.size),
      wastedFormatted: formatSize(d.size * (d.paths.length - 1)),
      files: d.paths.map(p => p.replace(ROOT + '/', '')),
    })),
    unique: unique.map(u => ({
      path: u.path.replace(ROOT + '/', ''),
      size: u.size,
      sizeFormatted: formatSize(u.size),
    })),
  }

  writeFileSync('E:/scan-mini-app/scripts/dedup-report.json', JSON.stringify(report, null, 2))

  console.log(`\n===== 去重报告 =====`)
  console.log(`总文件数:     ${report.summary.total}`)
  console.log(`唯一文件:     ${report.summary.uniqueFiles}`)
  console.log(`重复文件:     ${report.summary.duplicateFiles}`)
  console.log(`重复组:       ${report.summary.duplicateGroups}`)
  console.log(`可节省空间:   ${formatSize(report.summary.wastedBytes)}`)
  console.log(`\n详细报告已写入: E:/scan-mini-app/scripts/dedup-report.json`)
}
main().catch(e => { console.error(e); process.exit(1) })
