import { join } from 'node:path'
const PPT_ROOT = 'E:/all_ppt_images'
const relPath = 'ppt1/12 Changfanggai.png'
const safePath = join(PPT_ROOT, relPath)
const normalizedRoot = PPT_ROOT.replace(/\\/g, '/').replace(/\/$/, '')
const normalizedPath = safePath.replace(/\\/g, '/')
console.log('safePath:', safePath)
console.log('normalizedRoot:', normalizedRoot)
console.log('normalizedPath:', normalizedPath)
console.log('startsWith:', normalizedPath.startsWith(normalizedRoot + '/'))
