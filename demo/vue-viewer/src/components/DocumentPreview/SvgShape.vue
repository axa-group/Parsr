<template functional>
  <svg>
    <line
      v-for="svgLine in props.element.content"
      :key="svgLine.id"
      :id="'SVG_' + svgLine.id"
      :x1="svgLine.fromX"
      :y1="svgLine.fromY"
      :x2="svgLine.toX"
      :y2="svgLine.toY"
      :stroke="svgLine.color || '#000000'"
      :stroke-opacity="svgLine.hasOwnProperty('strokeOpacity') ? svgLine.strokeOpacity : 0.5"
      :stroke-width="svgLine.hasOwnProperty('thickness') ? svgLine.thickness : 1"
    />
  </svg>
</template>
