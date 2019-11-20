<template>
  <ul class="multi-value">
    <li v-for="(v, i) in value" :key="i">
      <input
        v-if="v === null || typeof v !== 'object'"
        type="text"
        :value="v"
        @change="valueChanged($event, i)"
        :ref="`input_${i}`"
      />
      <ul v-if="v !== null && typeof v === 'object'">
        <li v-for="(key, j) in Object.keys(v)" :key="j">
          <v-select
            v-if="key === 'flavor'"
            :items="['lattice', 'stream']"
            v-model="v[key]"
            :flat="true"
            :hide-details="true"
            background-color="transparent"
            color="rgba(0, 0, 0, 0.54)"
            height="20px"
            class="selectOption flavor"
            :prefix="key"
            solo
          ></v-select>
          <ul v-if="key === 'table_areas' && v.flavor === 'stream'">
            <small style="margin-left: -24px;">{{ key }}</small>
            <li v-for="(area, k) in [...v[key], null]" :key="k">
              <input :value="area" class="large" @change="tableAreaChanged($event, i, k)" />
            </li>
          </ul>
          <div v-if="!['table_areas', 'flavor'].includes(key)">
            <small>{{ key }}</small>
            <input
              type="text"
              class="large"
              :value="v[key]"
              @change="objectChanged($event, i, key)"
            />
          </div>
        </li>
      </ul>
      <v-icon v-if="i + 1 !== value.length" size="20" color="#cccccc" @click="removeValue(i)"
        >mdi-minus-circle-outline</v-icon
      >
      <v-icon v-else size="20" color="#cccccc" @click="addNewValue">
        mdi-plus-circle-outline
      </v-icon>
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
    tableAreaChanged($event, i, j) {
      const target = {
        value: [...this.value],
      };
      if (j + 1 === this.value[i].table_areas.length && $event.target.value) {
        target.value[i].table_areas = (target.value[i].table_areas || []).concat(
          $event.target.value,
        );
      } else {
        target.value[i].table_areas[j] = $event.target.value;
      }

      target.value = target.value.map(v => ({
        ...v,
        table_areas: v.table_areas.filter(a => !!a),
      }));

      $event.target.value = null;
      this.$emit('change', { target });
    },
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
      if (value === 'stream' || value === 'lattice') {
        return 'lattice';
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
    addNewValue() {
      this.$emit('change', {
        target: {
          value: [...this.value, this.emptyValue],
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
.selectOption.flavor {
  font-size: 0.8em;
}
</style>
