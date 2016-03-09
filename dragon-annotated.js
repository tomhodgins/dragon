// Let's create some variables we can use later. Since they will all equal nothing right now, we can say they are all equal to zero in one shot.
var grab=startX=startY=oldTop=oldLeft=hoverElement=0;

// When you click, prevent the default behaviour for that event
document.addEventListener('click',function(e){e.preventDefault()},true);

// Set key handler for hide event; 46 = delete key
document.addEventListener('keydown',function(e){if(e.which == 46 || e.keyCode == 46)hide();}, false);

// This is the hide function
function hide(){

// If the element being hovered isn't the body or HTML element, do the following
  if (hoverElement!==document.documentElement && hoverElement!==document.body){
// Most of the browsers use this line
    hoverElement.style.opacity = 0;

// Set opacity for Internet Explorer
    hoverElement.style.filter = "alpha(opacity=0)";

// That's all we do for hiding an element
  }

}

// On mousedown or touchstart, run the pick() function
document.addEventListener('mousedown',pick);
document.addEventListener('touchstart',pick);

// This is the pick function
function pick(e){

// Prevent the default action
  e.preventDefault();

// If the element being clicked/tapped isn't the body or HTML element, do the following
  if (e.target!==document.documentElement && e.target!==document.body){

// Set 'grab' to the time right now
    grab=Date.now();

// Add a 'data-drag' attribute to the picked element and assign the time they started grabbing it
    e.target.setAttribute('data-drag',grab);

// Add `position: relative;` to the picked element
    e.target.style.position='relative';

// Remember the original `top: ;` and `left: ;` values, or if they aren't set yet go with 0 instead
    oldTop=e.target.style.top.split('px')[0]||0;
    oldLeft=e.target.style.left.split('px')[0]||0;

// That's all we do for the element when we start clicking or tapping
  }

// Let's remember the start x and y coordinates of the cursor when starting a click or tap
  startX=e.clientX||e.touches[0].clientX;
  startY=e.clientY||e.touches[0].clientY;
}

// All the time you move the mouse or drag your finger, run the function drag()
document.addEventListener('mousemove',drag);
document.addEventListener('touchmove',drag);

// This is the drag function
function drag(e){

// If grab isn't empty, there's currently an object being dragged, do this
  if (grab!==''){

// Let's find the element on the page whose data-drag="" value matches the value of grab right now
    var element=document.querySelector('[data-drag="'+grab+'"]');

// And to that element, let the new value of `top: ;` be equal to the old top position, plus the difference between the original top position and the current cursor position
    element.style.top=parseInt(oldTop)+parseInt((e.clientY||e.touches[0].clientY)-startY)+'px';

// And let the new value of `left: ;` be equal to the old left position, plus the difference between the original left position and the current cursor position
    element.style.left=parseInt(oldLeft)+parseInt((e.clientX||e.touches[0].clientX)-startX)+'px';

// That's all we do for dragging elements
  }
}

// On mouseup or touchend, run the release() function
document.addEventListener('mouseup',release);
document.addEventListener('touchend',release);

// The release function empties grab, forgetting which element has been picked.
function release(e){
  grab='';
}

// On mouseover, run the over() function
document.addEventListener('mouseover',over);

// This is the over() function
function over(e){

// Store what element we are moving so we know what element to hide when user presses delete
  hoverElement = e.target;

// Set the cursor to 'move' wihle hovering an element you can reposition
  e.target.style.cursor='move';

// Add a green box-shadow to show what container your hovering on
  e.target.style.boxShadow='inset lime 0 0 1px, lime 0 0 1px';
}

// On mouseover, run the out() function
document.addEventListener('mouseout',out);

// This is the out() function
function out(e){

  // Remove the move cursor and green box-shadow
  e.target.style.cursor=e.target.style.boxShadow='';
  
  // Remove the hovered element
  hoverElement = 0;

}