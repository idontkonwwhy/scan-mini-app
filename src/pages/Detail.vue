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
    <button class="back-btn" @click="goBack">&#x2190; 返回</button>

    <template v-if="product">
      <div class="detail-media">
        <img class="detail-img" :src="product.image" :alt="product.name" />
      </div>
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
