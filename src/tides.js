import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ══════════════════════════════════════════════════════════════
   观潮 · 逐版本剧情解析
   往这里加一条 = 时间线上多一段；body 是段落数组
   ══════════════════════════════════════════════════════════════ */
const TIDES = [
  {
    ver: '3.1', tag: '拉海洛 · 爱弥斯', title: '互相救赎 · 因果闭环',
    body: [
      '3.1 的内核不是"漂泊者拯救爱弥斯"，而是两颗救世之心彼此成全的因果闭环。爱弥斯穿越时间回到拉海洛的过去拯救幼年漂泊者，漂泊者跳入剑湖追回爱弥斯——两个人互为对方的救世主，循环从一开始就注定成立。',
      '"触碰"贯穿全篇，是爱弥斯情感的温度计。救下漂泊者后摸空了的手，冰原上停在半途的指尖，二人相认后迟到的那一次抚摸，梦中主动收回的指尖——每一次温度都不同，每一次都是隔着维度与时间的渴望与克制。',
      '爱弥斯的笑容是精心准备的表演，一层层面具在漂泊者面前剥落，最终在"把这些独自压在心里，很痛苦吧"这句话面前彻底崩塌。他不敢抬头，怕真相伤害失忆的漂泊者——哪怕再痛苦，只要能为他分担一些，那便是幸福。',
      '循环不是悲剧的句号。爱弥斯临别留言：在更向后的时间维度中，囚禁循环的牢笼末端开始坍缩。即便知道结局，即便身处因果之中，也依然会选择与你同行，直到时间的尽头。',
    ],
  },
  {
    ver: '3.3', tag: '拉海洛 · 爱弥斯', title: '文明不屈 · 世界拯救英雄',
    body: [
      '3.3 不是"一个人拯救所有人"的故事，而是"所有人托起一个人，让希望抵达终点"。黑海岸、学院、深空联合、学生们——每个人做的事可能不宏大，但都不可或缺。真正成熟的世界，不是等待英雄降临，而是在英雄抵达前，自己已经开始行动。',
      '绯雪是曾经失败过的守护者。她的痛苦不来自自身受伤，而是没能救下别人。残星会抓住这个痛点：如果你拥有更强的力量，也许一切都会不同。但绯雪拒绝了这条路——3.3 并不认同"只要力量足够强就能拯救世界"的逻辑。',
      '爱弥斯既是被拯救者，也是拯救链条中的关键一环。那些被虚质磁暴吞噬的人把最后的频率交给她，为后来者留下坐标和来时路——在过往构成了拯救本身。过去的人留下频率，现在的人选择相信，未来的人继承文明意志继续前进。',
      '眺望者号致敬旅行者一号：一个文明向宇宙发出的孤独追问，在 3.3 的结尾终于得到回应。文明不屈，不是热血口号——而是即使无人指引，即使神明沉默，仍然发出声音，留下坐标，走向星海，等待被另一个存在听见。',
    ],
  },
]

// ── 主题色：潮汐蓝 ────────────────────────────────────────────────
document.documentElement.style.setProperty('--accent', '#4d8ab5')
document.documentElement.style.setProperty('--bg', '#060f1c')

// ── Lenis 丝滑滚动 ────────────────────────────────────────────────
const lenis = new Lenis({ duration: 1.35, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// ── Three.js 光标拖痕 ─────────────────────────────────────────────
import('./trail.js').then(({ TrailBackground }) => {
  const t = new TrailBackground(document.getElementById('trail-canvas'))
  t.setTint('#4d8ab5')
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

// ── 光标 ──────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor')
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

// ── 渲染时间线 ────────────────────────────────────────────────────
const list = document.getElementById('tide-list')
list.innerHTML = TIDES.map((t) => `
  <article class="tide-entry">
    <div class="tide-head">
      <span class="tide-ver">${t.ver}</span>
      ${t.tag ? `<span class="tide-tag">${t.tag}</span>` : ''}
    </div>
    <h2 class="tide-title">${t.title}</h2>
    <div class="tide-body">
      ${t.body.map((p) => `<p class="${/待写入/.test(p) ? 'todo' : ''}">${p}</p>`).join('')}
    </div>
  </article>
`).join('')

// 入场：逐条浮现
gsap.utils.toArray('.tide-entry').forEach((el) => {
  gsap.from(el, {
    opacity: 0, y: 36, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
  })
})

// 页面标题入场
gsap.from('.subjects-kicker', { opacity: 0, y: -12, duration: 0.7, delay: 0.2, ease: 'power2.out' })
gsap.from('.subjects-heading', { opacity: 0, y: 24, duration: 0.9, delay: 0.4, ease: 'power3.out' })
gsap.from(['.subjects-rule', '.subjects-desc'], { opacity: 0, y: 16, duration: 0.7, delay: 0.65, stagger: 0.1, ease: 'power2.out' })
