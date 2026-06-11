import * as THREE from 'three'

const FADE_FRAG = /* glsl */ `
  uniform sampler2D uPrev;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uPrev, vUv).rgb;
    c *= 0.958;
    c = max(c - 0.0018, 0.0);
    gl_FragColor = vec4(c, 1.0);
  }
`

const STAR_FRAG = /* glsl */ `
  uniform float uSeed;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float a = pow(abs(p.x), 0.36) + pow(abs(p.y), 0.36);
    float i = clamp(1.0 - a, 0.0, 1.0);
    i = pow(i, 1.5) * 1.1 + pow(i, 7.0) * 1.4;
    gl_FragColor = vec4(vec3(i * uSeed), 1.0);
  }
`

const DISPLAY_FRAG = /* glsl */ `
  uniform sampler2D uTrail;
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    float i = texture2D(uTrail, vUv).r;
    float alpha = clamp(i, 0.0, 1.0);
    vec3 col = uTint * i + vec3(1.0) * pow(i, 3.0) * 0.55;
    gl_FragColor = vec4(col, alpha);
  }
`

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const MAX_STAMPS_PER_FRAME = 10

export class TrailBackground {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.fadeScene = new THREE.Scene()
    this.fadeMat = new THREE.ShaderMaterial({
      uniforms: { uPrev: { value: null } },
      vertexShader: QUAD_VERT,
      fragmentShader: FADE_FRAG,
      depthTest: false,
    })
    this.fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fadeMat))

    this.stampScene = new THREE.Scene()
    this.stamps = []
    for (let i = 0; i < MAX_STAMPS_PER_FRAME; i++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uSeed: { value: 1 } },
        vertexShader: QUAD_VERT,
        fragmentShader: STAR_FRAG,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
      mesh.visible = false
      this.stampScene.add(mesh)
      this.stamps.push(mesh)
    }

    this.displayScene = new THREE.Scene()
    this.displayMat = new THREE.ShaderMaterial({
      uniforms: {
        uTrail: { value: null },
        uTint: { value: new THREE.Color('#4d8ab5') },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: DISPLAY_FRAG,
      transparent: true,
      depthTest: false,
    })
    this.displayScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.displayMat))

    this.pending = []
    this.lastPointer = null

    this.resize()
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('pointermove', (e) => this.onPointerMove(e))

    this.renderer.setAnimationLoop(() => this.tick())
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.width = w
    this.height = h
    this.renderer.setSize(w, h)
    const opts = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    }
    const dpr = this.renderer.getPixelRatio()
    this.rtA?.dispose()
    this.rtB?.dispose()
    this.rtA = new THREE.WebGLRenderTarget(w * dpr, h * dpr, opts)
    this.rtB = new THREE.WebGLRenderTarget(w * dpr, h * dpr, opts)
  }

  onPointerMove(e) {
    const now = performance.now()
    if (!this.lastPointer) {
      this.lastPointer = { x: e.clientX, y: e.clientY, t: now }
      return
    }
    const dx = e.clientX - this.lastPointer.x
    const dy = e.clientY - this.lastPointer.y
    const dist = Math.hypot(dx, dy)
    if (dist < 5) return
    const speed = dist / Math.max(now - this.lastPointer.t, 1)
    this.lastPointer = { x: e.clientX, y: e.clientY, t: now }

    const size = THREE.MathUtils.clamp(30 + speed * 55, 36, 190) * (0.8 + Math.random() * 0.45)
    this.pushStamp(e.clientX, e.clientY, size, 0.9 + Math.random() * 0.5)
    if (Math.random() < 0.3) {
      this.pushStamp(
        e.clientX + (Math.random() - 0.5) * size * 1.6,
        e.clientY + (Math.random() - 0.5) * size * 1.2,
        size * (0.25 + Math.random() * 0.3),
        1.2
      )
    }
  }

  pushStamp(x, y, size, strength) {
    if (this.pending.length >= MAX_STAMPS_PER_FRAME) return
    this.pending.push({ x, y, size, strength })
  }

  setTint(hex) {
    this.displayMat.uniforms.uTint.value.set(hex)
  }

  burst(x, y, size = 160) {
    this.pushStamp(x, y, size, 1.4)
  }

  tick() {
    const r = this.renderer

    this.fadeMat.uniforms.uPrev.value = this.rtA.texture
    r.setRenderTarget(this.rtB)
    r.render(this.fadeScene, this.camera)

    if (this.pending.length) {
      for (let i = 0; i < this.stamps.length; i++) {
        const mesh = this.stamps[i]
        const s = this.pending[i]
        if (!s) { mesh.visible = false; continue }
        mesh.visible = true
        mesh.position.set((s.x / this.width) * 2 - 1, -(s.y / this.height) * 2 + 1, 0)
        mesh.scale.set(s.size / this.width, s.size / this.height, 1)
        mesh.material.uniforms.uSeed.value = s.strength
      }
      this.pending.length = 0
      const prevAutoClear = r.autoClear
      r.autoClear = false
      r.render(this.stampScene, this.camera)
      r.autoClear = prevAutoClear
    }

    ;[this.rtA, this.rtB] = [this.rtB, this.rtA]
    this.displayMat.uniforms.uTrail.value = this.rtA.texture
    r.setRenderTarget(null)
    r.render(this.displayScene, this.camera)
  }
}
