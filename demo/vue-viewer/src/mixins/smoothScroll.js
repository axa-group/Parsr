export const smoothScroll = (element, to = 0, duration = 500, scrollToDone = null) => {
	const start = element.scrollTop;
	const change = to - start;
	const increment = 20;
	let currentTime = 0;

	const animateScroll = () => {
		currentTime += increment;

		const val = Math.easeInOutQuad(currentTime, start, change, duration);

		element.scrollTop = val;

		if (currentTime < duration) {
			setTimeout(animateScroll, increment);
		} else {
			if (scrollToDone) scrollToDone();
		}
	};
	animateScroll();
};

Math.easeInOutQuad = function(t, b, c, d) {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t + b;
	t--;
	return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const isVisibleInScroll = (elem, scroll) => {
	var style = window.getComputedStyle(elem);
	var height = parseInt(style.getPropertyValue('height'));

	return (
		elem.offsetTop + 100 >= scroll.scrollTop &&
		elem.offsetTop + height - 100 < scroll.offsetHeight + scroll.scrollTop
	);
};
