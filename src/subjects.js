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
  trail.setTint('#4d8ab5')
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
function bindCursor(el) {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-active'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'))
}
document.querySelectorAll('button,a').forEach(bindCursor)

// ── 主题色：黑海岸基调（每张卡再叠各自主题色）─────────────────────
document.documentElement.style.setProperty('--accent', '#4d8ab5')
document.documentElement.style.setProperty('--bg', '#060f1c')
document.body.style.backgroundColor = '#060f1c'

// ── 页面标题入场 ──────────────────────────────────────────────────
gsap.from('.subjects-kicker',  { opacity: 0, y: -12, duration: 0.7, delay: 0.2, ease: 'power2.out' })
gsap.from('.subjects-heading', { opacity: 0, y: 24,  duration: 0.9, delay: 0.4, ease: 'power3.out' })
gsap.from(['.subjects-rule', '.subjects-desc'], {
  opacity: 0, y: 16, duration: 0.7, delay: 0.65, stagger: 0.1, ease: 'power2.out',
})

/* ══════════════════════════════════════════════════════════════
   鸣潮属性体系 —— 六大属性 + 核心（泰提斯专属）
   ══════════════════════════════════════════════════════════════ */
const ELEMENTS = {
  冷凝: '#5ec5e8',   // Glacio
  热熔: '#e8693f',   // Fusion
  导电: '#a06be8',   // Electro
  气动: '#4fd6a0',   // Aero
  衍射: '#e8c84f',   // Spectro
  湮灭: '#d45a9a',   // Havoc
  核心: '#5a6ee6',   // 泰提斯专属 · 靛蓝
}
const ELEMENT_ORDER = Object.keys(ELEMENTS)
const LOCK_COLOR = '#6b6f86'
const colorOf = (el) => ELEMENTS[el] || LOCK_COLOR

/* ══════════════════════════════════════════════════════════════
   观测对象数据 —— 新增角色只需往这里加一条
   element 取自上面 ELEMENTS；status: 'archived' 已归档 | 'locked' 待解密
   ══════════════════════════════════════════════════════════════ */
const SUBJECTS = [
  { code: 'S-001', name: '守岸人', element: '核心', version: '1.x',
    photo: 'photos/shorekeeper.jpg', tagline: '漫长守望的终点，是第一个愿意回头的旅人。',
    author: '腐朽的书', fx: 'butterfly', href: '#', status: 'archived' },
  { code: 'S-002', name: '千咲',   element: '湮灭', version: '1.x',
    photo: 'photos/chisaki-1.jpg', tagline: '命运精心编织的线索，最难忘的那一笔。',
    author: 'Ui_uiiiiiiiii', href: 'profile.html?id=chisaki', status: 'archived' },
  { code: 'S-003', name: '莫宁', element: '热熔', version: '1.x',
    photo: 'photos/mornie.jpg', tagline: '晨光里苏醒的炽焰，温柔，亦灼人。',
    author: 'zutto_烧烤垃圾桶', href: '#', status: 'archived' },
  { code: 'S-004', name: '弗洛洛', element: '湮灭', version: '1.x',
    photo: 'photos/floro.jpg', tagline: '携琴穿过薰衣草海，奏一曲温柔的湮灭。',
    author: '雨鱼杆', fx: 'focus', href: '#', status: 'archived' },
  { code: 'S-005', name: '爱弥斯', element: '热熔', version: '1.x',
    photo: 'photos/aemis.png', tagline: '把炽热藏进一个心形里，悄悄递给你。',
    author: 'Akatsuki葉月', href: '#', status: 'archived' },
  { code: 'S-006', name: '— — —', element: '未知', version: '2.x',
    photo: '', tagline: '权限不足，等待泰缇斯授权。',
    href: '', status: 'locked' },
  { code: 'S-007', name: '— — —', element: '未知', version: '2.x',
    photo: '', tagline: '权限不足，等待泰缇斯授权。',
    href: '', status: 'locked' },
]

// ── 渲染卡片 ──────────────────────────────────────────────────────
const grid = document.getElementById('wall-grid')

function cardHTML(s) {
  const accent = colorOf(s.element)
  if (s.status === 'locked') {
    return `
      <article class="subject-card is-locked" style="--card-accent:${accent}" data-element="${s.element}" data-status="locked">
        <span class="card-code">${s.code}</span>
        <div class="card-lock">档案待解密</div>
        <div class="card-body">
          <span class="card-badge">${s.element}</span>
          <h3 class="card-name">${s.name}</h3>
        </div>
      </article>`
  }
  return `
    <article class="subject-card${s.fx ? ' fx-' + s.fx : ''}" style="--card-accent:${accent}; --photo:url('${s.photo}')" data-element="${s.element}" data-status="archived" data-href="${s.href}">
      <div class="card-photo"><img src="${s.photo}" alt="${s.name}" loading="lazy" /></div>
      <div class="card-veil"></div>
      <div class="card-fx"></div>
      <span class="card-code">${s.code}</span>
      <div class="card-body">
        <span class="card-badge">${s.element}</span>
        <h3 class="card-name">${s.name}</h3>
        <p class="card-tagline">${s.tagline}</p>
        <span class="card-enter">进入档案 →</span>
      </div>
      ${s.author ? `<span class="card-author">@${s.author}</span>` : ''}
    </article>`
}

grid.innerHTML = SUBJECTS.map(cardHTML).join('')
const cards = Array.from(grid.querySelectorAll('.subject-card'))
cards.forEach(bindCursor)

// ── 守岸人 · 蝴蝶来访：hover 时一只蝴蝶从屏幕外飞入，停 2 秒再离开 ──
const guardianIndex = SUBJECTS.findIndex((s) => s.fx === 'butterfly')
if (guardianIndex >= 0) {
  const guardianCard = cards[guardianIndex]
  let butterflyActive = false
  guardianCard.addEventListener('pointerenter', () => {
    if (butterflyActive) return
    butterflyActive = true

    const rect = guardianCard.getBoundingClientRect()
    const ox = window.scrollX, oy = window.scrollY      // 转成文档坐标，跟随滚动
    const lx = rect.left + ox + rect.width * 0.62 - 38   // 落点（偏右，对准守岸人头部）
    const ly = rect.top + oy + rect.height * 0.10

    const bf = document.createElement('div')
    bf.className = 'visiting-butterfly'
    bf.innerHTML = '<img src="photos/butterfly.png" alt="" />'
    document.body.appendChild(bf)

    gsap.set(bf, { x: ox + window.innerWidth + 80, y: ly - 130, rotation: -22, opacity: 0 })
    gsap.timeline({ onComplete: () => { bf.remove(); butterflyActive = false } })
      .to(bf, { opacity: 1, duration: 0.3 }, 0)
      .to(bf, { x: lx + 75, y: ly - 65, rotation: -14, duration: 0.55, ease: 'sine.inOut' })
      .to(bf, { x: lx - 38, y: ly - 22, rotation: 12, duration: 0.5, ease: 'sine.inOut' })
      .to(bf, { x: lx, y: ly, rotation: 0, duration: 0.4, ease: 'power2.out',
        onComplete: () => bf.classList.add('landed') })
      .to(bf, { duration: 2 })                                  // 停留 2 秒
      .add(() => bf.classList.remove('landed'))
      .to(bf, { x: lx - 70, y: ly - 110, rotation: -16, duration: 0.45, ease: 'power1.in' })
      .to(bf, { x: ox - 150, y: ly - 320, rotation: -10, opacity: 0, duration: 0.85, ease: 'power1.in' })
  })
}

// ── 千咲 · 红色切割：hover 时全屏红色利刃斜向划过 ────────────────
const slashIndex = SUBJECTS.findIndex((s) => s.fx === 'slash')
if (slashIndex >= 0) {
  const slashCard = cards[slashIndex]
  let overlays = null
  slashCard.addEventListener('pointerenter', () => {
    if (overlays) return
    const back = document.createElement('div')
    back.className = 'slash-overlay is-back'
    const front = document.createElement('div')
    front.className = 'slash-overlay is-front'
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('span')
      s.className = 'slash'
      s.style.setProperty('--y', (-10 + Math.random() * 120).toFixed(1) + '%')
      s.style.setProperty('--ang', (Math.random() * 150 - 75).toFixed(1) + 'deg')  // 方向四散
      s.style.setProperty('--th', (2 + Math.random() * 4).toFixed(1) + 'px')
      ;(i % 2 === 0 ? back : front).appendChild(s)   // 交替分到前/后层
    }
    document.body.append(back, front)
    overlays = [back, front]
    requestAnimationFrame(() => { back.classList.add('show'); front.classList.add('show') })
  })
  slashCard.addEventListener('pointerleave', () => {
    if (!overlays) return
    const ovs = overlays
    overlays = null
    ovs.forEach((o) => o.classList.remove('show'))
    setTimeout(() => ovs.forEach((o) => o.remove()), 420)
  })
}

// ── 莫宁 · 璀璨之环 + 星辉：hover 时卡片浮现暖金光环与星点 ──────
const ringIndex = SUBJECTS.findIndex((s) => s.fx === 'ring')
if (ringIndex >= 0) {
  const ringCard = cards[ringIndex]
  let aura = null
  ringCard.addEventListener('pointerenter', () => {
    if (aura) return
    const rect = ringCard.getBoundingClientRect()
    const cx = rect.left + window.scrollX + rect.width / 2
    const cy = rect.top + window.scrollY + rect.height / 2
    aura = document.createElement('div')
    aura.className = 'mornie-aura'
    aura.style.left = cx + 'px'
    aura.style.top = cy + 'px'
    aura.style.setProperty('--d', (rect.height * 1.08).toFixed(0) + 'px')

    const ring = document.createElement('div')
    ring.className = 'ring'
    aura.appendChild(ring)

    const R = rect.width
    for (let i = 0; i < 14; i++) {
      const st = document.createElement('span')
      st.className = 'star'
      const ang = Math.random() * Math.PI * 2
      const rad = (0.5 + Math.random() * 0.7) * R
      st.style.left = (Math.cos(ang) * rad).toFixed(0) + 'px'
      st.style.top = (Math.sin(ang) * rad * 1.25).toFixed(0) + 'px'   // 纵向拉伸贴合竖卡
      st.style.setProperty('--sz', (8 + Math.random() * 12).toFixed(0) + 'px')
      st.style.setProperty('--dl', (Math.random() * 2).toFixed(2) + 's')
      st.textContent = '✦'
      aura.appendChild(st)
    }
    document.body.appendChild(aura)
    requestAnimationFrame(() => aura.classList.add('show'))
  })
  ringCard.addEventListener('pointerleave', () => {
    if (!aura) return
    const a = aura
    aura = null
    a.classList.remove('show')
    setTimeout(() => a.remove(), 420)
  })
}

// 空状态提示
const emptyTip = document.createElement('p')
emptyTip.className = 'wall-empty'
emptyTip.textContent = '该属性暂无观测记录'
grid.after(emptyTip)

// 计数器
document.getElementById('count-archived').textContent =
  SUBJECTS.filter((s) => s.status === 'archived').length
document.getElementById('count-locked').textContent =
  SUBJECTS.filter((s) => s.status === 'locked').length

// ── 筛选栏（全部 + 鸣潮六大属性 + 核心）─────────────────────────
const filters = ['全部', ...ELEMENT_ORDER]
const filterBar = document.getElementById('wall-filters')
filterBar.innerHTML = filters
  .map((el, i) => {
    const accent = el === '全部' ? '' : ` style="--chip-accent:${colorOf(el)}"`
    return `<button class="wall-chip${i === 0 ? ' is-active' : ''}" data-filter="${el}"${accent} role="tab">${el}</button>`
  })
  .join('')
const chips = Array.from(filterBar.querySelectorAll('.wall-chip'))
chips.forEach(bindCursor)

const wall = document.querySelector('.subjects-wall')

function applyFilter(filter) {
  // 若已滚进网格区，先平滑带回结果区顶部，避免高度骤减导致的突然置顶
  const targetY = wall.getBoundingClientRect().top + window.scrollY - 90
  if (window.scrollY > targetY + 4) lenis.scrollTo(targetY, { duration: 0.6 })

  let shown = 0
  cards.forEach((c) => {
    const show = filter === '全部' || c.dataset.element === filter
    if (show) {
      shown++
      c.style.display = ''
      gsap.fromTo(c, { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out', overwrite: true })
    } else {
      // 立即收起，网格即时重排，避免留存卡片延迟跳位
      gsap.set(c, { opacity: 0 })
      c.style.display = 'none'
    }
  })
  emptyTip.classList.toggle('is-visible', shown === 0)
  ScrollTrigger.refresh()
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'))
    chip.classList.add('is-active')
    applyFilter(chip.dataset.filter)
  })
})

// ── 点击：跳转个人档案 / 锁定卡抖动 ──────────────────────────────
cards.forEach((card) => {
  card.addEventListener('click', () => {
    if (card.dataset.status === 'locked') {
      card.classList.add('shake')
      setTimeout(() => card.classList.remove('shake'), 420)
      return
    }
    const href = card.dataset.href
    if (href && href !== '#') window.location.href = href
  })
})

// ── 入场动画：卡片随滚动逐个浮现 ────────────────────────────────
gsap.set(cards, { opacity: 0, y: 36 })
ScrollTrigger.batch(cards, {
  start: 'top 92%',
  onEnter: (batch) =>
    gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out', overwrite: true }),
})
