<template>
  <ul class="PreviewZoom">
    <li @click="$emit('zoomIn')"><img :src="zoomInIcon" /></li>
    <li @click="$emit('zoomOut')"><img :src="zoomOutIcon" /></li>
    <li><img :src="zoomFitIcon" /></li>
  </ul>
</template>

<script>
import ZoomInIcon from '@/assets/zoom-in.png';
import ZoomOutIcon from '@/assets/zoom-out.png';
import ZoomFitIcon from '@/assets/zoom-fit.png';

export default {
  data() {
    return {
      zoomInIcon: ZoomInIcon,
      zoomOutIcon: ZoomOutIcon,
      zoomFitIcon: ZoomFitIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
.PreviewZoom {
  background-color: white;
  border: solid 1px #e8e8f1;
  border-radius: 5px;
  bottom: 20px;
  list-style-type: none;
  margin: 0px;
  padding: 0px;
  position: absolute;
  right: 20px;
  z-index: 2;
}

.PreviewZoom li {
  border-bottom: solid 1px #e8e8f1;
  font-size: 0;
  padding: 8px;
  text-align: center;
}
.PreviewZoom li:last-of-type {
  border-bottom: 0px;
}
</style>
