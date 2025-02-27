<template>
  <div ref="popupRef" class="popup">
    <transition name="fade">
      <div class="popup-content">
        <div v-if="loading" class="loading"><span>加载中...</span></div>
        <video style="width: 100%; height: 100%" autoplay muted poster loop>
          <source
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
            type="video/webm"
          />

          <source
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
            type="video/mp4"
          />

          Download the
          <a href="/media/cc0-videos/flower.webm">WEBM</a>
          or
          <a href="/media/cc0-videos/flower.mp4">MP4</a>
          video.
        </video>
        <!-- 关闭按钮 -->
        <div class="popup-close" @click="showPopup = false">
          <svg
            t="1729667484813"
            class="icon"
            viewBox="0 0 1026 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="7739"
            width="25"
            height="25"
          >
            <path
              d="M603.52 512l274.56-274.56a64 64 0 0 0 16.64-64 64 64 0 0 0-45.44-45.44 64 64 0 0 0-64 16.64L512 421.76l-273.28-275.2a64 64 0 0 0-90.88 90.88L423.04 512l-275.2 274.56a64 64 0 0 0 0 90.24A64 64 0 0 0 192 896a64 64 0 0 0 45.44-19.2L512 602.24l275.2 274.56a64 64 0 0 0 44.8 19.2 64 64 0 0 0 45.44-109.44L603.52 512z"
              fill="#445365"
              p-id="7740"
            ></path>
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, nextTick, watch } from "vue";
const showPopup = ref(false);
const dom = useTemplateRef("popupRef");
const loading = ref(false);

defineExpose({
  dom,
  showPopup,
});
</script>

<style lang="scss" scoped>
/* we will explain what these classes do next! */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.popup {
  width: 400px;
  aspect-ratio: 16/9;
  transition: all 0.5s;
  position: relative;
  color: #fff;
  font-size: 18px;
  .popup-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #2e2a58;
  }
  .loading {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &-close {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    color: #2f23da;
  }
}
</style>
