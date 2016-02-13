
(function (root) {

	var Dragon = function (doc) {
		var self = this;



		// Store document object as internal variable
		self.doc = doc;

		// Some configuration
		self.outlineColor = 'rgba(0, 255, 0, 0.4)';
		self.outlineHoverColor = 'rgba(0, 255, 0, 0.8)';

		// HTML
		self.prefix = 'dragon-' + (Math.random().toString(36).substr(2, 9)); // Random UID to prefix stuff with
		self.styleNodeId = self.prefix + 'js-styles';
		self.baseAttributeName = 'data-' + self.prefix + 'drag';
		self.draggingAttributeName = 'data-' + self.prefix + 'dragging';

		// Create some variables we can use later
		self.oldTop = 0;
		self.oldLeft = 0;
		self.startX = 0;
		self.startY = 0;
		self.grab = 0;



		self.getCss = function () {
			return '[' + self.baseAttributeName + '] {' +
					'transition-property: outline-color !important;' +
					'transition-duration: 150ms !important;' +
					'transition-delay: 0ms !important;' +
					'position: relative !important;' +
				'}' +
				'* {' +
					'cursor: -webkit-grab !important;' +
					'cursor: -moz-grab !important;' +
					'cursor: grab !important;' +
					'outline: 2px solid transparent !important;' +
				'}' +
				'*:hover {' +
					'outline-color: ' + self.outlineColor + ' !important;' +
				'}' +
				'[' + self.draggingAttributeName + '] {' +
					'outline-color: ' + self.outlineHoverColor + ' !important;' +
				'}';
		};



		// Generate stylesheet node to house custom styles
		self.createStyleNode = function () {

			// Find head
			var head = self.doc.head || self.doc.getElementsByTagName('head')[0];
			if (head) {

				var css = self.getCss();
				var styleNode = self.doc.createElement('style');

				// Prepare style tag
				styleNode.type = 'text/css';
				styleNode.id = self.styleNodeId;

				// Insert CSS
				if (styleNode.styleSheet) {
					styleNode.styleSheet.cssText = css;
				} else {
					styleNode.appendChild(self.doc.createTextNode(css));
				}

				// Append put style tag to document
				head.appendChild(styleNode);

			}

		};

		self.removeStyleNode = function () {
			var node = self.doc.querySelector('#' + self.styleNodeId);
			node.parentNode.removeChild(node);
		};



		// This is run when the user selects an element for dragging
		self.grabStart = function (event) {
			event.preventDefault();

			// If the element being clicked/tapped isn't the body or HTML element, do the following
			if (event.target !== self.doc.documentElement && event.target !== self.doc.body) {

				// Set 'grab' to the time right now
				self.grab = Date.now();

				// Set special attribute for the picked-up element
				event.target.setAttribute(self.draggingAttributeName, self.draggingAttributeName);

				// Add a Dragon attribute to the picked element and assign the time they started grabbing it
				event.target.setAttribute(self.baseAttributeName, self.grab);

				// Add `position: relative;` to the picked element
				// event.target.style.position = 'relative';

				// Remember the original `top: ;` and `left: ;` values, or if they aren't set yet go with 0 instead
				self.oldTop = event.target.style.top.split('px')[0] || 0;
				self.oldLeft = event.target.style.left.split('px')[0] || 0;

			}

			// Let's remember the start x and y coordinates of the cursor when starting a click or tap
			self.startX = event.clientX || event.touches[0].clientX;
			self.startY = event.clientY || event.touches[0].clientY;

		}

		// This is run for every cursor movement or touch screen drag
		self.drag = function (event) {

			// If grab isn't empty, there's currently an object being dragged, do this
			if (self.grab !== '') {

				// Let's find the element on the page whose Dragon value matches the value of grab right now
				var element = self.doc.querySelector('[' + self.baseAttributeName + '="' + self.grab + '"]');
				if (element && element.style) {

					// Adjust the vertical position value based on the difference to last XY position of the cursor
					element.style.top = parseInt(self.oldTop) + parseInt((event.clientY || event.touches[0].clientY) - self.startY) + 'px';

					// Adjust the horizontal position value based on the difference to last XY position of the cursor
					element.style.left = parseInt(self.oldLeft) + parseInt((event.clientX || event.touches[0].clientX) - self.startX) + 'px';

				}

			}

		}

		// The grabRelease function empties grab, forgetting which element has been picked.
		self.grabRelease = function (event) {
			self.grab = '';
			event.target.removeAttribute(self.draggingAttributeName);
		}

		// This is the mouseOver() function
		self.mouseOver = function (event) {

			// Set the cursor to 'move' while hovering an element you can reposition
			// event.target.style.cursor = 'move';

			// Add a green box-shadow to show what container your hovering on
			// event.target.style.boxShadow = 'inset lime 0 0 1px, lime 0 0 1px';

		}

		// This is the mouseOut() function
		self.mouseOut = function (event) {

			// Remove the move cursor and green box-shadow
			// event.target.style.cursor = event.target.style.boxShadow = '';

		}



		// Generic prevent default behaviour for event callbacks
		self.preventDefaultCallback = function (event) {
			event.preventDefault();
			return false;
		};



		// Set up all bindings
		self.bindListeners = function () {

			// Disallow clicks
			self.doc.addEventListener('click', self.preventDefaultCallback, true);

			// On mousedown or touchstart, run the pick() function
			self.doc.addEventListener('mousedown', self.grabStart);
			self.doc.addEventListener('touchstart', self.grabStart);

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

			// Listen for escape button
			self.doc.addEventListener('keydown', self.cancelButtonCallback);

			return self;

		};



		// Press escape to cancel
		self.cancelButtonCallback = function (event) {
			event = event || window.event;
			var code = event.keyCode || event.which;

			// Check for escape key
			if (code == 27) {

				// Run the actual teardown logic
				self.tearDown();

			}

		};



		// Tear up main bindings
		self.removeCustomAttributes = function () {

			var baseAttributes = self.doc.querySelector('[' + self.baseAttributeName + ']');
			if (baseAttributes) {
				baseAttributes.removeAttribute(self.baseAttributeName);
			}

			var draggingAttributes = self.doc.querySelector('[' + self.draggingAttributeName + ']');
			if (draggingAttributes) {
				draggingAttributes.removeAttribute(self.draggingAttributeName);
			}

		};



		// Tear up main bindings
		self.removeEventListeners = function () {
			self.doc.removeEventListener('click', self.preventDefaultCallback, true);
			self.doc.removeEventListener('mousedown', self.grabStart);
			self.doc.removeEventListener('touchstart', self.grabStart);
			self.doc.removeEventListener('mousemove', self.drag);
			self.doc.removeEventListener('touchmove', self.drag);
			self.doc.removeEventListener('mouseup', self.grabRelease);
			self.doc.removeEventListener('touchend', self.grabRelease);
			self.doc.removeEventListener('mouseover', self.mouseOver);
			self.doc.removeEventListener('mouseout', self.mouseOut);
			self.doc.removeEventListener('keydown', self.cancelButtonCallback);
		};



		// Bind all
		self.start = function () {
			self.createStyleNode();
			self.bindListeners();
		};

		// Return to normal mode
		self.tearDown = function () {
			self.removeEventListeners();
			self.removeCustomAttributes();
			self.removeStyleNode();
		};



	};



	// Startup process
	var dragonInstance = new Dragon(root.document);
	dragonInstance.start();

	// Export for debug
	window.d = dragonInstance;

})(window);
