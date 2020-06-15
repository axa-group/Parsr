<template>
  <div class="v-application v-application--is-ltr PageInspector">
    <v-expansion-panels v-model="pageInspectorSwitch">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <header>
            <h1>Visibility Filters</h1>
          </header>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="PageInspectorContainer">
            <v-switch
              v-model="wordsFilter"
              label="Words"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="linesFilter"
              label="Lines"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="paragraphsFilter"
              label="Paragraphs"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="listsFilter"
              label="Lists"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="tablesFilter"
              label="Tables"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="headingsFilter"
              label="Headings"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="tocFilter"
              label="Table of Contents"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-model="marginsFilter"
              label="Page Margins"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
            <v-switch
              v-show="defaultConfig.output.includeDrawings"
              v-model="shapesFilter"
              label="Drawings"
              class="switch"
              color="indigo darken-3"
              :hide-details="true"
              @change="swapFilters()"
            ></v-switch>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
export default {
  data() {
    return {
      tocFilter: this.filters.TOC,
      wordsFilter: this.filters.words,
      linesFilter: this.filters.lines,
      paragraphsFilter: this.filters.paragraphs,
      tablesFilter: this.filters.tables,
      headingsFilter: this.filters.headings,
      listsFilter: this.filters.lists,
      marginsFilter: this.filters.margins,
      shapesFilter: this.filters.shapes,
    };
  },
  props: {
    filters: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['pageInspectorSwitchState']),
    ...mapState(['defaultConfig']),
    pageInspectorSwitch: {
      get() {
        return this.pageInspectorSwitchState;
      },
      set(value) {
        this.switchExpansionPanel({ panel: 'pageInspector', value });
      },
    },
  },
  methods: {
    ...mapMutations(['switchExpansionPanel']),
    swapFilters() {
      const newFilters = {
        TOC: this.tocFilter,
        words: this.wordsFilter,
        lines: this.linesFilter,
        paragraphs: this.paragraphsFilter,
        tables: this.tablesFilter,
        headings: this.headingsFilter,
        lists: this.listsFilter,
        margins: this.marginsFilter,
        shapes: this.shapesFilter,
      };
      this.$store.commit('setInspectorFilters', newFilters);
    },
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

.switch {
  border-bottom: 1px solid #ebebf1;
  margin: 0;
  padding: 10px;
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

div.v-expansion-panels button.v-expansion-panel-header .v-icon {
  color: rgba(0, 0, 0, 0.24) !important;
}
</style>
<style lang="scss">
.PageInspector div.v-expansion-panels div.v-expansion-panel-content__wrap {
  padding: 0;
}
</style>
