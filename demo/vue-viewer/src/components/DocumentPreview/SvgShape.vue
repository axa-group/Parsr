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
      :style="`stroke: ${svgLine.color}; stroke-width: ${svgLine.thickness}; opacity: 0.1`"
    />
  </svg>
</template>
