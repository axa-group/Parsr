<template>
  <div class="Thumbnails">
    <header>
      <h1>{{ title }}</h1>
      <span>{{ totalPages }}p.</span>
    </header>
    <span>Pages {{ availablePages[0] }} to {{ availablePages[availablePages.length - 1] }}</span>
    <div id="ThumbsContainer" v-if="canShowThumbnails">
      <thumbnail
        class="Thumb"
        v-for="index in availablePages"
        :id="'Thumb_' + index"
        :key="index"
        :class="isSelected(index)"
        :page="index"
        @clicked="thumbClicked(index)"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { smoothScroll, isVisibleInScroll } from '@/mixins/smoothScroll.js';
import Thumbnail from '@/components/Thumbnails/Thumbnail.vue';

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    selectedPage: {
      type: Number,
      required: true,
    },
  },
  components: { Thumbnail },
  methods: {
    isSelected(index) {
      return { selected: index === this.selectedPage };
    },
    thumbClicked(index, updateStore = true) {
      if (index < this.pagination.limit * this.pagination.offset + 1) {
        this.pagination.offset = Math.floor(index / this.pagination.limit);
      } else if (index > this.pagination.limit * this.pagination.offset + this.pagination.limit) {
        this.pagination.offset = Math.ceil(index / this.pagination.limit);
      }

      var thumb = document.getElementById('Thumb_' + index);
      var scroll = document.getElementById('ThumbsContainer');

      if (!isVisibleInScroll(thumb, scroll)) {
        var marginTop = parseInt(window.getComputedStyle(thumb).getPropertyValue('margin-top'));
        smoothScroll(scroll, thumb.offsetTop - marginTop);
      }

      if (updateStore) {
        this.$store.commit('setSelectedPage', index);
      }
    },
  },
  watch: {
    selectedPage(index) {
      this.thumbClicked(index, false);
    },
  },
  data() {
    return {
      allowedFormatsForThumbnails: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'eml'],
    };
  },
  computed: {
    ...mapState(['inputFileName', 'pagination']),
    availablePages() {
      const from = this.pagination.offset * this.pagination.limit + 1;
      const to = Math.min(
        this.pagination.offset * this.pagination.limit + this.pagination.limit,
        this.totalPages,
      );
      const values = [];
      for (let i = from; i <= to; i += 1) {
        values.push(i);
      }
      return values;
    },
    canShowThumbnails() {
      return this.allowedFormatsForThumbnails.includes(
        this.inputFileName
          .toLowerCase()
          .split('.')
          .pop(),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.Thumbnails {
  position: relative;
  border-right: solid 1px #ebebf1;
}
.Thumbnails header {
  background-color: #ebebf1;
  color: #2c3034;
  text-align: center;
}
.Thumbnails header h1 {
  font-size: 1em;
  padding: 0.5em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 70%;
  display: inline-block;
  vertical-align: middle;
}
.Thumbnails header span {
  font-size: 1em;
  background-color: rgb(141, 141, 141);
  color: white;
  font-weight: bold;
  border-radius: 15px;
  padding: 0.1em 0.5em 0.1em 0.6em;
  margin-left: 0.5em;
}

#ThumbsContainer {
  overflow-y: auto;
  position: absolute;
  bottom: 0;
  top: 38px;
  left: 0;
  right: 0;
}

.Thumb:last-of-type {
  margin-bottom: 3vw;
}
</style>
