<template>
  <ul class="multi-value">
    <li v-for="(v, i) in [...value, emptyValue]" :key="i">
      <input
        v-if="v === null || typeof v !== 'object'"
        type="text"
        :value="v"
        @change="valueChanged($event, i)"
        :ref="`input_${i}`"
      />
      <ul v-if="v !== null && typeof v === 'object'">
        <li v-for="(key, j) in Object.keys(v)" :key="j">
          <small>{{ key }}</small>
          <input type="text" class="large" :value="v[key]" @change="objectChanged($event, i, key)" />
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
  data: () => ({
    emptyValue: null,
  }),
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    this.emptyValue = this.newEmptyValue(this.value && this.value[0]);
  },
  methods: {
    newEmptyValue(value) {
      if (Array.isArray(value)) {
        return [];
      }
      if (typeof value === 'object') {
        const newValue = {};
        Object.keys(value).forEach(key => {
          newValue[key] = this.newEmptyValue(value[key]);
        });
        return newValue;
      }
      return null;
    },
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
    objectChanged($event, j, key) {
      const target = {
        value: [...this.value],
      };
      let newValue;
      if (j === this.value.length) {
        newValue = Object.assign({}, this.emptyValue);
        newValue[key] = $event.target.value;
        target.value = target.value.concat(newValue);
      } else {
        target.value[j][key] = $event.target.value;
      }

      this.$emit('change', { target });
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
  float: right;
}
.multi-value .v-icon:hover {
  color: #aaa !important;
}
</style>
