
(function (root) {

	var Dragon = function (doc) {
		var self = this;
		self.doc = doc;

		// Create some variables we can use later
		var grab = startX = startY = oldTop = oldLeft = 0;

		// This is the pick function
		self.pick = function (event) {

			// Prevent the default action
			event.preventDefault();

			// If the element being clicked/tapped isn't the body or HTML element, do the following
			if (event.target !== document.documentElement && event.target !== document.body) {

				// Set 'grab' to the time right now
				grab = Date.now();

				// Add a 'data-drag' attribute to the picked element and assign the time they started grabbing it
				event.target.setAttribute('data-drag', grab);

				// Add `position: relative;` to the picked element
				event.target.style.position = 'relative';

				// Remember the original `top: ;` and `left: ;` values, or if they aren't set yet go with 0 instead
				oldTop = event.target.style.top.split('px')[0] || 0;
				oldLeft = event.target.style.left.split('px')[0] || 0;

			}

			// Let's remember the start x and y coordinates of the cursor when starting a click or tap
			startX = event.clientX||event.touches[0].clientX;
			startY = event.clientY||event.touches[0].clientY;

		}

		// This is the drag function
		self.drag = function (event) {

			// If grab isn't empty, there's currently an object being dragged, do this
			if (grab !== '') {

				// Let's find the element on the page whose data-drag="" value matches the value of grab right now
				var element = document.querySelector('[data-drag="' + grab + '"]');
				if (element && element.style) {

					// And to that element, let the new value of `top: ;` be equal to the old top position, plus the difference between the original top position and the current cursor position
					element.style.top = parseInt(oldTop) + parseInt((event.clientY||event.touches[0].clientY) - startY) + 'px';

					// And let the new value of `left: ;` be equal to the old left position, plus the difference between the original left position and the current cursor position
					element.style.left = parseInt(oldLeft) + parseInt((event.clientX||event.touches[0].clientX) - startX) + 'px';

				}

			}

		}

		// The grabRelease function empties grab, forgetting which element has been picked.
		self.grabRelease = function (event) {
			grab = '';
		}

		// This is the mouseOver() function
		self.mouseOver = function (event) {

			// Set the cursor to 'move' wihle hovering an element you can reposition
			event.target.style.cursor = 'move';

			// Add a green box-shadow to show what container your hovering on
			event.target.style.boxShadow = 'inset lime 0 0 1px, lime 0 0 1px';

		}

		// This is the mouseOut() function
		self.mouseOut = function (event) {

			// Remove the move cursor and green box-shadow
			event.target.style.cursor = event.target.style.boxShadow = '';

		}



		// Generic prevent default behaviour for event callbacks
		self.preventDefaultCallback = function (event) {
			event.preventDefault();
			return false;
		};



		// Set up all bindings
		self.bindMouse = function () {

			// Disallow clicks
			self.doc.addEventListener('click', self.preventDefaultCallback, true);

			// On mousedown or touchstart, run the pick() function
			self.doc.addEventListener('mousedown', self.pick);
			self.doc.addEventListener('touchstart', self.pick);

			// All the time you move the mouse or drag your finger, run the function drag()
			self.doc.addEventListener('mousemove', self.drag);
			self.doc.addEventListener('touchmove', self.drag);

			// On mouseup or touchend, run the grabRelease() function
			self.doc.addEventListener('mouseup', self.grabRelease);
			self.doc.addEventListener('touchend', self.grabRelease);

			// On mouseover, run the mouseOver() function
			self.doc.addEventListener('mouseover', self.mouseOver);

			// On mouseover, run the out() function
			self.doc.addEventListener('mouseout', self.mouseOut);

			return self;

		};



		// Press escape to cancel
		self.bindCancelButton = function () {

			var callback = function (event) {
				event = event || window.event;
				var code = event.keyCode || event.which;

				// Check for escape key
				if (code == 27) {
					self.tearDown();
				}

			};

			self.doc.addEventListener('keydown', callback);

		};



		// Tear up main bindings
		self.removeEventListeners = function () {
			self.doc.removeEventListener('click', self.preventDefaultCallback, true);
			self.doc.removeEventListener('mousedown', self.pick);
			self.doc.removeEventListener('touchstart', self.pick);
			self.doc.removeEventListener('mousemove', self.drag);
			self.doc.removeEventListener('touchmove', self.drag);
			self.doc.removeEventListener('mouseup', self.grabRelease);
			self.doc.removeEventListener('touchend', self.grabRelease);
			self.doc.removeEventListener('mouseover', self.mouseOver);
			self.doc.removeEventListener('mouseout', self.mouseOut);
		};



		// Bind all
		self.start = function () {
			self.bindMouse();
			self.bindCancelButton();
		};

		// Return to normal mode
		self.tearDown = function () {
			self.removeEventListeners();
		};



	};



	// Startup process
	var dragonInstance = new Dragon(root.document);
	dragonInstance.start();

})(window);
