# 五金配件目录 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零重建五金配件目录纯 H5 应用 — Vite + Vue3 移动端，Apple 轻量设计风格，三页（主页/详情/联系）。

**Architecture:** 删除旧的 uni-app 项目，用 Vite + Vue3 + Vue Router (hash) 重建。纯静态，数据存 JSON，图片放 public/images。三列文件：数据层 (data/*.json)、页面 (pages/*.vue)、路由 (router/index.js)。

**Tech Stack:** Vite 5, Vue 3.4, Vue Router 4, 无状态管理库, vw 单位适配

---

## 文件结构

```
scan-mini-app/
├── index.html
├── package.json
├── vite.config.ts
├── public/
│   └── images/                    # 从 src/static/products/ 迁移
│       └── qr.jpg                 # 微信二维码（占位）
├── src/
│   ├── main.js
│   ├── App.vue                    # 根组件 + 底部 Tab 栏
│   ├── router/
│   │   └── index.js               # hash 路由
│   ├── data/
│   │   ├── categories.json        # 分类列表
│   │   └── products.json          # 商品 + variants
│   └── pages/
│       ├── Home.vue               # 主页：搜索 + Chip分类 + 两列网格
│       ├── Detail.vue             # 详情：大图 + 名称型号 + 简介
│       └── Contact.vue            # 联系：名片卡片
```

---

### Task 1: 清理旧项目并初始化 Vite + Vue3

**Files:**
- Delete: `src/`, `node_modules/`, `package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `_extracted.json`, `_raw_data.txt`, `products_data.xlsx.xlsx`, `static/`
- Create: (via npm create, then overwrite)

- [ ] **Step 1: 备份数据文件**

```bash
cp /e/scan-mini-app/src/mock/catalog.json /e/scan-mini-app/_catalog_backup.json
cp -r /e/scan-mini-app/src/static/products /e/scan-mini-app/_images_backup
```

- [ ] **Step 2: 删除所有旧项目文件**

```bash
rm -rf /e/scan-mini-app/src /e/scan-mini-app/node_modules /e/scan-mini-app/static
rm -f /e/scan-mini-app/package.json /e/scan-mini-app/package-lock.json /e/scan-mini-app/vite.config.ts /e/scan-mini-app/index.html /e/scan-mini-app/_extracted.json /e/scan-mini-app/_raw_data.txt /e/scan-mini-app/products_data.xlsx.xlsx
```

- [ ] **Step 3: 初始化新项目**

```bash
cd /e/scan-mini-app && npm create vite@latest . -- --template vue
```

- [ ] **Step 4: 安装依赖**

```bash
cd /e/scan-mini-app && npm install && npm install vue-router@4
```

- [ ] **Step 5: 清理 Vite 模板默认文件**

```bash
rm -f /e/scan-mini-app/src/components/HelloWorld.vue /e/scan-mini-app/src/assets/vue.svg /e/scan-mini-app/public/vite.svg
rm -f /e/scan-mini-app/src/style.css
```

- [ ] **Step 6: Commit**

```bash
cd /e/scan-mini-app && git init && git add -A && git commit -m "chore: init Vite + Vue3 project, remove uni-app"
```

---

### Task 2: 创建路由和 App 骨架

**Files:**
- Create: `src/router/index.js`
- Create: `src/App.vue`
- Overwrite: `src/main.js`
- Create: `src/pages/Home.vue` (stub), `src/pages/Detail.vue` (stub), `src/pages/Contact.vue` (stub)
- Overwrite: `index.html`

- [ ] **Step 1: 创建路由文件 `src/router/index.js`**

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Detail from '@/pages/Detail.vue'
import Contact from '@/pages/Contact.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/detail/:productId/:variantId?', name: 'Detail', component: Detail },
  { path: '/contact', name: 'Contact', component: Contact },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
```

- [ ] **Step 2: 创建 App 根组件 `src/App.vue`**

```vue
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showTabs = computed(() => route.name !== 'Detail')
</script>

<template>
  <div class="app">
    <router-view />
    <nav v-if="showTabs" class="tabs">
      <router-link to="/" class="tab" active-class="tab--active" exact>
        <span class="tab-icon">&#8962;</span>
        <span class="tab-label">首页</span>
      </router-link>
      <router-link to="/contact" class="tab" active-class="tab--active">
        <span class="tab-icon">&#9998;</span>
        <span class="tab-label">联系</span>
      </router-link>
    </nav>
  </div>
</template>

<style>
/* 全局重置 */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
#app { height: 100%; }

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #F5F5F7;
}

/* 底部 Tab */
.tabs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(245, 245, 247, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #8E8E93;
  font-size: 10px;
  padding: 4px 20px;
}

.tab--active {
  color: #1D1D1F;
  font-weight: 600;
}

.tab-icon { font-size: 20px; line-height: 1; }
.tab-label { font-size: 11px; }
</style>
```

- [ ] **Step 3: 覆盖入口文件 `src/main.js`**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 4: 覆盖 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>五金配件目录</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建页面占位 `src/pages/Home.vue`**

```vue
<template>
  <div class="page" style="flex:1;overflow-y:auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
      <span style="font-size:17px;font-weight:600;color:#1D1D1F;">五金目录</span>
      <span style="font-size:18px;">&#x1F50D;</span>
    </div>
    <p style="text-align:center;color:#8E8E93;padding:40px;">主页（待实现）</p>
  </div>
</template>
```

- [ ] **Step 6: 创建其余页面占位**

`src/pages/Detail.vue`:
```vue
<template>
  <div class="page" style="flex:1;overflow-y:auto;background:#FFF;">
    <p style="text-align:center;color:#8E8E93;padding:40px;">详情（待实现）</p>
  </div>
</template>
```

`src/pages/Contact.vue`:
```vue
<template>
  <div class="page" style="flex:1;overflow-y:auto;">
    <p style="text-align:center;color:#8E8E93;padding:40px;">联系（待实现）</p>
  </div>
</template>
```

- [ ] **Step 7: 配置 Vite 别名 `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 8: 验证运行**

```bash
cd /e/scan-mini-app && npx vite --host 0.0.0.0 --port 5173
```

打开 http://localhost:5173，确认首页/联系页切换正常，底部 Tab 在详情页隐藏。

- [ ] **Step 9: Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: add router, App shell, page stubs"
```

---

### Task 3: 迁移图片和准备数据

**Files:**
- Move: `_images_backup/` → `public/images/`
- Create: `scripts/convert-catalog.mjs` (一次性脚本)
- Create: `src/data/categories.json`
- Create: `src/data/products.json`

- [ ] **Step 1: 移动图片**

```bash
mkdir -p /e/scan-mini-app/public/images
cp /e/scan-mini-app/_images_backup/* /e/scan-mini-app/public/images/
```

- [ ] **Step 2: 创建数据转换脚本 `scripts/convert-catalog.mjs`**

```js
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const oldData = JSON.parse(
  readFileSync(join(__dirname, '..', '_catalog_backup.json'), 'utf-8')
)

const categories = oldData.categories.map((c, i) => ({
  id: `c${i + 1}`,
  name: c.name,
  order: i + 1,
}))

let pIndex = 0
const products = []

for (const cat of oldData.categories) {
  const catId = `c${categories.find(c => c.name === cat.name).order}`
  for (const item of cat.items) {
    pIndex++
    const filename = (item.image || '').split('/').pop()
    products.push({
      id: `p${pIndex}`,
      categoryId: catId,
      name: item.name,
      image: `/images/${filename}`,
      desc: item.description || '',
      variants: [
        {
          id: `v${pIndex}`,
          label: item.name,
          spec: '',
        },
      ],
    })
  }
}

writeFileSync(
  join(__dirname, '..', 'src', 'data', 'categories.json'),
  JSON.stringify(categories, null, 2),
  'utf-8'
)
writeFileSync(
  join(__dirname, '..', 'src', 'data', 'products.json'),
  JSON.stringify(products, null, 2),
  'utf-8'
)
console.log(`Converted: ${categories.length} categories, ${products.length} products`)
```

- [ ] **Step 3: 运行转换脚本**

```bash
cd /e/scan-mini-app && node scripts/convert-catalog.mjs
```

预期: `Converted: XX categories, XX products`

- [ ] **Step 4: 验证数据格式**

```bash
cd /e/scan-mini-app && node -e "
const c = require('./src/data/categories.json');
const p = require('./src/data/products.json');
console.log('Categories:', c.length);
console.log('Products:', p.length);
console.log('First product:', JSON.stringify(p[0], null, 2));
console.log('All images exist:', p.every(x => require('fs').existsSync('./public' + x.image.replace('/images', '/images'))));
"
```

- [ ] **Step 5: Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: add product images, categories.json, products.json"
```

---

### Task 4: 实现主页 Home.vue

**Files:**
- Overwrite: `src/pages/Home.vue`

- [ ] **Step 1: 实现主页完整代码**

```vue
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import categories from '@/data/categories.json'
import products from '@/data/products.json'

const router = useRouter()
const activeCategoryId = ref(categories[0]?.id ?? '')
const searchKeyword = ref('')
const showSearch = ref(false)

const filteredProducts = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  let pool = kw
    ? products
    : products.filter(p => p.categoryId === activeCategoryId.value)

  if (kw) {
    pool = pool.filter(p => p.name.toLowerCase().includes(kw) ||
      p.variants.some(v => v.label.toLowerCase().includes(kw)))
  }
  return pool.flatMap(p =>
    p.variants.map(v => ({ ...p, activeVariant: v }))
  )
})

function selectCategory(id) {
  activeCategoryId.value = id
  searchKeyword.value = ''
}

function goDetail(product) {
  router.push({
    name: 'Detail',
    params: { productId: product.id, variantId: product.activeVariant.id },
  })
}
</script>

<template>
  <div class="home">
    <!-- 顶栏 -->
    <header class="home-header">
      <span class="home-title">五金目录</span>
      <button class="search-btn" @click="showSearch = !showSearch">&#x1F50D;</button>
    </header>

    <!-- 搜索框 -->
    <div v-if="showSearch" class="search-wrap">
      <input
        v-model="searchKeyword"
        class="search-input"
        type="text"
        placeholder="搜索配件名称..."
        autofocus
      />
      <button v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">
        &#x2715;
      </button>
    </div>

    <!-- 分类 Chips -->
    <nav class="chips">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="chip"
        :class="{ 'chip--active': cat.id === activeCategoryId && !searchKeyword }"
        @click="selectCategory(cat.id)"
      >{{ cat.name }}</button>
    </nav>

    <!-- 商品网格 -->
    <div class="grid">
      <div
        v-for="(product, idx) in filteredProducts"
        :key="`${product.id}-${product.activeVariant?.id || idx}`"
        class="card"
        @click="goDetail(product)"
      >
        <div class="card-media">
          <img
            class="card-img"
            :src="product.image"
            :alt="product.name"
            loading="lazy"
          />
        </div>
        <div class="card-body">
          <p class="card-name">{{ product.name }}</p>
          <p class="card-variant">{{ product.activeVariant?.label }}</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProducts.length === 0" class="empty">
        <p>暂无匹配商品</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(245, 245, 247, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.home-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.3px;
}

.search-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: #FFF;
  border-radius: 50%;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* 搜索 */
.search-wrap {
  display: flex;
  align-items: center;
  margin: 0 16px 8px;
  height: 40px;
  padding: 0 14px;
  background: #FFF;
  border-radius: 10px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1D1D1F;
  background: transparent;
}

.search-input::placeholder { color: #B0B0B6; }

.search-clear {
  border: none;
  background: none;
  font-size: 14px;
  color: #B0B0B6;
  cursor: pointer;
  padding: 4px;
}

/* 分类 Chips */
.chips {
  display: flex;
  gap: 8px;
  padding: 8px 16px 14px;
  overflow-x: auto;
  flex-shrink: 0;
  -webkit-overflow-scrolling: touch;
}

.chips::-webkit-scrollbar { display: none; }

.chip {
  padding: 7px 15px;
  border: none;
  background: #FFF;
  color: #1D1D1F;
  border-radius: 18px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 180ms ease-out;
}

.chip--active {
  background: #1D1D1F;
  color: #FFF;
  font-weight: 500;
}

/* 网格 */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 16px 20px;
  flex: 1;
}

/* 卡片 */
.card {
  width: calc(50% - 5px);
  background: #FFF;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 180ms ease-out;
}

.card:active { transform: scale(0.97); }

.card-media {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #F5F5F7;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 8px 10px 12px;
}

.card-name {
  font-size: 12px;
  font-weight: 500;
  color: #1D1D1F;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-variant {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
}

/* 空状态 */
.empty {
  width: 100%;
  text-align: center;
  padding: 80px 0;
  color: #8E8E93;
  font-size: 14px;
}
</style>
```

- [ ] **Step 2: 启动 dev server 验证**

```bash
cd /e/scan-mini-app && npx vite --host 0.0.0.0 --port 5173
```

验证: 分类切换、搜索过滤、卡片渲染、点击跳转详情。

- [ ] **Step 3: Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: implement Home page with categories, search, product grid"
```

---

### Task 5: 实现详情页 Detail.vue

**Files:**
- Overwrite: `src/pages/Detail.vue`

- [ ] **Step 1: 实现详情页**

```vue
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import products from '@/data/products.json'

const route = useRoute()
const router = useRouter()

const product = computed(() => {
  const productId = route.params.productId
  const variantId = route.params.variantId
  const p = products.find(p => p.id === productId)
  if (!p) return null
  const variant = variantId
    ? p.variants.find(v => v.id === variantId)
    : p.variants[0]
  return { ...p, activeVariant: variant }
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="detail">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">&#x2190; 返回</button>

    <template v-if="product">
      <!-- 商品大图 -->
      <div class="detail-media">
        <img class="detail-img" :src="product.image" :alt="product.name" />
      </div>

      <!-- 信息区 -->
      <div class="detail-info">
        <h1 class="detail-name">{{ product.name }}</h1>
        <p v-if="product.activeVariant" class="detail-variant">
          {{ product.activeVariant.label }}
          <span v-if="product.activeVariant.spec"> · {{ product.activeVariant.spec }}</span>
        </p>
        <p v-if="product.desc" class="detail-desc">{{ product.desc }}</p>
      </div>
    </template>

    <div v-else class="detail-empty">
      <p>商品不存在</p>
    </div>
  </div>
</template>

<style scoped>
.detail {
  flex: 1;
  overflow-y: auto;
  background: #FFF;
}

.back-btn {
  display: flex;
  align-items: center;
  border: none;
  background: none;
  padding: 14px 16px;
  font-size: 15px;
  color: #1D1D1F;
  cursor: pointer;
}

.detail-media {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #F5F5F7;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.detail-info {
  padding: 20px 20px 40px;
}

.detail-name {
  font-size: 19px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.detail-variant {
  margin-top: 6px;
  font-size: 14px;
  color: #8E8E93;
}

.detail-desc {
  margin-top: 14px;
  font-size: 14px;
  color: #3A3A3C;
  line-height: 1.6;
}

.detail-empty {
  display: flex;
  justify-content: center;
  padding-top: 100px;
  color: #8E8E93;
  font-size: 14px;
}
</style>
```

- [ ] **Step 2: 验证路由和参数传递**

```bash
cd /e/scan-mini-app && npx vite --host 0.0.0.0 --port 5173
```

从主页点击卡片 → 详情页显示正确商品信息 → 返回按钮回到主页。

- [ ] **Step 3: Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: implement Detail page"
```

---

### Task 6: 实现联系页 Contact.vue

**Files:**
- Overwrite: `src/pages/Contact.vue`

- [ ] **Step 1: 实现联系页**

```vue
<script setup>
</script>

<template>
  <div class="contact">
    <!-- 顶栏 -->
    <header class="contact-header">
      <span class="contact-title">联系我们</span>
    </header>

    <!-- 名片卡片 -->
    <div class="card">
      <h2 class="card-company">鑫盛五金配件</h2>
      <p class="card-tagline">专业家具五金供应商</p>

      <div class="card-details">
        <div class="detail-row">
          <span class="detail-icon">&#x1F4DE;</span>
          <span class="detail-text">138-xxxx-xxxx</span>
        </div>
        <div class="detail-row">
          <span class="detail-icon">&#x1F4CD;</span>
          <span class="detail-text">广东省佛山市xxx五金城A区108号</span>
        </div>
      </div>

      <!-- 微信二维码 -->
      <div class="qr-wrap">
        <img class="qr-img" src="/images/qr.jpg" alt="微信二维码" />
        <p class="qr-label">扫描添加微信</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact {
  flex: 1;
  overflow-y: auto;
}

.contact-header {
  padding: 14px 20px;
  background: rgba(245, 245, 247, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.contact-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

/* 名片卡片 */
.card {
  margin: 24px 20px;
  background: #FFF;
  border-radius: 16px;
  padding: 28px 24px 32px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.card-company {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

.card-tagline {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 4px;
}

/* 联系方式 */
.card-details {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.detail-icon {
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1.5;
}

.detail-text {
  font-size: 14px;
  color: #3A3A3C;
  line-height: 1.5;
}

/* 二维码 */
.qr-wrap {
  margin-top: 24px;
}

.qr-img {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  object-fit: contain;
  background: #F5F5F7;
}

.qr-img[src=""] {
  display: block;
  content: "";
}

.qr-label {
  font-size: 12px;
  color: #8E8E93;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 2: 创建占位二维码**

```bash
# 创建一个 SVG 占位二维码（或直接留空等真实图片）
echo '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><rect width="140" height="140" fill="#F5F5F7"/><text x="70" y="72" font-family="sans-serif" font-size="12" fill="#C7C7CC" text-anchor="middle">二维码</text></svg>' > /e/scan-mini-app/public/images/qr.jpg
# 实际用真实的 qr.png，转 jpg 不划算。直接写为 SVG 即可。
rm /e/scan-mini-app/public/images/qr.jpg
```

改为用纯 CSS 占位，不做假图片。在 Contact.vue 的 qr-wrap 中如果图片加载失败则显示占位文字。

- [ ] **Step 3: 修改 Contact.vue 的二维码部分——完善错误处理**

在 `<style scoped>` 末尾添加:

```css
.qr-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  background: #F5F5F7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C7C7CC;
  font-size: 12px;
  margin: 0 auto;
}
```

二维码暂时没有真实图片，用 div 占位：

```html
<div v-if="false" class="qr-wrap">
  <img class="qr-img" src="/images/qr.jpg" alt="微信二维码" />
  <p class="qr-label">扫描添加微信</p>
</div>
<div v-else class="qr-wrap">
  <div class="qr-placeholder">微信二维码</div>
  <p class="qr-label">扫描添加微信</p>
</div>
```

实际上二维码后续替换时会简单得多，暂时用 v-if 始终走 else 分支。

简化处理——在 template 中直接写占位：

```html
<div class="qr-wrap">
  <div class="qr-placeholder">微信二维码</div>
  <p class="qr-label">扫描添加微信</p>
</div>
```

- [ ] **Step 4: 待获取到二维码图片后追加占位符 qr.jpg**

若有二维码图片，放到 `public/images/qr.jpg`。保存后刷新联系页即显示。

- [ ] **Step 5: 验证 Tab 切换**

```bash
cd /e/scan-mini-app && npx vite --host 0.0.0.0 --port 5173
```

底部 Tab 切换到联系页，名片展示正常。

- [ ] **Step 6: Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: implement Contact page with business card layout"
```

---

### Task 7: 最终验证和生产构建

- [ ] **Step 1: 构建生产包**

```bash
cd /e/scan-mini-app && npx vite build
```

检查 `dist/` 目录生成。

- [ ] **Step 2: 预览构建结果**

```bash
cd /e/scan-mini-app && npx vite preview --host 0.0.0.0
```

用手机浏览器扫码或访问预览地址，测试完整流程。

- [ ] **Step 3: 清理备份文件**

```bash
rm -f /e/scan-mini-app/_catalog_backup.json
rm -rf /e/scan-mini-app/_images_backup
rm -f /e/scan-mini-app/scripts/convert-catalog.mjs
```

- [ ] **Step 4: 补充 package.json 的 preview 脚本**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  }
}
```

确认 package.json 中 scripts 如上所示。

- [ ] **Step 5: 最终 Commit**

```bash
cd /e/scan-mini-app && git add -A && git commit -m "feat: finalize build config, cleanup"
```
