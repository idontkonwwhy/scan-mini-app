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
