<template>
  <ul class="multi-value">
    <li v-for="(v, i) in [...value, newValue]" :key="i">
      <input
        v-if="v === null || typeof v !== 'object'"
        type="text"
        :value="v"
        @change="valueChanged($event, i)"
        :ref="`input_${i}`"
      />
      <ul v-if="v !== null && typeof v === 'object'">
        <li v-for="(key, i) in Object.keys(v)" :key="i">
          <small>{{key}}</small>
          <input type="text" class="large" :value="v[key]" />
        </li>
      </ul>
      <v-icon
        v-if="value.length > 0 && i !== value.length"
        size="20"
        color="#cccccc"
        @click="removeValue(i)"
      >mdi-minus-circle-outline</v-icon>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    newValue() {
      let newValue = null;
      if (this.value && this.value[0] && typeof this.value[0] === 'object') {
        newValue = {};
        Object.keys(this.value[0]).forEach(key => {
          newValue[key] = null;
        });
      }
      return newValue;
    },
  },
  methods: {
    removeValue(index) {
      this.$emit('change', {
        target: {
          value: [...this.value.filter((_, i) => index !== i)],
        },
      });
    },
    valueChanged($event, i) {
      const target = {
        value: [...this.value],
      };
      if (i === this.value.length) {
        target.value = target.value.concat($event.target.value);
      } else {
        target.value[i] = $event.target.value;
      }

      this.$emit('change', { target });

      this.$nextTick(() => {
        this.$refs[`input_${this.value.length}`][0].focus();
      });
    },
  },
};
</script>

<style>
.multi-value {
  display: flex;
  flex-direction: column;
  margin-left: 31px !important;
  margin-bottom: 10px;
}

.multi-value input {
  border: solid 1px #ccc;
  width: 60px;
  font-size: 0.8em;
  vertical-align: middle;
  margin-left: 5px;
  text-align: center;
}

.multi-value input.large {
  width: 100px;
}

.multi-value .v-icon {
  cursor: pointer;
}
.multi-value .v-icon:hover {
  color: #aaa !important;
}
</style>