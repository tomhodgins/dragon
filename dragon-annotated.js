
var Dragon = function () {

	// Create some variables we can use later
	var grab = startX = startY = oldTop = oldLeft = 0;

	// This is the pick function
	self.pick = function (event) {

		// Prevent the default action
		event.preventDefault();

		// If the element being clicked/tapped isn't the body or HTML element, do the following
		if (event.target !== document.documentElement && event.target !== document.body) {

			// Set 'grab' to the time right now
			grab=Date.now();

			// Add a 'data-drag' attribute to the picked element and assign the time they started grabbing it
			event.target.setAttribute('data-drag',grab);

			// Add `position: relative;` to the picked element
			event.target.style.position='relative';

			// Remember the original `top: ;` and `left: ;` values, or if they aren't set yet go with 0 instead
			oldTop=event.target.style.top.split('px')[0]||0;
			oldLeft=event.target.style.left.split('px')[0]||0;

		}

		// Let's remember the start x and y coordinates of the cursor when starting a click or tap
		startX=e.clientX||e.touches[0].clientX;
		startY=e.clientY||e.touches[0].clientY;

	}

	// This is the drag function
	self.drag = function (event) {

		// If grab isn't empty, there's currently an object being dragged, do this
		if (grab !== '') {

			// Let's find the element on the page whose data-drag="" value matches the value of grab right now
			var element = document.querySelector('[data-drag="' + grab + '"]');

			// And to that element, let the new value of `top: ;` be equal to the old top position, plus the difference between the original top position and the current cursor position
			element.style.top = parseInt(oldTop) + parseInt((e.clientY||e.touches[0].clientY)-startY) + 'px';

			// And let the new value of `left: ;` be equal to the old left position, plus the difference between the original left position and the current cursor position
			element.style.left = parseInt(oldLeft) + parseInt((e.clientX||e.touches[0].clientX)-startX) + 'px';

		}

	}

	// The grabRelease function empties grab, forgetting which element has been picked.
	self.grabRelease = function (event) {
		grab = '';
	}

	// This is the mouseOver() function
	self.mouseOver = function (event) {

		// Set the cursor to 'move' wihle hovering an element you can reposition
		e.target.style.cursor = 'move';

		// Add a green box-shadow to show what container your hovering on
		e.target.style.boxShadow = 'inset lime 0 0 1px, lime 0 0 1px';

	}

	// This is the mouseOut() function
	self.mouseOut = function (event) {

		// Remove the move cursor and green box-shadow
		e.target.style.cursor = e.target.style.boxShadow = '';

	}



	// Generic prevent default behaviour for event callbacks
	self.preventDefaultCallback = function (event) {
		e.preventDefault();
	};



	// Set up all bindings
	self.bind = function (doc) {

		// Disallow clicks
		doc.addEventListener('click', self.preventDefaultCallback, true);

		// On mousedown or touchstart, run the pick() function
		doc.addEventListener('mousedown', self.pick);
		doc.addEventListener('touchstart', self.pick);

		// All the time you move the mouse or drag your finger, run the function drag()
		doc.addEventListener('mousemove', self.drag);
		doc.addEventListener('touchmove', self.drag);

		// On mouseup or touchend, run the grabRelease() function
		doc.addEventListener('mouseup', self.grabRelease);
		doc.addEventListener('touchend', self.grabRelease);

		// On mouseover, run the mouseOver() function
		doc.addEventListener('mouseover', self.mouseOver);

		// On mouseover, run the out() function
		doc.addEventListener('mouseout', self.mouseOut);

		return self;
	}

};



// Startup process
var DragonInstance = new DragonMain();
dragonInstance.bind(document);
