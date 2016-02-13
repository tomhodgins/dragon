
(function (root) {

	var Dragon = function (doc) {
		var self = this;



		// Store document object as internal variable
		self.doc = doc;
		self.isInitialized = false;
		self.isActive = false;

		// Some configuration
		self.toggleButtonKeyCode = 27; // Esc
		self.outlineColor = 'rgba(0, 255, 0, 0.4)';
		self.outlineHoverColor = 'rgba(0, 255, 0, 0.8)';

		// Name stuff for use in HTML
		self.prefix = 'dragon-' + (Math.random().toString(36).substr(2, 9)); // Random UID to prefix stuff with
		self.baseStyleNodeId = self.prefix + '-' + 'js-base-styles';
		self.activeStyleNodeId = self.prefix + '-' + 'js-active-styles';
		self.baseAttributeName = 'data-' + self.prefix + '-' + 'touched';
		self.targetAttributeName = 'data-' + self.prefix + '-' + 'target';
		self.draggingAttributeName = 'data-' + self.prefix + '-' + 'dragging';

		// Create some variables we can use later
		self.oldTop = 0;
		self.oldLeft = 0;
		self.startX = 0;
		self.startY = 0;
		self.grab = 0;



		self.getBaseCss = function () {
			return '[' + self.baseAttributeName + '] {' +
					'position: relative !important;' +
				'}';
		};
		self.getActiveCss = function () {
			return '[' + self.targetAttributeName + '] {' +
					'cursor: -webkit-grab !important;' +
					'cursor: -moz-grab !important;' +
					'cursor: grab !important;' +
					'outline: 2px solid ' + self.outlineColor + ' !important;' +
				'}' +
				'[' + self.draggingAttributeName + '] {' +
					'cursor: -webkit-grabbing !important;' +
					'cursor: -moz-grabbing !important;' +
					'cursor: grabbing !important;' +
					'outline-color: ' + self.outlineHoverColor + ' !important;' +
				'}';
		};



		// Generate stylesheet node to house custom styles
		self.createStyleNode = function (css, id) {

			// Find head
			var head = self.doc.head || self.doc.getElementsByTagName('head')[0];
			if (head) {
				var styleNode = self.doc.createElement('style');

				// Prepare style tag
				styleNode.type = 'text/css';
				if (id) {
					styleNode.id = id;
				}

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

		self.removeNode = function (id) {
			var node = self.doc.querySelector('#' + id);
			if (node) {
				node.parentNode.removeChild(node);
			}
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
			event.target.setAttribute(self.targetAttributeName, self.targetAttributeName);
		}

		// This is the mouseOut() function
		self.mouseOut = function (event) {
			event.target.removeAttribute(self.targetAttributeName);
		}



		// Generic prevent default behaviour for event callbacks
		self.preventDefaultCallback = function (event) {
			event.preventDefault();
			return false;
		};



		// Listen for toggle button
		self.bindBaseListeners = function () {
			self.doc.addEventListener('keydown', self.toggleButtonCallback);
		};

		// Set up all mouse bindings
		self.bindActiveListeners = function () {

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

			return self;

		};



		// Press escape to cancel
		self.toggleButtonCallback = function (event) {
			event = event || window.event;
			var code = event.keyCode || event.which;

			// Check for escape key
			if (code == self.toggleButtonKeyCode) {
				self.toggle();
			}

		};



		// Tear up main bindings
		self.removeBaseAttributes = function () {
			var baseAttributes = self.doc.querySelector('[' + self.baseAttributeName + ']');
			if (baseAttributes) {
				baseAttributes.removeAttribute(self.baseAttributeName);
			}
		};

		self.removeActiveAttributes = function () {
			var draggingAttributes = self.doc.querySelector('[' + self.draggingAttributeName + ']');
			if (draggingAttributes) {
				draggingAttributes.removeAttribute(self.draggingAttributeName);
			}
		};



		// Tear up bindings
		self.removeBaseListeners = function () {
			self.doc.removeEventListener('keydown', self.toggleButtonCallback);
		};

		self.removeActiveListeners = function () {
			self.doc.removeEventListener('click', self.preventDefaultCallback, true);
			self.doc.removeEventListener('mousedown', self.grabStart);
			self.doc.removeEventListener('touchstart', self.grabStart);
			self.doc.removeEventListener('mousemove', self.drag);
			self.doc.removeEventListener('touchmove', self.drag);
			self.doc.removeEventListener('mouseup', self.grabRelease);
			self.doc.removeEventListener('touchend', self.grabRelease);
			self.doc.removeEventListener('mouseover', self.mouseOver);
			self.doc.removeEventListener('mouseout', self.mouseOut);
		};



		// Life cycle

		// Basic setup
		self.init = function () {
			self.isInitialized = true;
			self.createStyleNode(self.getBaseCss(), self.baseStyleNodeId);
			self.bindBaseListeners();
			return self;
		};

		// Toggle between active mode and rest mode
		self.toggle = function () {
			return self.isActive ? self.stop() : self.start();
		};

		// Activate mode where user can actually grab and move elements that also get highlighted
		self.start = function () {

			if (!self.isInitialized) {
				self.init();
			}

			self.isActive = true;
			self.createStyleNode(self.getActiveCss(), self.activeStyleNodeId);
			self.bindActiveListeners();
			return self;
		};

		// Stop all Dragon behavior except toggle key binding, leaving elements where they were moved
		self.stop = function () {
			self.isActive = false;

			self.removeActiveListeners();
			self.removeActiveAttributes();
			self.removeNode(self.activeStyleNodeId);

			return self;
		};

		// Remove all traces of Dragon
		self.kill = function () {

			if (self.isActive) {
				self.stop();
			}

			self.removeBaseListeners();
			self.removeBaseAttributes();
			self.removeNode(self.baseStyleNodeId);

			return self;
		};

	};



	// Startup process
	var dragonInstance = new Dragon(root.document);
	dragonInstance.init();
	dragonInstance.start();

	// Export for debug
	window.d = dragonInstance;

})(window);
