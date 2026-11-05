(function () {
'use strict';
var root = document.getElementById('revline'), box = document.getElementById('revline-data'), data, list, cur;
if (!root || !box) { return; }
try { data = JSON.parse(box.textContent); } catch (e) { return; }
list = (data.reviews || []).filter(function (r) { return r.stars === 5 && r.text; });
cur = root.querySelector('.revline__slide');
if (list.length < 2 || !cur) { return; }
var slides = [cur, cur.cloneNode(true)], k = 0, i = 0, timer = 0, held = 0, passes = 0, touch = 0,
motion = document.documentElement.classList.contains('motion-ok'),
next = root.querySelector('.revline__next');
slides[1].classList.remove('is-active');
cur.parentNode.appendChild(slides[1]);
function go() {
var r = list[i = (i + 1) % list.length], from = slides[k], to = slides[k = 1 - k];
to.querySelector('.revline__text').innerHTML = '“<span>' + [r.xs, r.short, r.medium].join('</span><span>') + '</span>”';
to.querySelector('.revline__name').textContent = r.author;
from.classList.remove('is-active');
to.classList.add('is-active');
if (motion && to.animate) {
to.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
from.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 260, easing: 'cubic-bezier(.4,0,1,1)' });
}
}
function arm() {
clearTimeout(timer);
if (motion && !held && !document.hidden && passes < 2 * list.length) {
timer = setTimeout(function () { passes++; go(); arm(); }, 5000);
}
}
function hold(bit, on) { held = on ? held | bit : held & ~bit; arm(); }
root.addEventListener('pointerenter', function () { hold(1, 1); });
root.addEventListener('pointerleave', function () { hold(1, 0); });
root.addEventListener('focusin', function () { hold(2, 1); });
root.addEventListener('focusout', function () { hold(2, 0); });
root.addEventListener('touchstart', function () { hold(4, 1); clearTimeout(touch); touch = setTimeout(function () { hold(4, 0); }, 8000); }, { passive: true });
document.addEventListener('visibilitychange', arm);
if (next) { next.addEventListener('click', go); }
arm();
})();
