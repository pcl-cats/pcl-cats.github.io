// 全站的小互动：吸顶阴影、滚动出现、3D 倾斜、摸猫。
// 系统开启“减少动态效果”时，只保留必要的状态变化。

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 页头滚动后加一条细线 ---------- */

const header = document.querySelector('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 4);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- 滚动到视野里再出现 ---------- */

const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      revealer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -6% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealer.observe(el));

/* ---------- 鼠标移动时轻微 3D 倾斜（只在电脑上） ---------- */

for (const el of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
  el.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reduceMotion) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const strength = Number(el.dataset.tilt || 10);
    el.style.setProperty('--rx', `${(-y * strength).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * strength * 1.2).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    el.classList.add('is-tilting');
  });
  el.addEventListener('pointerleave', () => {
    el.classList.remove('is-tilting');
    for (const prop of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(prop);
  });
}

/* ---------- 摸猫：跳一下、冒爱心、换姿势 ---------- */

const MEOWS = ['喵～', '喵？', '呼噜呼噜', '喵！', '再摸一下', '喵呜'];
const HEART = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
const PAW = '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="16.2" rx="4.6" ry="3.9"/><ellipse cx="6" cy="10.6" rx="2" ry="2.5"/><ellipse cx="9.6" cy="6.6" rx="2" ry="2.6"/><ellipse cx="14.4" cy="6.6" rx="2" ry="2.6"/><ellipse cx="18" cy="10.6" rx="2" ry="2.5"/></svg>';

function burst(x: number, y: number) {
  const count = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.className = 'pet-bit';
    bit.innerHTML = i % 3 === 2 ? PAW : HEART;
    bit.style.left = `${x}px`;
    bit.style.top = `${y}px`;
    bit.style.color = ['#e8836b', '#c9a464', '#f0a08a'][i % 3];
    const size = 14 + Math.random() * 12;
    bit.style.width = bit.style.height = `${size}px`;
    document.body.append(bit);
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 2.2;
    const distance = 50 + Math.random() * 60;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const spin = (Math.random() - 0.5) * 60;
    bit
      .animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.45}px)) scale(1.1)`, opacity: 1, offset: 0.3 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy - 24}px)) scale(0.8) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: 850 + Math.random() * 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: i * 25, fill: 'both' },
      )
      .finished.then(() => bit.remove());
  }
}

function meow(el: HTMLElement) {
  el.querySelector('.pet-bubble')?.remove();
  const bubble = document.createElement('span');
  bubble.className = 'pet-bubble';
  bubble.textContent = MEOWS[Math.floor(Math.random() * MEOWS.length)];
  el.append(bubble);
  setTimeout(() => bubble.remove(), 1400);
}

const preloaded = new WeakSet<HTMLElement>();
function preloadPoses(el: HTMLElement) {
  if (preloaded.has(el) || !el.dataset.poses) return;
  preloaded.add(el);
  for (const src of JSON.parse(el.dataset.poses) as string[]) new Image().src = src;
}

document.addEventListener('pointerover', (event) => {
  const el = (event.target as Element).closest<HTMLElement>('[data-poses]');
  if (el) preloadPoses(el);
});

document.addEventListener('click', (event) => {
  const el = (event.target as Element).closest<HTMLElement>('[data-pet]');
  if (!el) return;

  const poses = el.dataset.poses ? (JSON.parse(el.dataset.poses) as string[]) : null;
  const img = el.querySelector('img');
  if (poses && img) {
    const next = (Number(el.dataset.pose || 0) + 1) % poses.length;
    el.dataset.pose = String(next);
    img.src = poses[next];
  }

  el.classList.remove('is-petted');
  void el.offsetWidth; // 重新触发动画
  el.classList.add('is-petted');

  if (reduceMotion) return;
  const rect = el.getBoundingClientRect();
  const fromPointer = event.detail > 0;
  burst(fromPointer ? event.clientX : rect.left + rect.width / 2, fromPointer ? event.clientY : rect.top + rect.height / 3);
  if ('meow' in el.dataset) meow(el);
});
