'use strict';
document.body.className = document.body.className.replace('nojs', 'js');
var d = document
  , s = d.createElement('script')
  , l = d.getElementById('load-js')
;
s.src = '/js/main.js';
d.body.appendChild(s);
l.parentNode.removeChild(l);
