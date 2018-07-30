const seed = "f"
const d = 10
const theta = Math.PI / 3

function run(p) {
  const path = []
  let pos = [0,0]
  let angle = 0
  for (const c of p) {
    switch (c) {
      case 'f': {
        const newPos = [pos[0] + Math.cos(angle) * d, pos[1] + Math.sin(angle) * d]
        path.push([pos, newPos])
        pos = newPos
      } break;
      case 'g': {
        const newPos = [pos[0] + Math.cos(angle) * d, pos[1] + Math.sin(angle) * d]
        pos = newPos
      } break;
      case '+': {
        angle += theta
      } break;
      case '-': {
        angle -= theta
      } break;
    }
  }
  return path
}

function step(program, rule) {
  const limit = 10000
  let n = 0
  return program.replace(rule.pattern, (...m) => {
    n += 1
    if (n > limit) {
      throw 'limit exceeded'
    }
    return rule.replacement
  })
}
function steps(program, rules) {
  return rules.reduce(step, program)
}

function iterate(times, seed, func) {
  let val = seed
  for (let i = 0; i < times; i++) {
    val = func(val)
  }
  return val
}

function toPathData(path) {
  let pathData = ""
  let prev = null
  for (const seg of path) {
    const [[x0, y0], [x1, y1]] = seg
    if (!prev || prev[0] != x0 || prev[1] != y0) {
      pathData += `M${x0} ${y0}`
    }
    pathData += `L${x1} ${y1}`
    prev = seg[1]
  }
  return pathData
}

let rules = []

const alphabet = "ffg+-xy"

function choose(xs) {
  return xs[Math.floor(Math.random()*xs.length)]
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function unescapeRegExp(string) {
  return string.replace(/\\(.)/g, "$1")
}

function randomRule() {
  let pattern = ""
  for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
    pattern += choose(alphabet)
  }
  let replacement = ""
  for (let i = 0; i < 1 + Math.floor(Math.random() * 5); i++) {
    replacement += choose(alphabet)
  }
  if (pattern === replacement) return randomRule()
  return {pattern: new RegExp(escapeRegExp(pattern), 'g'), replacement}
}
function randomRules() {
  const rules = []
  const n = 2 + Math.floor(Math.random() * 4)
  for (let i = 0; i < n; i++) {
    rules.push(randomRule())
  }
  return rules
}

while (!rules.length || !rules.some(r => r.pattern.test(seed)) || !rules.some(r => r.pattern.test(steps(seed, rules)))) {
  rules = randomRules()
}

function minBy(xs, f) {
  let minVal = null
  let min = null
  for (let i = 0; i < xs.length; i++) {
    const v = xs[i]
    const e = f(v)
    if (min == null || e < min) {
      min = e
      minVal = v
    }
  }
  return minVal
}
function extent(xs, f) {
  let min = null
  let max = null
  for (let i = 0; i < xs.length; i++) {
    const e = f(xs[i])
    if (min == null || e < min) {
      min = e
    }
    if (max == null || e > max) {
      max = e
    }
  }
  return [min, max]
}

const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, 'svg')
svg.setAttribute('xmlns', svgNS)
const progView = document.createElement('textarea')
const rulesView = document.createElement('textarea')
const path = svg.appendChild(document.createElementNS(svgNS, 'path'))
document.body.appendChild(svg)
document.body.appendChild(progView)
document.body.appendChild(rulesView)

function rulesToString(rules) {
  return rules.map(r => `${unescapeRegExp(r.pattern.source)} → ${r.replacement}`).join('\n')
}
rulesView.textContent = rulesToString(rules)
rulesView.rows = rules.length

rulesView.addEventListener('input', e => {
  rules = e.target.value.split('\n').map(r => {
    const [pat, rep] = r.split('→').map(x => x.trim())
    if (pat != null && rep != null) {
      return {
        pattern: new RegExp(escapeRegExp(pat), 'g'),
        replacement: rep
      }
    }
  }).filter(x => x)
  go()
})

let ivl
function go() {
  clearInterval(ivl)

  svg.style.display = 'block'
  svg.width = 640
  svg.height = 480
  svg.setAttribute('viewBox', "-320 -240 640 480")
  svg.setAttribute('width', 640)
  svg.setAttribute('height', 480)
  let iter = 0
  ivl = setInterval(() => {
    iter += 1
    try {
      const p = iterate(iter, seed, p => steps(p, rules))
      const segs = run(p)
      if (segs.length > 10000) {
        console.log(segs)
        clearInterval(ivl)
        return
      }
      if (segs.length) {
        path.setAttribute('d', toPathData(segs))
        const [minX, maxX] = extent(segs, p => p[0][0])
        const [minY, maxY] = extent(segs, p => p[0][1])
        const width = maxX - minX
        const height = maxY - minY
        svg.setAttribute('viewBox', `${minX - 10} ${minY - 10} ${width + 20} ${height + 20}`)
        svg.setAttribute('data-rules', rulesToString(rules))
        svg.setAttribute('data-seed', seed)
      }
      progView.textContent = p
    } catch (e) {
      if (e === 'limit exceeded') {
        console.log(e)
        clearInterval(ivl)
      } else throw e
    }
  }, 100)
  path.style.stroke = 'black'
  path.style.fill = 'none'
}
go()


/*

hextooth
60°
f → +f---
+ → ff-

chain of stars
60°
f- → +ff
f → xg+
xg → +f-f

echoes
60°
- → -f
x → f-gf
f → xxg
- → -gxfx

logo
60°
f → gfff
f+ → f
ff → f+f

labyrinth
60°
- → ff
f → +f-g

layered rosettes
60°
f → +++
+ → ff-
f → f-f

folded paper
60°
f → gfg
g → +f

aperture
60°
f → f+f-
- → g+g

romulan war bird
60°
gf → y+f
f → gf
f → yyx
y → f+
*/
