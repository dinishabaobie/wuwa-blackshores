import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ── Lenis 丝滑滚动（顶层初始化，加载期间锁定）────────────────────
const lenis = new Lenis({ duration: 1.35, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop()

// ── Three.js 光标拖痕（动态加载，three.js 不阻塞首屏）─────────────
let trail = null
let currentAccent = '#4d8ab5'
import('./trail.js').then(({ TrailBackground }) => {
  trail = new TrailBackground(document.getElementById('trail-canvas'))
  trail.setTint(currentAccent)
})

// ── BGM ──────────────────────────────────────────────────────────
const bgm = new Audio('bgm.mp3')
bgm.loop = true
bgm.volume = 0.7
const bgmBtn = document.getElementById('bgm-toggle')

function setSoundUI(on) {
  bgmBtn.classList.toggle('playing', on)
  bgmBtn.querySelector('.bgm-label').textContent = on ? '音乐 开' : '音乐 关'
}
function soundOn()  { bgm.play().then(() => setSoundUI(true)).catch(() => {}) }
function soundOff() { bgm.pause(); setSoundUI(false) }
bgmBtn.addEventListener('click', () => bgm.paused ? soundOn() : soundOff())

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

// ── 章节配色（直接 tween CSS 变量，与上一个站保持一致）────────────
const SCENES = [
  { id: 'intro',   bg: '#060f1c', accent: '#4d8ab5' },
  { id: 'watcher', bg: '#060e1a', accent: '#5eadc8' },
  { id: 'tethys',  bg: '#040c18', accent: '#28d4a4' },
]

SCENES.forEach((scene) => {
  ScrollTrigger.create({
    trigger: `#${scene.id}`,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle(self) {
      if (!self.isActive) return
      gsap.to(document.documentElement, {
        '--bg': scene.bg, '--accent': scene.accent,
        duration: 1.1, ease: 'power2.out', overwrite: 'auto',
      })
      currentAccent = scene.accent
      trail?.setTint(scene.accent)
    },
  })
})

// ── 序章：滚动时背景图视差 ────────────────────────────────────────
gsap.to('.intro-bg img', {
  yPercent: 14, ease: 'none',
  scrollTrigger: {
    trigger: '#intro', start: 'top top', end: 'bottom top', scrub: true,
  },
})

// ── 守岸人：诗行逐行浮现 ──────────────────────────────────────────
gsap.fromTo('.watcher-line, .watcher-sep',
  { opacity: 0, y: 52 },
  { opacity: 1, y: 0, stagger: 0.22, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '#watcher', start: 'top 65%', toggleActions: 'play none none reset' },
  }
)

// 图片从底部向上揭开
gsap.fromTo('.watcher-fig',
  { clipPath: 'inset(0 0 100% 0)' },
  { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power3.out',
    scrollTrigger: { trigger: '#watcher', start: 'top 50%', toggleActions: 'play none none reset' },
  }
)

// 图片在画框内缓慢漂移（用掉 115% 的高度余量）
gsap.fromTo('.watcher-fig img', { yPercent: -10 }, {
  yPercent: 0, ease: 'none',
  scrollTrigger: { trigger: '#watcher', start: 'top bottom', end: 'bottom top', scrub: true },
})

// ── 泰提斯：背景视差 + 内容浮现 ──────────────────────────────────
gsap.to('.tethys-bg-img', {
  yPercent: -16, ease: 'none',
  scrollTrigger: {
    trigger: '#tethys', start: 'top bottom', end: 'bottom top', scrub: true,
  },
})

gsap.timeline({
  scrollTrigger: { trigger: '#tethys', start: 'top 68%', toggleActions: 'play none none reset' },
})
  .fromTo('.tethys-kicker',  { opacity: 0 },         { opacity: 1, duration: 0.7 })
  .fromTo('.tethys-title',   { opacity: 0, y: 28 },  { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.2')
  .fromTo('.tethys-line',    { opacity: 0, y: 26 },  { opacity: 1, y: 0, stagger: 0.18, duration: 0.8 }, '-=0.4')
  .fromTo('.tethys-mark',    { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.55)' }, '>-0.2')

// ── 初始页：泰缇斯身份核验，停顿后自动进入 ────────────────────────
{
  const loader = document.getElementById('loader')

  function typeCmd() {
    const el = document.querySelector('.intro-prompt .cmd')
    if (!el) return
    const text = '已接入泰提斯终端'
    el.textContent = ''
    let i = 0
    const tick = () => {
      if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, 70 + Math.random() * 50) }
    }
    setTimeout(tick, 400)
  }

  function revealMain() {
    lenis.start()
    gsap.to('#bgm-toggle', { opacity: 1, duration: 0.6 })
    gsap.to('.intro-tagline', { opacity: 1, duration: 1.0, delay: 0.6, ease: 'power2.out' })
    // HUD 开机式组装
    gsap.to('.hud-corner', { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    gsap.to('.hud-readout', { opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.15, ease: 'power2.out' })
    gsap.to('.intro-prompt', { opacity: 1, duration: 0.4, delay: 0.1 })
    typeCmd()
  }

  // 浏览器禁止无交互自动播放，首次任意点击再尝试开启 BGM
  function armBgm() {
    window.addEventListener('pointerdown', () => { if (bgm.paused) soundOn() }, { once: true })
  }

  if (sessionStorage.getItem('bs_entered')) {
    loader.remove()
    revealMain()
    armBgm()
  } else {
    // 预热章节图片
    ;['photos/chisaki-1.jpg', 'photos/watcher.jpg', 'photos/tethys.jpg']
      .forEach((src) => { const img = new Image(); img.src = src })

    // 生成汇聚粒子
    const pc = loader.querySelector('.loader-particles')
    const parts = []
    for (let i = 0; i < 42; i++) {
      const p = document.createElement('span')
      p.className = 'loader-particle'
      pc.appendChild(p)
      const ang = Math.random() * Math.PI * 2
      const dist = 80 + Math.random() * 160
      gsap.set(p, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, opacity: 0, scale: 0.4 + Math.random() * 0.9 })
      parts.push(p)
    }

    gsap.set('.loader-title span', { y: 18 })

    gsap.timeline()
      .from('.loader-bg', { opacity: 0, scale: 1.08, duration: 1.4, ease: 'power2.out' }, 0)
      .to(parts, { opacity: 1, duration: 0.4, stagger: 0.008 }, 0.2)
      .to(parts, { x: 0, y: 0, scale: 0, opacity: 0, duration: 0.9, stagger: 0.01, ease: 'power2.in' }, 0.6)
      .to('.loader-mark', { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 1.1)
      .to('.loader-tethys', { opacity: 1, letterSpacing: '0.7em', duration: 0.7 }, 1.25)
      .to('.loader-title span', { opacity: 1, y: 0, stagger: 0.07, duration: 0.5 }, 1.35)
      .to('.auth-line.l1', { opacity: 1, duration: 0.4 }, 1.6)
      // 加载点先转约 2.9 秒，再确认权限
      .to('.auth-line.l2', { opacity: 1, duration: 0.4 }, 4.5)
      // 权限确认后，核验身份那行快速原地淡出（不收起、不上移）
      .to('.auth-line.l1', { opacity: 0, duration: 0.25, ease: 'power2.in' }, 4.7)

    // 点击后进入主页
    loader.addEventListener('click', () => {
      soundOn()
      sessionStorage.setItem('bs_entered', '1')
      gsap.timeline()
        .to(loader, { yPercent: -100, duration: 1.0, ease: 'power3.inOut' })
        .add(() => {
          loader.remove()
          revealMain()
          const cx = innerWidth / 2, cy = innerHeight / 2
          ;[0, 120, 240].forEach((d, i) =>
            setTimeout(() => trail?.burst(cx + (i - 1) * 130, cy, 130), d))
        }, '>-0.25')
    }, { once: true })
  }
}

// ── 终端实时读出（时间 / 同步率）────────────────────────────────
{
  const pad = (n) => String(n).padStart(2, '0')
  const hudTime = document.getElementById('hud-time')
  const hudSync = document.getElementById('hud-sync')
  if (hudTime) {
    const upd = () => {
      const d = new Date()
      hudTime.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    upd(); setInterval(upd, 1000)
  }
  if (hudSync) setInterval(() => { hudSync.textContent = (98 + Math.random()).toFixed(1) }, 2000)
}
