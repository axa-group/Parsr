<template>
  <div class="navButton" @click="clicked">
    <img :src="icon" />
    <span>{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  methods: {
    clicked() {
      this.$emit('clicked');
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  display: block;
  margin: 0 auto;
}

.navButton {
  cursor: pointer;
}
</style>
