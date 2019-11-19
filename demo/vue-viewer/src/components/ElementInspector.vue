<template>
  <div class="v-application v-application--is-ltr PageInspector">
    <v-expansion-panels v-model="elementInspectorSwitch">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <header>
            <h1>Element inspector</h1>
          </header>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="PageInspectorContainer">
            <v-icon v-if="!currentElement" size="40" color="#cccccc" style="margin-top:10px;"
              >mdi-selection-ellipse-arrow-inside</v-icon
            >
            <span v-if="!currentElement" class="noSelection"
              >Select a word to inspect properties</span
            >
            <ul v-if="currentElement" class="elementProperties">
              <li><next-prev :element="currentElement" /></li>
              <li><span>Type:</span> {{ currentElement.type }}</li>
              <li><span>Id:</span> {{ currentElement.id }}</li>
              <li v-if="currentElement.font">
                <span>Font:</span> {{ currentElement.font }}
                <span>{{ fontInfo(currentElement.font) }}</span>
              </li>
              <li>
                <span>Content:</span>
                <span class="wordContent">{{ recursiveGetContent(currentElement.content) }}</span>
              </li>
              <li v-if="Object.keys(currentElement.properties).length > 0">
                <span>Properties:</span>
                <ul>
                  <li
                    v-for="(option, index) in Object.keys(currentElement.properties)"
                    :key="'Item_' + index"
                  >
                    <span>{{ option }}:</span>
                    <span class="wordContent">{{ currentElement.properties[option] }}</span>
                  </li>
                </ul>
              </li>
              <li v-if="currentElement.type === 'table-cell'">
                <span>Cell spans:</span>
                <ul>
                  <li>
                    <span>colspan:</span>
                    <span class="wordContent">{{currentElement.colspan}}</span>
                  </li>
                  <li>
                    <span>rowspan:</span>
                    <span class="wordContent">{{currentElement.rowspan}}</span>
                  </li>
                </ul>
              </li>
              <li>
                <span>Box:</span>
                <ul>
                  <li
                    v-for="(option, index) in Object.keys(currentElement.box)"
                    :key="'Item_' + index"
                  >
                    <span>{{ option }}:</span>
                    <span class="wordContent">{{ currentElement.box[option] }}</span>
                  </li>
                </ul>
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
import nextPrev from './NextPrevButtons';
export default {
  components: { nextPrev },
  props: {
    pageElements: {
      type: Array,
      required: false,
    },
    selectedElement: {
      type: Object,
      required: false,
    },
    selectedParentElement: {
      type: Object,
      required: false,
    },
    fonts: {
      type: Array,
      required: false,
    },
  },
  computed: {
    ...mapGetters(['elementInspectorSwitchState']),
    elementInspectorSwitch: {
      get() {
        return this.elementInspectorSwitchState;
      },
      set(value) {
        this.switchExpansionPanel({ panel: 'elementInspector', value });
      },
    },
    currentElement() {
      return this.selectedParentElement ? this.selectedParentElement : this.selectedElement;
    },
  },
  methods: {
    ...mapMutations(['switchExpansionPanel']),
    fontInfo(fontId) {
      const font = this.fonts.filter(font => font.id === fontId).shift();
      if (font) {
        return '(' + font.name + ', ' + font.weight + ', size ' + font.size + ')';
      }
      return null;
    },
    recursiveGetContent(content) {
      if (typeof content === 'string') {
        return content;
      } else if (Array.isArray(content)) {
        return content.map(c => this.recursiveGetContent(c)).join(' ');
      } else if (typeof content === 'object') {
        return this.recursiveGetContent(content.content || '');
      }
      return null;
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
.PageInspectorContainer span.noSelection {
  display: block;
  margin: 10px 20px;
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
.PageInspectorContainer .elementProperties li ul li {
  border: 0;
  padding: 0;
}

.PageInspectorContainer span.wordContent {
  display: inline-block;
  max-width: 200px;
  word-break: break-all;
  vertical-align: top;
  margin-left: 10px;
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
