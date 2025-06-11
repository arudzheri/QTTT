var game = {
  grid: new Array(9).fill([]),
  ecycle: [],
  entangles: [],
  state: "ready",
  player: "X",
  turn: 1,
  reset() {
    this.player = "X"
    this.turn = 1
    for (const i in this.grid)
      this.grid[i] = []
  },
  play(index, cvalue) {
    const value = this.grid[index]
    const token = this.player + this.turn
    if (typeof (value) == "string") return
    switch (this.state) {
      case "ready":
        value.push(token)
        this.state = "second-move"
        return
      case "second-move":
        if (value.includes(token)) return

        value.push(token)
        const treeSearch = (start, goal, tokenLink, visited, choices) => {
          visited = [...visited, start]
          choices = [...choices, [tokenLink]]
          const choiceIndex = choices.length - 1
          for (const token of this.grid[start].filter(t => t != tokenLink)) {
            const other = this.grid.findIndex((cell, i) => i != start && cell.includes(token))
            if (other == goal) {
              choices[choiceIndex][1] = token
              return { success: true, cycle: visited, choices }
            }
            else if (other != -1) {
              const s = treeSearch(other, goal, token, visited, choices)
              if (s.success) {
                s.choices[choiceIndex][1] = token
                return s
              }
            }
          }
          return { success: false }
        }

        const search = treeSearch(index, index, token, [], [])
        if (search.success) {
          this.state = "entangled"
          this.ecycle = search.cycle
          this.entangles = search.choices
        }
        else {
          this.state = "ready"
          this.player = this.player == "X" ? "O" : "X"
          if (this.player == "X") this.turn += 1
        }

        return;
      case "entangled":
        if (cvalue) {
          const open = this.grid[index].filter(v => v != cvalue)
          this.grid[index] = cvalue.at(0)
          while (open.length) {
            const current = open.shift()
            const i = this.grid.findIndex(v => v.includes(current))
            if (i != -1) {
              const others = this.grid[i].filter(v => v != current)
              this.grid[i] = current.at(0)
              open.push(...others)
            }
          }
          this.state = "ready"
          this.player = this.player == "X" ? "O" : "X"
          if (this.player == "X") this.turn += 1
        }
        return;
    }
  },
  winner() {
    const [a, b, c, d, e, f, g, h, i] = this.grid.map(e => {
      if (typeof (e) == "string") return e
    })

    if (a && (a == b && b == c || a == d && d == g || a == e && e == i))
      return a
    else if (e && (e == c && c == g || e == b && b == h || e == f && f == d))
      return e
    else if (i && (i == h && h == g || i == f && f == c))
      return i
  },
  full() {
    return !this.grid.some(e => typeof (e) != "string")
  },

}

var statusBox
var gridElement
function setupBoard() {
  gridElement = document.getElementById("qttt")
  statusBox = document.getElementById("status")
  gridElement.innerHTML = ""
  // TODO: Clear all html inside gridElement and make from scratch
  const gsize = 3
  const bsize = 1
  for (let i = 0; i < gsize; i += 1) {
    for (let j = 0; j < gsize; j += 1) {
      const index = gsize * i + j
      const div = document.createElement("div")
      div.classList.add("square")
      if (i % bsize == 0) div.classList.add("top");
      if (j % bsize == 0) div.classList.add("left");
      if (j == gsize - 1) div.classList.add("right");
      if (i == gsize - 1) div.classList.add("bottom");

      div.onclick = () => registerInput(index)
      gridElement.appendChild(div)
    }
  }
  statusBox.innerText = `Player ${game.player}'s Turn`
}

function drawBoard() {
  const divs = document.getElementsByClassName("square")
  for (const index in game.grid) {
    const value = game.grid[index]
    if (typeof (value) == "string") {
      divs[index].innerText = value
      divs[index].classList.add("collapsed")
      divs[index].classList.remove("entangled")
    }
    else {
      if (game.state != "entangled") {
        divs[index].innerText = value.join(", ")
      }
      else {
        divs[index].innerHTML = ""
        for (const choice of value) {
          const span = document.createElement("span")
          span.innerText = choice
          span.onclick = () => {
            console.log(`Chose value ${choice} for square ${index}`)
            game.play(index, choice)
            drawBoard()
          }
          divs[index].appendChild(span)
        }
      }

    }
  }
}

function registerInput(index) {
  game.play(index)
  drawBoard()
  const winner = game.winner()
  if (game.full() && !winner) {
    statusBox.innerText = "Draw. Adios"
    game.status = "end"
  }
  else if (winner) {
    statusBox.innerText = `Winner is ${winner}`
    game.status = "end"
  }
  else if (game.state == "entangled") {
    statusBox.innerText = `We're entangled! ${JSON.stringify(game.ecycle)}, ${JSON.stringify(game.entangles)}`

    const divs = document.getElementsByClassName("square")
    for (const index of game.ecycle) {
      divs[index].classList.add("entangled")
    }
  }
}

window.onload = () => {
  game.reset();
  setupBoard();
}
