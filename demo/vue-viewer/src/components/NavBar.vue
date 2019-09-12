<template>
	<div id="nav">
		<span class="brand">
			<span>Parsr</span>
		</span>

		<router-link to="/upload">
			Upload
		</router-link>
		<router-link to="/viewer">
			Document viewer
		</router-link>
		<nav-item text="Search" :icon="searchIcon" @clicked="searchClick" />
		<nav-item text="Guide" :icon="guideIcon" @clicked="guideClick" />
	</div>
</template>

<script>
import NavItem from '@/components/NavBarItem.vue';
import SearchIcon from '@/assets/search.png';
import GuideIcon from '@/assets/guide.png';

export default {
	components: { NavItem },
	data() {
		return {
			searchIcon: SearchIcon,
			guideIcon: GuideIcon,
		};
	},
	methods: {
		searchClick() {
			console.log('searchClick');
		},
		guideClick() {
			console.log('guideClick');
		},
	},
};
</script>
<style lang="scss" scoped>
#nav .brand {
	margin-bottom: 8px;
}
#nav .brand span {
	font-weight: bold;
	font-size: 2em;
	color: #00008a;
	margin: 0 0 0 0.3em;
}
#nav .brand * {
	vertical-align: middle;
}
#nav a {
	font-weight: bold;
	font-size: 1.2em;
	color: #aeaeae;
	margin: 0 0.8em 0 0.4em;
	padding: 1em 0 0.6em 0;
	text-decoration: none;
	border-bottom: 3px solid transparent;
}

#nav a:first-of-type {
	margin-left: 2em;
}

#nav a.router-link-exact-active {
	color: #00008a;
	border-bottom: 3px solid #00008a;
}
#nav {
	display: flex;
	align-items: center;
	padding: 8px 8px 0 8px;
}

#nav .navButton {
	color: #aeaeae;
	font-size: 0.8em;
	margin-left: 0;
	margin-right: 1em;
}
#nav .navButton:first-of-type {
	margin-left: auto;
}
</style>
