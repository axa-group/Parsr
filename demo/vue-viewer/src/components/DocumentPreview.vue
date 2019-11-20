<template>
  <div class="DocPreview">
    <div id="DocPagesContainer" @scroll="handleScroll">
      <Page
        v-for="(page, index) in document.pages"
        :key="index"
        :page="page"
        :fonts="document.fonts"
        :zoom="zoom"
      />
    </div>
    <documentZoom @zoomIn="zoomInClicked" @zoomOut="zoomOutClicked" />
  </div>
</template>

<script>
//import lazyLoadComponent from '@/utils/lazy-Load-Components.js';
//import PageSkeleton from '@/components/DocumentPreview/PageSkeleton';

import { smoothScroll, isVisibleInScroll } from '@/mixins/smoothScroll.js';
import DocumentZoom from '@/components/DocumentPreview/Zoom';
import Page from '@/components/DocumentPreview/Page';

var timer = null;
export default {
  data() {
    return {
      handleScrollEnabled: true,
      watchSelectedPageEnabled: true,
      zoomFactor: 0,
    };
  },
  props: {
    document: {
      type: Object,
      required: true,
    },
    selectedPage: {
      type: Number,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
  },
  computed: {
    scroll() {
      return document.getElementById('DocPagesContainer');
    },
    page() {
      return index => document.getElementById('PageContainer_' + index);
    },
  },
  components: {
    DocumentZoom,
    Page,
  },
  beforeUpdate: function() {
    //ZoomOut requires to be procesed before DOOM changes
    //because we need adjust croll offset top before apply new zoom
    if (this.zoomFactor < 0) {
      const difZoom = Math.abs(1 - this.zoomFactor).toFixed(1);
      this.scroll.scrollTop = this.scroll.scrollTop / difZoom;
    }
  },
  updated: function() {
    //ZoomIn requires to be procesed after DOOM changes because we
    //need adjust scroll offset top after new zoom is applied
    this.$nextTick(function() {
      var scrollWidth = parseFloat(window.getComputedStyle(this.scroll).width);
      var pageWidth = parseFloat(window.getComputedStyle(this.page(this.selectedPage)).width);
      if (pageWidth >= scrollWidth) {
        this.scroll.scrollLeft = (pageWidth - scrollWidth) / 2;
      }
      if (this.zoomFactor > 0) {
        this.scroll.scrollTop += this.scroll.scrollTop * this.zoomFactor;
      }
    });
  },
  watch: {
    selectedPage(index) {
      if (!this.watchSelectedPageEnabled) {
        return;
      }

      this.handleScrollEnabled = false;
      var page = this.page(index),
        style = window.getComputedStyle(page),
        marginTop = parseInt(style.getPropertyValue('margin-top'));

      smoothScroll(this.scroll, page.offsetTop - marginTop, 500, () => {
        this.handleScrollEnabled = true;
      });
    },
    zoom(newValue, oldValue) {
      this.zoomFactor = parseFloat(newValue - oldValue).toFixed(1);
    },
  },
  methods: {
    zoomInClicked() {
      this.$store.commit('zoomIn');
    },
    zoomOutClicked() {
      this.$store.commit('zoomOut');
    },
    handleScroll() {
      if (!this.handleScrollEnabled) {
        return;
      }
      var nextPage = this.page(this.selectedPage + 1);
      var prevPage = this.page(this.selectedPage - 1);
      if (nextPage && isVisibleInScroll(nextPage, this.scroll)) {
        this.watchSelectedPageEnabled = false;
        this.$store.commit('setSelectedPage', this.selectedPage + 1);
      } else if (prevPage && isVisibleInScroll(prevPage, this.scroll)) {
        this.watchSelectedPageEnabled = false;
        this.$store.commit('setSelectedPage', this.selectedPage - 1);
      }
      this.checkScrollEnded(() => {
        this.watchSelectedPageEnabled = true;
      });
    },
    checkScrollEnded(completion = null) {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        if (completion) completion();
      }, 150);
    },
  },
};
</script>

<style lang="scss" scoped>
.DocPreview {
  background-color: #f9f9fd;
  height: 100%;
  overflow: hidden;
  position: relative;
}
#DocPagesContainer {
  overflow: auto;
  height: 100%;
  z-index: 1;
}
.Page {
  margin: 0 auto;
}
</style>
