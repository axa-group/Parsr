<template>
  <div @click="$emit('clicked', page)" v-observe-visibility="visibilityChanged">
    <img v-if="!errorMessage" :src="thumbnailImage" :class="isLoading" />
    <span v-if="errorMessage">Thumbnail {{ page }}<br />{{ errorMessage }}</span>
  </div>
</template>

<script>
import spinner from '@/assets/loader.gif';
import scrollItemMixin from '@/mixins/scrollItemMixin.js';
export default {
  data() {
    return {
      thumbnailImage: spinner,
      errorMessage: null,
    };
  },
  mixins: [scrollItemMixin],
  props: {
    page: {
      type: Number,
      required: true,
    },
  },
  computed: {
    isLoading() {
      return this.thumbnailImage === spinner ? 'loading' : '';
    },
  },
  methods: {
    visibilityChanged(visible) {
      if (visible) {
        this.$store
          .dispatch('fetchThumbnail', { page: this.page })
          .then(response => {
            this.thumbnailImage = URL.createObjectURL(response.data);
          })
          .catch(error => {
            console.log(error);
            this.errorMessage = error.message;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Thumb {
  margin: 2vw auto 0 auto;
  padding: 1vw;
  font-size: 0;
  border-radius: 10px;
  box-sizing: border-box;
}
.Thumb img {
  max-width: 80%;
  max-height: 100%;
  box-shadow: 0 0 2px 1px #ebebf1;
  margin: 10px;
  //border: solid 10px transparent;
}

.Thumb.selected img {
  border: solid 10px #f5f5f8;
  border-radius: 5px;
  margin: 0px;
}

.Thumb img.loading {
  box-shadow: none;
  border: solid 10px transparent;
}
.Thumb span {
  display: inline-block;
  font-size: 13px;
  max-width: 200px;
  box-shadow: 0 0 2px 1px #ebebf1;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>
