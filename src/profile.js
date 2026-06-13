import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ══════════════════════════════════════════════════════════════
   角色档案数据 —— 新增角色在此加一条，profile.html?id=xxx 即可访问
   ══════════════════════════════════════════════════════════════ */
const PROFILES = {
  chisaki: {
    code: 'S-002', name: '千咲', element: '湮灭', color: '#d45a9a',
    kicker: 'OBSERVATION FILE · CHISAKI',
    epigraph: '这一战，我会全力以赴。',
    story: [
      '在黑海岸的无数次观测里，千咲是少数让泰缇斯反复回放记录的对象。',
      '她的湮灭之力锋利如刃——出鞘的刹那，连光都被斩成两段；红色的轨迹划过夜色，像命运临时改写的笔触。',
      '可当喧嚣退去、夜色落定，记录里的她也只是抱着猫、蜷在旧沙发里的少女。指尖的薄茧与膝上的创可贴，是她替别人挡下的那些锋利。',
      '"在黑海岸的每一次相遇，都是命运精心编织的线索——而她，是其中最难忘的那一笔。"',
    ],
    photos: [
      { src: 'photos/chisaki-profile.jpg', author: 'Ui_uiiiiiiiii' },
    ],
  },
}

const id = new URLSearchParams(location.search).get('id') || 'chisaki'
const data = PROFILES[id] || PROFILES.chisaki

// ── 主题色 ────────────────────────────────────────────────────────
document.documentElement.style.setProperty('--accent', data.color)
document.documentElement.style.setProperty('--bg', '#0a0710')
document.body.style.backgroundColor = '#0a0710'
document.title = `${data.name} · 观测档案 · 黑海岸`

// ── 渲染 ──────────────────────────────────────────────────────────
const root = document.getElementById('profile')
root.innerHTML = `
  <div class="pf-slashes" aria-hidden="true"></div>

  <header class="pf-hero">
    <p class="pf-kicker">${data.kicker}</p>
    <h1 class="pf-name">${data.name}</h1>
    <div class="pf-meta">
      <span class="pf-code">${data.code}</span>
      <span class="pf-sep"></span>
      <span class="pf-badge">${data.element}</span>
    </div>
    <p class="pf-epigraph">“${data.epigraph}”</p>
  </header>

  <section class="pf-story">
    ${data.story.map((p) => `<p class="pf-para">${p}</p>`).join('')}
  </section>

  <section class="pf-gallery">
    ${data.photos.map((ph) => `
      <figure class="pf-photo">
        <img src="${ph.src}" alt="${data.name}" loading="lazy" />
        ${ph.author ? `<figcaption>@${ph.author}</figcaption>` : ''}
      </figure>`).join('')}
  </section>
`

// 千咲专属：背景红色利刃斜向铺开（静态停留，衬在内容之后）
if (id === 'chisaki') {
  const layer = root.querySelector('.pf-slashes')
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span')
    s.className = 'pf-slash'
    s.style.setProperty('--y', (-5 + Math.random() * 50).toFixed(1) + '%')
    s.style.setProperty('--ang', (Math.random() * 150 - 75).toFixed(1) + 'deg')
    s.style.setProperty('--th', (2 + Math.random() * 4).toFixed(1) + 'px')
    layer.appendChild(s)
  }
}

// ── Lenis 丝滑滚动 ────────────────────────────────────────────────
const lenis = new Lenis({ duration: 1.35, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// ── Three.js 光标拖痕 ─────────────────────────────────────────────
import('./trail.js').then(({ TrailBackground }) => {
  const trail = new TrailBackground(document.getElementById('trail-canvas'))
  trail.setTint(data.color)
})

// ── BGM ──────────────────────────────────────────────────────────
const bgm = new Audio('bgm.mp3')
bgm.loop = true; bgm.volume = 0.7
const bgmBtn = document.getElementById('bgm-toggle')
function setSoundUI(on) {
  bgmBtn.classList.toggle('playing', on)
  bgmBtn.querySelector('.bgm-label').textContent = on ? '音乐 开' : '音乐 关'
}
bgmBtn.addEventListener('click', () =>
  bgm.paused ? bgm.play().then(() => setSoundUI(true)).catch(() => {}) : (bgm.pause(), setSoundUI(false))
)
gsap.to('#bgm-toggle', { opacity: 1, duration: 0.6, delay: 0.5 })

// ── 自定义光标 ────────────────────────────────────────────────────
const cursor    = document.getElementById('cursor')
const cursorPos = { x: innerWidth / 2, y: innerHeight / 2 }
const cursorTgt = { ...cursorPos }
window.addEventListener('pointermove', (e) => { cursorTgt.x = e.clientX; cursorTgt.y = e.clientY })
gsap.ticker.add(() => {
  cursorPos.x += (cursorTgt.x - cursorPos.x) * 0.55
  cursorPos.y += (cursorTgt.y - cursorPos.y) * 0.55
  cursor.style.translate = `${cursorPos.x}px ${cursorPos.y}px`
})
document.querySelectorAll('button,a').forEach((el) => {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-active'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'))
})

// ── 入场动画 ──────────────────────────────────────────────────────
gsap.from('.pf-kicker',   { opacity: 0, y: -12, duration: 0.7, delay: 0.2, ease: 'power2.out' })
gsap.from('.pf-name',     { opacity: 0, y: 26,  duration: 0.9, delay: 0.35, ease: 'power3.out' })
gsap.from('.pf-meta',     { opacity: 0, y: 16,  duration: 0.7, delay: 0.55, ease: 'power2.out' })
gsap.from('.pf-epigraph', { opacity: 0, y: 16,  duration: 0.8, delay: 0.7, ease: 'power2.out' })
gsap.from('.pf-slash',    { scaleX: 0, opacity: 0, transformOrigin: 'center', duration: 1.0, stagger: 0.08, delay: 0.5, ease: 'power3.out' })

gsap.utils.toArray('.pf-para').forEach((p) => {
  gsap.from(p, {
    opacity: 0, y: 24, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: p, start: 'top 88%' },
  })
})
gsap.utils.toArray('.pf-photo').forEach((fig) => {
  gsap.from(fig, {
    opacity: 0, y: 40, duration: 1.0, ease: 'power3.out',
    scrollTrigger: { trigger: fig, start: 'top 85%' },
  })
})
