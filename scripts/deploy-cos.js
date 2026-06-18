import COS from 'cos-nodejs-sdk-v5'
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const SECRET_ID = process.env.COS_SECRET_ID || ''
const SECRET_KEY = process.env.COS_SECRET_KEY || ''
const BUCKET = 'scan-mini-app-1343026848'
const REGION = 'ap-guangzhou'
const DIST_DIR = 'E:/scan-mini-app/dist'

const cos = new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY })

// ---- MIME types ----
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

// ---- Collect all dist files ----
function collectFiles(dir, base = '') {
  const files = []
  for (const f of readdirSync(dir)) {
    const fp = join(dir, f)
    const key = base ? base + '/' + f : f
    if (statSync(fp).isDirectory()) {
      files.push(...collectFiles(fp, key))
    } else {
      files.push({ localPath: fp, key })
    }
  }
  return files
}

// ---- Upload all files ----
async function uploadAll(files) {
  let done = 0
  for (const f of files) {
    await new Promise((resolve, reject) => {
      const ext = '.' + f.key.split('.').pop().toLowerCase()
      cos.putObject({
        Bucket: BUCKET,
        Region: REGION,
        Key: f.key,
        Body: readFileSync(f.localPath),
        ContentType: MIME[ext] || 'application/octet-stream',
        CacheControl: 'public, max-age=86400',
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    done++
    if (done % 50 === 0) console.log(`  ${done}/${files.length} uploaded...`)
  }
}

// ---- Main ----
async function main() {
  console.log('Deploying to Tencent COS...\n')

  // 1. Ensure bucket exists (will fail silently if exists)
  try {
    await new Promise((resolve, reject) => {
      cos.putBucket({
        Bucket: BUCKET,
        Region: REGION,
      }, (err, data) => {
        if (err && err.code !== 'BucketAlreadyExists' && err.code !== 'BucketAlreadyOwnedByYou') {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
    console.log('Bucket ready: ' + BUCKET)
  } catch (e) {
    console.log('Bucket: ' + e.message)
  }

  // 2. Set static website config
  try {
    await new Promise((resolve, reject) => {
      cos.putBucketWebsite({
        Bucket: BUCKET,
        Region: REGION,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'index.html' }, // SPA fallback
        },
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    console.log('Static website hosting enabled')
  } catch (e) {
    console.log('Website config: ' + e.message)
  }

  // 3. Set public-read bucket policy
  try {
    await new Promise((resolve, reject) => {
      cos.putBucketPolicy({
        Bucket: BUCKET,
        Region: REGION,
        Policy: JSON.stringify({
          version: '2.0',
          statement: [{
            principal: { qcs: ['qcs::cam::anyone:anyone'] },
            effect: 'allow',
            action: ['name/cos:GetObject'],
            resource: [`qcs::cos:${REGION}:uid/1343026848:${BUCKET}/*`],
          }],
        }),
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    console.log('Public read policy set')
  } catch (e) {
    console.log('Policy: ' + e.message)
  }

  // 4. Upload files
  const files = collectFiles(DIST_DIR)
  console.log(`\nUploading ${files.length} files...`)
  await uploadAll(files)
  console.log('Upload complete!')

  // 5. Output URL
  const url = `https://${BUCKET}.cos-website.${REGION}.myqcloud.com`
  console.log('\n' + '='.repeat(50))
  console.log('  Deployment successful!')
  console.log('  URL: ' + url)
  console.log('='.repeat(50))
}

main().catch(e => {
  console.error('Deploy failed:', e.message || e)
  process.exit(1)
})
