<template functional>
  <g class="WordGroup">
    <rect
      class="Word"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
      @click="listeners['custom-event'](props.element)"
    />
    <text
      :id="'Word_' + props.element.id"
      :x="props.element.box.l"
      :y="props.element.box.t + props.element.box.h"
      :textLength="props.element.box.w"
      :lengthAdjust="
        props.fonts.filter(font => font.id === props.element.font).shift().size
          ? 'spacing'
          : 'spacingAndGlyphs'
      "
      :style="{
        fontFamily: props.fonts.filter(font => font.id === props.element.font).shift().name,
        fontSize: $options.methods.fontSize(props),
        fill:
          props.fonts.filter(font => font.id === props.element.font).shift().color != '#ffffff'
            ? props.fonts.filter(font => font.id === props.element.font).shift().color
            : '#000',
        fontWeight: props.fonts.filter(font => font.id === props.element.font).shift().weight,
        fontStyle: props.fonts.filter(font => font.id === props.element.font).shift().isItalic
          ? 'italic'
          : '',
      }"
      @click="listeners['custom-event'](props.element)"
    >
      {{ !Array.isArray(props.element.content) ? props.element.content.trim() : 'Array empty' }}
      {{ props.element.fakeSpace ? '&nbsp;' : '' }}
    </text>
  </g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
  mixins: [pageElementMixin],
  methods: {
    fontSize(props) {
      const font = props.fonts.filter(font => font.id === props.element.font).shift();
      if (font.size == 0) {
        return props.element.box.h + 'px';
      }
      return font.size * 0.6 + font.sizeUnit;
    },
  },
};
</script>
