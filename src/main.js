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

// ── 加载动画 ──────────────────────────────────────────────────────
{
  const loader = document.getElementById('loader')

  // 从子页面返回时跳过 loader，直接进入主页内容
  if (sessionStorage.getItem('bs_entered')) {
    loader.remove()
    lenis.start()
    gsap.to('#bgm-toggle', { opacity: 1, duration: 0.6 })
    const auth = document.querySelector('.intro-auth')
    if (auth) { auth.style.visibility = 'hidden' }
    gsap.to('.intro-tagline', { opacity: 1, duration: 0.8 })
  } else {
  gsap.set('.loader-title span', { y: 18 })

  // 加载层停留期间预热全部章节图片，避免滚动途中才开始加载
  ;['photos/chisaki-1.jpg', 'photos/chisaki-2.jpg', 'photos/watcher.jpg']
    .forEach((src) => { const img = new Image(); img.src = src })

  gsap.timeline()
    .from('.loader-bg',      { opacity: 0, scale: 1.08, duration: 1.3, ease: 'power2.out' })
    .to('.loader-mark',      { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.6')
    .to('.loader-tethys',    { opacity: 1, letterSpacing: '0.75em', duration: 0.8, ease: 'power2.out' }, '-=0.1')
    .to('.loader-title span',{ opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to('.loader-sub',       { opacity: 1, duration: 0.6 }, '-=0.1')
    .to('.loader-enter',     { opacity: 1, duration: 0.5 }, '+=0.35')

  loader.addEventListener('click', () => {
    sessionStorage.setItem('bs_entered', '1')
    soundOn()
    gsap.timeline()
      .to(loader, { yPercent: -100, duration: 1.0, ease: 'power3.inOut' })
      .add(() => {
        lenis.start()
        loader.remove()
        // 入场时在屏幕中央撒几颗星
        const cx = innerWidth / 2, cy = innerHeight / 2
        ;[0, 100, 200, 300, 400].forEach((delay, i) =>
          setTimeout(() => trail?.burst(cx + (i - 2) * 120, cy + Math.sin(i * 2) * 50, 140 - Math.abs(i - 2) * 25), delay)
        )
      }, '>-0.25')
      .to('#bgm-toggle',      { opacity: 1, duration: 0.6 })
      .add(() => {
        const auth = document.querySelector('.intro-auth')
        const text = '泰缇斯感知到了您的存在  欢迎回家'
        auth.textContent = ''
        auth.classList.add('is-typing')
        const cursor = document.createElement('span')
        cursor.className = 'intro-auth-cursor'
        auth.appendChild(cursor)
        let i = 0
        const tick = () => {
          if (i < text.length) {
            cursor.insertAdjacentText('beforebegin', text[i++])
            setTimeout(tick, 80 + Math.random() * 60)
          } else {
            // 打字完成：光标停止闪烁并隐藏（不移除，避免行宽抖动）
            setTimeout(() => {
              cursor.style.animation = 'none'
              cursor.style.opacity = '0'
              // 2 秒后淡出整行，visibility:hidden 保住占位避免 flex 重排
              setTimeout(() => {
                gsap.to(auth, { opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: () => {
                  auth.style.visibility = 'hidden'
                  gsap.to('.intro-tagline', { opacity: 1, duration: 1.2, ease: 'power2.out' })
                }})
              }, 2000)
            }, 1200)
          }
        }
        tick()
      }, '+=0.2')
  }, { once: true })
  } // end else
}
