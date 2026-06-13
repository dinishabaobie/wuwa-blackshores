import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ── Lenis 丝滑滚动 ────────────────────────────────────────────────
const lenis = new Lenis({ duration: 1.35, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// ── Three.js 光标拖痕 ─────────────────────────────────────────────
import('./trail.js').then(({ TrailBackground }) => {
  const trail = new TrailBackground(document.getElementById('trail-canvas'))
  trail.setTint('#d46880')
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
  cursorPos.x += (cursorTgt.x - cursorPos.x) * 0.18
  cursorPos.y += (cursorTgt.y - cursorPos.y) * 0.18
  cursor.style.translate = `${cursorPos.x}px ${cursorPos.y}px`
})
document.querySelectorAll('button,a').forEach((el) => {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-active'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'))
})

// ── 主题色：千咲章节玫瑰色 ───────────────────────────────────────
document.documentElement.style.setProperty('--accent', '#d46880')
document.documentElement.style.setProperty('--bg', '#180810')
document.body.style.backgroundColor = '#180810'

// ── 页面标题入场 ──────────────────────────────────────────────────
gsap.from('.subjects-kicker', { opacity: 0, y: -12, duration: 0.7, delay: 0.2, ease: 'power2.out' })
gsap.from('.subjects-heading', { opacity: 0, y: 24, duration: 0.9, delay: 0.4, ease: 'power3.out' })
gsap.from(['.subjects-rule', '.subjects-desc'], { opacity: 0, y: 16, duration: 0.7, delay: 0.65, stagger: 0.1, ease: 'power2.out' })

// ── 千咲：横向画廊 ────────────────────────────────────────────────
gsap.fromTo('.cs-photo-wrap',
  { clipPath: 'inset(0 100% 0 0)' },
  { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '#chisaki', start: 'top 68%', toggleActions: 'play none none reset' },
  }
)
gsap.fromTo(['.cs-num', '.cs-name', '.cs-desc'],
  { opacity: 0, x: 28 },
  { opacity: 1, x: 0, stagger: 0.14, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '#chisaki', start: 'top 60%', toggleActions: 'play none none reset' },
  }
)
gsap.fromTo('.cs-photo-wrap img', { yPercent: -8 }, {
  yPercent: 0, ease: 'none',
  scrollTrigger: { trigger: '#chisaki', start: 'top bottom', end: 'bottom top', scrub: true },
})
gsap.to('.chisaki-track', {
  x: () => -window.innerWidth,
  ease: 'none',
  scrollTrigger: {
    trigger: '#chisaki',
    start: 'top top', end: 'bottom bottom',
    scrub: 1,
  },
})

gsap.set('.sbc-line', { opacity: 0, y: 22 })
let slideBShown = false
ScrollTrigger.create({
  trigger: '#chisaki',
  start: 'top top', end: 'bottom bottom',
  onUpdate(self) {
    if (!slideBShown && self.progress > 0.52) {
      slideBShown = true
      gsap.to('.sbc-line', { opacity: 1, y: 0, stagger: 0.16, duration: 0.7, ease: 'power2.out' })
    }
  },
  onLeaveBack() {
    slideBShown = false
    gsap.set('.sbc-line', { opacity: 0, y: 22 })
  },
})
