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
    <!-- Header -->
    <header class="home-header">
      <span class="home-title">五金目录</span>
      <button class="search-btn" @click="showSearch = !showSearch">&#x1F50D;</button>
    </header>

    <!-- Search bar -->
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

    <!-- Category Chips -->
    <nav class="chips">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="chip"
        :class="{ 'chip--active': cat.id === activeCategoryId && !searchKeyword }"
        @click="selectCategory(cat.id)"
      >{{ cat.name }}</button>
    </nav>

    <!-- Product Grid -->
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

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 16px 20px;
  flex: 1;
}

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

.empty {
  width: 100%;
  text-align: center;
  padding: 80px 0;
  color: #8E8E93;
  font-size: 14px;
}
</style>
