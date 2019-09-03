<template>
	<div :id="'PageContainer_' + page.pageNumber" class="PageContainer">
		<svg
			class="Page"
			:id="'SVG_' + page.pageNumber"
			:style="{ zoom: zoom * zoomToFitPage }"
			:width="page.box.w"
			:height="page.box.h"
		>
			<!--text x="10" y="20" fill="red">
				Debug Info: Page {{ page.pageNumber }} - Viewer Zoom {{ zoom }} - Page Zoom to fit
				{{ zoomToFitPage }}
			</text-->
			<!--pageElements v-for="element in page.elements" :key="element.id" :element="element" /-->
			<paragraph
				v-for="element in pageElements"
				:key="element.id"
				:element="element"
				:fonts="fonts"
			/>
		</svg>
	</div>
</template>

<script>
//import PageElements from '@/components/DocumentPreview/PageElements';
import scrollItemMixin from '@/mixins/scrollItemMixin.js';
import Paragraph from '@/components/DocumentPreview/Paragraph';
export default {
	components: { Paragraph },
	mixins: [scrollItemMixin],
	data() {
		return {
			containerSize: { width: 0, height: 0 },
			zoomToFitPage: 1.0,
			appeared: false,
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
			return this.page.box.w > this.page.box.h;
		},
	},
	methods: {
		fitPageToScreen() {
			if (this.isPageLandscape) {
				var maxWidth = parseFloat(window.getComputedStyle(this.scroll).width) - 40;
				this.zoomToFitPage = maxWidth / this.page.box.w;
			} else {
				var maxHeight = parseFloat(window.getComputedStyle(this.scroll).height) - 40;
				this.zoomToFitPage = maxHeight / this.page.box.h;
			}
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

		this.onAppear('PageContainer_' + this.page.pageNumber, 0.1, () => {
			this.appeared = true;
		});
	},
};
</script>

<style lang="scss">
.PageContainer {
	/*border-top: 1px solid black;
	border-bottom: 1px solid green;*/
	margin: 0 auto;
}
.Page {
	background-color: white;
	border: 1px solid rgb(204, 204, 231);
	margin: 0 auto;
	position: relative;
	top: 50%;
	-webkit-transform: translateY(-50%);
	-ms-transform: translateY(-50%);
	transform: translateY(-50%);
}

/*text {
	font-size: 1em;
}*/

.Page text {
	font-family: Times, serif;
}
.Page rect {
	fill: transparent;
}
.VisibleWords rect:not(.Paragraph) {
	fill: transparent;
	stroke: rgb(0, 124, 12);
	stroke-opacity: 0.5;
	stroke-width: 1;
}
.VisibleParagraphs rect.Paragraph {
	fill: transparent;
	stroke: red;
	stroke-width: 1;
}
.VisibleLines line {
	stroke: rgb(0, 0, 255);
	stroke-width: 1;
}
</style>
