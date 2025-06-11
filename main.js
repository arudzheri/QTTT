function toggleTheme() {
  const dark = document.body.classList.toggle("dark")
  localStorage.setItem("theme", dark ? "dark" : "light")
}

function loadTheme() {
  const theme = localStorage.getItem("theme")
  if (theme === "dark") {
    document.body.classList.add("dark")
  }
}

/////////////////
// Ball Animation
/////////////////


function animate() {
  const parent = document.getElementById("ball-pit")
  const ogBall = document.getElementById("og-ball")
  if (!parent) return;

  const emptyBall = {x: 0, y: 0, vx: 0, vy: 0}
  const BALL_COUNT = 50
  const balls = []
  const shades = [200, 300, 400, 500, 600, 700, 800]

  for (let i = 0; i < BALL_COUNT; i += 1) {
    const r = Math.random() * 30
    const newBall = ogBall.cloneNode()
    const shade = shades[Math.round((1 - r / 30) * (shades.length - 1))]
    newBall.setAttribute("fill", `var(--background-${shade})`)
    parent.appendChild(newBall)
    balls.push(
      { r: r + 20, s: r / 10, blob: newBall, ...emptyBall },
    )
  }

  const gravity = 0
  for (const ball of balls) {
    ball.x = ball.r + Math.random() * (parent.clientWidth - 2 * ball.r)
    ball.y = ball.r + Math.random() * (parent.clientHeight - 2 * ball.r)
    
    const a = Math.random() * 2 * Math.PI
    ball.vx = Math.cos(a) * ball.s
    ball.vy = Math.sin(a) * ball.s
  }

  function dot(a, b) {
    if (a.length !== b.length) {
      throw "a and b need to be the same length"
    }

    let sum = 0
    for (const i in a) {
      sum += a[i] * b[i]
    }

    return sum
  }

  const step = () => {
    const [ph, pw] = [parent.clientHeight, parent.clientWidth]
    parent.setAttribute("viewbox", `0 0 ${pw} ${ph}`)

    // Draw
    for (const b of balls) {
      b.blob.setAttribute("d", `
        M ${b.x} ${b.y} m ${b.r} 0 
        a ${b.r} ${b.r} 0 1 0 ${-b.r * 2} 0 
        a ${b.r} ${b.r} 0 1 0 ${ b.r * 2} 0
      `)
      b.x += b.vx
      b.y += b.vy
    }

    // Collisions
    for (let i = 0; i < balls.length - 1; i += 1) {
      for (let j = i + 1; j < balls.length; j += 1) {
        const b1 = balls[i], b2 = balls[j]

        // Distances
        const dx = b1.x - b2.x, dy = b1.y - b2.y
        const d = Math.sqrt((dx ** 2) + (dy ** 2))

        // Closing Distance Check
        const ndx = (b1.x + b1.vx) - (b2.x + b2.vx), ndy = (b1.y + b1.vy) - (b2.y + b2.vy)
        const nd = Math.sqrt((ndx ** 2) + (ndy ** 2))

        if (d < b1.r + b2.r && nd < d) {
          // Masses
          const m1 = b1.r ** 2
          const m2 = b2.r ** 2
          
          //  Unit vector in the direction of the collision.
          const ax = dx / d
          const ay = dy / d
          
          //  Projection of the velocities in these axes.
          const va1 = dot([b1.vx, b1.vy], [ax, ay])
          const vb1 = dot([-b1.vx, b1.vy], [ay, ax])
          const va2 = dot([b2.vx, b2.vy], [ax ,ay])
          const vb2 = dot([-b2.vx, b2.vy], [ay, ax])
          
          //  New velocities in these axes
          const nva2 = va2 + 2.0 * (va1 - va2) / (1.0 + m2 / m1)
          const nva1 = va1 + 2.0 * (va2 - va1) / (1.0 + m1 / m2)
          
          //  Undo the projections
          b1.vx = dot([nva1, -vb1], [ax, ay]) 
          b1.vy = dot([nva1, vb1], [ay, ax])
          b2.vx = dot([nva2, -vb2], [ax, ay]) 
          b2.vy = dot([nva2, vb2], [ay, ax])
        }
      }
    }
    
    // Wall Bounce
    for (const b of balls) {
      if ((b.x < b.r && b.vx < 0) || (b.x > pw - b.r && b.vx > 0)) {
        b.vx *= -1
      }
      else if ((b.y < b.r && b.vy < 0) || (b.y > ph - b.r && b.vy > 0)) { 
        b.vy *= -1 
      }
      
      b.vy += gravity
    }

  }

  // step()
  window.setInterval(step, 10)
}

window.onload = animate
