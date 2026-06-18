<script setup>
</script>

<template>
  <div class="contact">
    <header class="contact-header">
      <span class="contact-title">联系我们</span>
    </header>

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

      <div class="qr-wrap">
        <div class="qr-placeholder">微信二维码</div>
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

.qr-wrap {
  margin-top: 24px;
}

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

.qr-label {
  font-size: 12px;
  color: #8E8E93;
  margin-top: 8px;
}
</style>
