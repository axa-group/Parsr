<template>
  <div :id="'PageContainer_' + page.pageNumber" class="PageContainer">
    <svg
      class="Page"
      :id="'SVG_' + page.pageNumber"
      :style="{
        fontSize: '7px',
        zoom: zoom * zoomToFitPage,
        transform: pageTransformation,
        transformOrigin: page.rotation.origin.x + 'px ' + page.rotation.origin.y + 'px',
      }"
      :width="page.box.w"
      :height="page.box.h"
    >
      <svg v-show="pageMarginsFilter">
        <line
          stroke-dasharray="5,5"
          :x1="page.margins.left"
          :y1="0"
          :x2="page.margins.left"
          :y2="page.box.h"
          style="stroke: #aeaeae"
        />
        <line
          stroke-dasharray="5,5"
          :x1="page.margins.right"
          :y1="0"
          :x2="page.margins.right"
          :y2="page.box.h"
          style="stroke: #aeaeae"
        />
        <line
          stroke-dasharray="5,5"
          :x1="0"
          :y1="page.margins.top"
          :x2="page.box.w"
          :y2="page.margins.top"
          style="stroke: #aeaeae"
        />
        <line
          stroke-dasharray="5,5"
          :x1="0"
          :y1="page.margins.bottom"
          :x2="page.box.w"
          :y2="page.margins.bottom"
          style="stroke: #aeaeae"
        />
      </svg>
      <g
        :style="{
          transform: contentTransformation,
          transformOrigin: page.rotation.origin.x + 'px ' + page.rotation.origin.y + 'px',
        }"
      >
        <imageData
          v-for="element in images"
          :key="element.id"
          :element="element"
          :fonts="fonts"
          :documentId="documentId"
          :apiURL="baseAPIUrl"
          @custom-event="elementSelected"
        />
        <heading
          v-for="element in headings"
          :key="`heading_${element.id}`"
          :element="element"
          :fonts="fonts"
          @custom-event="elementSelected"
        />
        <paragraph
          v-for="element in paragraphs"
          :key="`paragraph_${element.id}`"
          :element="element"
          :fonts="fonts"
          @custom-event="elementSelected"
        />
        <tableData
          v-for="element in tables"
          :key="`table_${element.id}`"
          :element="element"
          :fonts="fonts"
          @custom-event="elementSelected"
        />
        <list
          v-for="element in lists"
          :key="`list_${element.id}`"
          :element="element"
          :fonts="fonts"
          @custom-event="elementSelected"
        />
        <table-of-contents
          v-for="element in toc"
          :key="`toc_${element.id}`"
          :element="element"
          :fonts="fonts"
          @custom-event="elementSelected"
        />
        <svg-shape v-for="element in shapes" :key="`shape_${element.id}`" :element="element" />
      </g>
    </svg>
  </div>
</template>

<script>
// import PageElements from '@/components/DocumentPreview/PageElements';
import scrollItemMixin from '@/mixins/scrollItemMixin.js';
import Paragraph from '@/components/DocumentPreview/Paragraph';
import Heading from '@/components/DocumentPreview/Heading';
import TableData from '@/components/DocumentPreview/Table';
import TableOfContents from '@/components/DocumentPreview/TableOfContents';
import List from '@/components/DocumentPreview/List';
import ImageData from '@/components/DocumentPreview/Image';
import SvgShape from '@/components/DocumentPreview/SvgShape';
import { mapState, mapGetters } from 'vuex';
export default {
  components: { Paragraph, Heading, TableData, List, ImageData, TableOfContents, SvgShape },
  mixins: [scrollItemMixin],
  data() {
    return {
      elementsOfType: {},
      containerSize: { width: 0, height: 0 },
      zoomToFitPage: 1.0,
      appeared: false,
      lastWordSelected: null,
    };
  },
  props: {
    page: {
      type: Object,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
    fonts: {
      type: Array,
      required: false,
    },
  },
  computed: {
    ...mapGetters(['baseAPIUrl', 'pageMarginsFilter']),
    ...mapState({
      documentId: state => state.uuid,
    }),
    headings() {
      return this.elementsOfType['heading'] || [];
    },
    paragraphs() {
      return this.elementsOfType['paragraph'] || [];
    },
    tables() {
      return this.elementsOfType['table'] || [];
    },
    lists() {
      return this.elementsOfType['list'] || [];
    },
    images() {
      return this.elementsOfType['image'] || [];
    },
    toc() {
      return this.elementsOfType['table-of-contents'] || [];
    },
    shapes() {
      return this.elementsOfType['drawing'] || [];
    },
    pageElements() {
      if (!this.appeared) {
        return [];
      }
      return this.page.elements;
    },
    scroll() {
      return document.getElementById('DocPagesContainer');
    },
    container() {
      return document.getElementById('PageContainer_' + this.page.pageNumber);
    },
    isPageLandscape() {
      return this.pageSize.width > this.pageSize.height;
    },
    pageSize() {
      if (Math.abs(this.page.rotation.degrees) == 90) {
        return { width: this.page.box.h, height: this.page.box.w };
      }
      return { width: this.page.box.w, height: this.page.box.h };
    },
    pageTransformation() {
      if (this.page.rotation.degrees % 90 != 0) {
        return 'none';
      }
      return (
        'translateX(' +
        this.page.rotation.translation.x +
        'px) translateY(' +
        this.page.rotation.translation.y +
        'px) rotate(' +
        this.page.rotation.degrees +
        'deg)'
      );
    },
    contentTransformation() {
      if (this.page.rotation.degrees % 90 != 0) {
        return (
          'translateX(' +
          this.page.rotation.translation.x +
          'px) translateY(' +
          this.page.rotation.translation.y +
          'px) rotate(-' +
          this.page.rotation.degrees +
          'deg)'
        );
      }
      return 'none';
    },
    componentFor() {
      return element => {
        switch (element.type) {
          case 'paragraph':
          case 'heading':
            return 'Paragraph';
          default:
            console.log('UNKNOWN TYPE ' + element.type + ' ID ' + element.id);
            return null;
        }
      };
    },
  },
  methods: {
    elementSelected(element) {
      // if a Word is clicked, I make sure to remove all remaining highlighted elements instead of just the last clicked element
      const highlightedWords = document.getElementsByClassName('highlighted');
      Array.from(highlightedWords || []).forEach(elem => {
        elem.classList.remove('highlighted');
      });

      const shouldFill =
        (this.lastWordSelected && this.lastWordSelected.id !== element.id) ||
        !this.lastWordSelected;

      if (shouldFill) {
        document.getElementById('Word_' + element.id).classList.add('highlighted');
        this.lastWordSelected = element;
      } else {
        document.getElementById('Word_' + element.id).classList.remove('highlighted');
        this.lastWordSelected = null;
      }

      this.$store.commit('setElementSelected', element);
    },
    fitPageToScreen() {
      var maxWidth = parseFloat(window.getComputedStyle(this.scroll).width) - 40;
      var maxHeight = parseFloat(window.getComputedStyle(this.scroll).height) - 40;

      var newZoom = maxWidth / this.pageSize.width;
      if (this.isPageLandscape) {
        if (newZoom * this.pageSize.height > maxHeight) {
          newZoom = maxHeight / this.pageSize.height;
        }
      } else {
        newZoom = maxHeight / this.pageSize.height;
        if (newZoom * this.pageSize.width > maxWidth) {
          newZoom = maxWidth / this.pageSize.width;
        }
      }
      this.zoomToFitPage = newZoom;
    },
  },
  updated: function() {
    this.container.style.height = parseFloat(this.containerSize.height) * this.zoom + 'px';
    this.container.style.width = parseFloat(this.containerSize.width) * this.zoom + 'px';
  },
  mounted: function() {
    this.$nextTick(function() {
      var style = window.getComputedStyle(this.scroll);
      this.containerSize = { width: parseFloat(style.width), height: parseFloat(style.height) };
      this.fitPageToScreen();
    });

    this.onAppear(
      'PageContainer_' + this.page.pageNumber,
      () => {
        this.appeared = true;
      },
      0.1,
    );
  },
  watch: {
    'pageElements.length': {
      handler() {
        this.elementsOfType = {};
        this.pageElements.forEach(element => {
          if (!this.elementsOfType[element.type]) {
            this.elementsOfType[element.type] = [];
          }
          this.elementsOfType[element.type].push(element);
        });
      },
    },
  },
};
</script>

<style lang="scss">
.PageContainer {
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.Page {
  background-color: white;
  border: 1px solid rgb(204, 204, 231);
  margin: 0 auto;
  position: relative;
}

.Page text {
  font-family: Times, serif;
}
.Page rect {
  fill: transparent;
}
.Page rect.Word,
.Page g.WordGroup text {
  cursor: pointer;
}
.Page g.WordGroup:hover text,
.Page text.highlighted {
  cursor: pointer;
  fill: red !important;
}
.Page rect.Image {
  fill: fuchsia !important;
}

.VisibleWords rect.Word {
  fill: transparent;
  stroke: rgb(0, 124, 12);
  stroke-opacity: 0.5;
  stroke-width: 1;
}
.VisibleParagraphs rect.Paragraph,
.Page rect.Paragraph.highlighted {
  fill: transparent;
  stroke: red;
  stroke-width: 1;
}
.VisibleHeadings rect.Heading,
.Page rect.Heading.highlighted {
  fill: transparent;
  stroke: fuchsia;
  stroke-width: 1;
}
.VisibleLines line.textLine,
.Page line.textLine.highlighted {
  stroke: rgb(0, 0, 255);
  stroke-width: 1;
}
.VisibleTables rect.Table,
.VisibleTables line.TableRow,
.VisibleTables rect.TableCell,
.Page rect.TableCell.highlighted,
.Page rect.TableRow.highlighted,
.Page rect.Table.highlighted {
  fill: transparent;
  stroke: rgb(0, 204, 255);
  stroke-width: 1;
}
g.TableContainer text {
  dominant-baseline: text-after-edge;
}

.VisibleLists rect.List {
  fill: transparent;
  stroke: orange;
  stroke-width: 1;
}

.VisibleTOC rect.TOC {
  stroke: purple;
  stroke-width: 1;
}

svg.Drawing {
  display: none;
}

.VisibleShapes svg.Drawing,
svg.Drawing.highlighted {
  display: block;
}
</style>
