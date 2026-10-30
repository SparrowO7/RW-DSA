(() => {
  try { if (localStorage.getItem('dsaro-theme') === 'light') document.body.classList.add('light-mode'); } catch {}
  const progress = document.createElement('div');
  progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
  let queued = false;
  function updateProgress() { queued = false; const height = document.documentElement.scrollHeight - innerHeight; progress.style.transform = 'scaleX(' + (height > 0 ? Math.min(1, scrollY / height) : 0) + ')'; }
  function requestProgress() { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }
  addEventListener('scroll', requestProgress, { passive: true }); addEventListener('resize', requestProgress, { passive: true });
  if (!('IntersectionObserver' in window)) { updateProgress(); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
  }), { threshold: .06, rootMargin: '0px 0px -12px 0px' });
  function watch() {
    document.querySelectorAll('.mission-card:not([data-reveal]), .library-toolbar:not([data-reveal]), .progress-strip:not([data-reveal]), .roadrow:not([data-reveal])').forEach(el => {
      el.dataset.reveal = 'true'; el.classList.add('scroll-reveal'); observer.observe(el);
    }); requestProgress();
  }
  watch(); new MutationObserver(watch).observe(document.querySelector('#app'), { childList: true, subtree: true });
})();
