<template functional>
  <g class="TableOfContentsContainer">
    <rect
      :id="'TOC_' + props.element.id"
      class="TOC"
      :key="props.element.id"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
      style="fill:white;"
    />
    <component
      :is="props.components.Paragraph"
      v-for="element in props.element.content"
      :key="element.id"
      :element="element"
      :fonts="props.fonts"
      @custom-event="listeners['custom-event']"
    ></component>

    <component
      :is="props.components.Heading"
      v-for="element in props.element.content"
      :key="element.id"
      :element="element"
      :fonts="props.fonts"
      @custom-event="listeners['custom-event']"
    ></component>
  </g>
</template>

<script>
import Paragraph from '@/components/DocumentPreview/Paragraph';
import Heading from '@/components/DocumentPreview/Heading';
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
  props: {
    components: {
      type: Object,
      default() {
        return {
          Paragraph,
          Heading,
        };
      },
    },
  },
  mixins: [pageElementMixin],
};
</script>
