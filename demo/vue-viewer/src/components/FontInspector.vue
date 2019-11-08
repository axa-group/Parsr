<template>
  <div class="v-application v-application--is-ltr PageInspector">
    <v-expansion-panels v-model="fontInspectorSwitch">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <header>
            <h1>Document fonts</h1>
          </header>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="PageInspectorContainer">
            <ul class="elementProperties">
              <li v-for="font in fonts" :key="font.id">
                <span v-for="(fontKey, index) in Object.keys(font)" :key="index">
                  {{ fontKey }}: <span class="fontValue">{{ font[fontKey] }}</span>
                  <br />
                </span>
                <span>Ratio: {{ fontUsageRatio(font.id) }}</span>
              </li>
            </ul>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters(['fontInspectorSwitchState', 'fonts', 'fontUsageRatio']),
    fontInspectorSwitch: {
      get() {
        return this.fontInspectorSwitchState;
      },
      set(value) {
        this.switchExpansionPanel({ panel: 'fontInspector', value });
      },
    },
  },
  methods: {
    ...mapMutations(['switchExpansionPanel']),
  },
};
</script>

<style lang="scss" scoped>
.PageInspector {
  text-align: center;
  display: block;
}
.PageInspector header {
  background-color: #ebebf1;
  color: #2c3034;
  text-align: left;
  padding: 5px 0px;
}
.PageInspector header h1 {
  font-size: 1em;
  padding: 0.5em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 70%;
  display: inline-block;
  vertical-align: middle;
}
.PageInspectorContainer .elementProperties {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}
.PageInspectorContainer .elementProperties li {
  text-align: left;
  border-bottom: solid 1px #ebebf1;
  padding: 8px 0 8px 8px;
}
.PageInspectorContainer .elementProperties li span {
  color: #6c6c6c;
}
.PageInspectorContainer .elementProperties li span.fontValue {
  color: #000;
}
div.v-expansion-panels div.v-expansion-panel {
  background-color: transparent;
}
div.v-expansion-panels div.v-expansion-panel:before {
  box-shadow: none;
}
div.v-expansion-panels button.v-expansion-panel-header {
  padding: 0;
  min-height: 0;
  color: rgba(0, 0, 0, 0.54);
  background-color: #ebebf1;
  border-radius: 0;
}
</style>
