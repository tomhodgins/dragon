
(function (win) {

	var Dragon = function (doc) {
		var self = this;



		// Store document object as internal variable
		self.doc = doc;
		self.isInitialized = false;
		self.isActive = false;

		// Some configuration
		self.toggleKeyCode = 27; // Esc
		self.axisModifierKeyCode = 16; // Shift
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
		self.blockDragDirectionOf = false;
		self.modifierKeyPressed = false;

		self.grab = '';
		self.oldTop = 0;
		self.oldLeft = 0;
		self.startX = 0;
		self.startY = 0;



		// CSS code that will be inserted as stylesheet nodes
		self.getBaseCss = function () {
			return '[' + self.baseAttributeName + '] {' +
					'position: relative !important;' +
				'}';
		};

		self.getActiveCss = function () {
			return '[' + self.baseAttributeName + ']:hover,' +
				'[' + self.targetAttributeName + '] {' +
					'cursor: -webkit-grab !important;' +
					'cursor: -moz-grab !important;' +
					'cursor: grab !important;' +
					'outline: 2px solid ' + self.outlineColor + ' !important;' +
				'}' +
				'[' + self.draggingAttributeName + '],' +
				'[' + self.baseAttributeName + '][' + self.draggingAttributeName + '] {' +
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



		self.isLegalTarget = function (target) {
			return target !== self.doc.documentElement && target !== self.doc.body;
		}

		// This is the mouseOver() function
		self.mouseOver = function (event) {
			if (!self.grab.length) {
				if (self.isLegalTarget(event.target)) {
					event.target.setAttribute(self.targetAttributeName, self.targetAttributeName);
				}
			}
		};

		// This is the mouseOut() function
		self.mouseOut = function (event) {
			if (!self.grab.length) {
				if (self.isLegalTarget(event.target)) {
					event.target.removeAttribute(self.targetAttributeName);
				}
			}
		};



		// This is run when the user selects an element for dragging
		self.grabStart = function (event) {
			event.preventDefault();

			// If the element being clicked/tapped isn't the body or HTML element, do the following
			if (self.isLegalTarget(event.target)) {

				// Set 'grab' to the time right now
				self.grab = '' + Date.now();

				// Set special attribute for the picked-up element
				event.target.setAttribute(self.draggingAttributeName, self.draggingAttributeName);

				// Add a Dragon attribute to the picked element and assign the time they started grabbing it
				event.target.setAttribute(self.baseAttributeName, self.grab);

				// Remember the original `top: ;` and `left: ;` values, or if they aren't set yet go with 0 instead
				self.oldTop = event.target.style.top.split('px')[0] || 0;
				self.oldLeft = event.target.style.left.split('px')[0] || 0;

			}

			// Let's remember the start x and y coordinates of the cursor when starting a click or tap
			self.startX = event.clientX || event.touches[0].clientX;
			self.startY = event.clientY || event.touches[0].clientY;

		};

		// This is run for every cursor movement or touch screen drag
		// If grab is not set, there's currently an object being dragged, do this
		self.drag = function (event) {
			if (self.grab.length) {

				// Let's find the element on the page whose Dragon value matches the value of grab right now
				var element = self.doc.querySelector('[' + self.baseAttributeName + '="' + self.grab + '"]');
				if (element && element.style) {

					// Calculate the difference in cursor position compared to the grab origin point
					var diffX = parseInt((event.clientX || event.touches[0].clientX) - self.startX);
					var diffY = parseInt((event.clientY || event.touches[0].clientY) - self.startY);

					// Support for shift key
					if (self.modifierKeyPressed && event.pageX && event.pageY) {

						// Establish drag direction (downplay Y value to slightly prefer X)
						if ((0.75 * Math.abs(diffY)) > Math.abs(diffX)) {
							self.blockDragDirectionOf = 'x';
						} else {
							self.blockDragDirectionOf = 'y';
						}

					}

					// Calculate the horizontal position based on the difference to original value
					var newX = parseInt(self.oldLeft) + diffX;
					if (self.blockDragDirectionOf == 'x') {
						newX = self.oldLeft;
					}

					// Adjust the vertical position based on the difference to original value
					var newY = parseInt(self.oldTop) + diffY;
					if (self.blockDragDirectionOf == 'y') {
						newY = self.oldTop;
					}

					// Adjust the position values
					element.style.left = newX + 'px';
					element.style.top = newY + 'px';

				}

			}
		};

		// The grabRelease function empties grab, forgetting which element has been picked.
		self.grabRelease = function (event) {
			self.grab = '';
			self.blockDragDirectionOf = false;

			self.oldTop = 0;
			self.oldLeft = 0;

			// Remove target marking from element
			var elementsWithDraggingAttribute = self.doc.querySelector('[' + self.draggingAttributeName + ']');
			if (elementsWithDraggingAttribute) {
				elementsWithDraggingAttribute.removeAttribute(self.targetAttributeName);
				elementsWithDraggingAttribute.removeAttribute(self.draggingAttributeName);
			}

		};



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

			// Listen for modifier key presses
			self.doc.addEventListener('keydown', self.modifierCallbackOn);
			self.doc.addEventListener('keyup', self.modifierCallbackOff);

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



		// Press escape to toggle active mode on and off
		self.getKeyCode = function (event) {
			event = event || window.event;
			return event.keyCode || event.which;
		};

		// Check for escape key
		self.toggleButtonCallback = function (event) {
			if (self.getKeyCode(event) == self.toggleKeyCode) {
				self.toggle();
			}
		};

		// Press shift to limit axis
		self.modifierCallbackOn = function (event) {
			if (self.getKeyCode(event) == self.axisModifierKeyCode) {
				self.modifierKeyPressed = true;
			}
		};

		// Release shift to stop limiting axis
		self.modifierCallbackOff = function (event) {
			if (self.getKeyCode(event) == self.axisModifierKeyCode) {
				self.modifierKeyPressed = false;
				self.blockDragDirectionOf = false;
			}
		};



		// Tear up main bindings
		self.removeBaseAttributes = function () {
			var elementWithBaseAttributes = self.doc.querySelector('[' + self.baseAttributeName + ']');
			if (elementWithBaseAttributes) {
				elementWithBaseAttributes.removeAttribute(self.baseAttributeName);
			}
		};

		self.removeActiveAttributes = function () {
			var elementsWithDraggingAttribute = self.doc.querySelector('[' + self.draggingAttributeName + ']');
			if (elementsWithDraggingAttribute) {
				elementsWithDraggingAttribute.removeAttribute(self.draggingAttributeName);
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



	// Has already be run once, use this chance to toggle the behavior
	var exportName = '___d';
	if (win[exportName] && win[exportName] instanceof Dragon) {
		win[exportName].toggle();

	// Set up a new instance and export to window scope
	} else {
		var dragonInstance = new Dragon(win.document);
		dragonInstance.start();
		win[exportName] = dragonInstance;
	}

})(window);
