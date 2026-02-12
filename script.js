let el = document.querySelector(".q5")
let p = new p5('instance', el);
p.setup = () => { p.createCanvas(1200, 600) }
let right = false
let oninit = []
setTimeout(() => oninit.forEach(fn => fn()), 50)
oninit.push(() => { render() })

let v = (x, y) => p.createVector(x, y)
let vdup = v => p.createVector(v.x, v.y)

function drawQuad(vectors, _p = p) {
	_p.stroke(1)
	_p.strokeWeight(1)
	_p.quad(
		...vectors.reduce((acc, e) => acc.concat([e.x, e.y]), [])
	)
}
function drawLine(vectors, _p = p) {
	_p.stroke(1)
	_p.strokeWeight(1)
	_p.line(
		...vectors.reduce((acc, e) => acc.concat([e.x, e.y]), [])
	)
}
function mirror(p, m) {
	let dx, dy, a, b;
	let x2, y2;

	let x0 = m[0].x
	let x1 = m[1].x
	let y0 = m[0].y
	let y1 = m[1].y

	dx = (x1 - x0);
	dy = (y1 - y0);

	a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
	b = 2 * dx * dy / (dx * dx + dy * dy);

	x2 = (a * (p.x - x0) + b * (p.y - y0) + x0);
	y2 = (b * (p.x - x0) - a * (p.y - y0) + y0);

	return v(x2, y2)

}

let drawPoint = (v) => p.point(v.x, v.y)
let drawCircle = (v, r) => p.circle(v.x, v.y, r)
p.angleMode('degrees')

let nx = 0
let ny = 0
let nw = 80
let nh = 800

let index = 0

let mainrect = [
	v(nx, ny),
	v(nx + nw, ny),
	v(nx + nw, ny + nh),
	v(nx, ny + nh)
]


let baselines = []
for (let i = 0; i < 12; i++) {
	baselines.push([v(nx, ny + (i + 1) * 50),
	v(nx + nw, ny + (i + 1) * 50 + 8)])
}
baselines.push([vdup(mainrect[3]), vdup(mainrect[2])])

function render() {
	p.mouseWheel = (event) => {
		if (event.delta > 0) right ? rup() : lup()
		else right ? rdown() : ldown()
	}
	p.draw = () => {
		// p.frameRate(5)
		p.angleMode('degrees');
		p.push()
		p.translate(0, nw)
		p.rotate(-90)
		// p.rotate(-p.mouseX)

		let circles = img => {
			img.fill(255)
			for (let i = 0; i < 80; i++) {
				img.circle(30,
					15 + (i * 15), 30)
			}
		}

		let imgss = p.createGraphics(nw, nh)
		circles(imgss)


		let lines = JSON.parse(JSON.stringify(baselines))
		let linescopy = JSON.parse(JSON.stringify(baselines))

		drawQuad(mainrect)
		p.image(imgss, nx, ny)
		lines.forEach((e, i) => {
			if (i == index) {
				p.stroke(255, 0, 0)
				p.strokeWeight(1)
				p.line(e[0].x, e[0].y, e[1].x, e[1].y,)
			}
			else drawLine(e)
		})

		p.opacity(.95)

		let drawat = []
		let _index = 0
		let currentline = []
		let currentmirror = []
		if (right) {
			let pp = p.createGraphics(p.width, p.height)
			pp.fill(255)
			pp.opacity(.95)
			pp.push()
			pp.translate(350, 150)

			while (lines.length > 1) {
				let popped = lines.shift()
				let mirrorline = [popped[0], popped[1]]
				let f = [mirrorline[0], mirrorline[1], lines[0][1], lines[0][0],].reduce((acc, e) => {
					let otherside = mirror(e, mirrorline)
					acc.push(otherside)
					return acc
				}, [])

				lines = lines.reduce((acc, e) => {
					// let otherside = mirror(e, mirrorline)
					acc.push([mirror(e[0], mirrorline), mirror(e[1], mirrorline)])
					return acc
				}, [])

				pp.fill(205)
				// drawQuad(tomirror)
				pp.fill(255, 150, 150)
				drawQuad(f, pp)
				mirrorline.map((e, i) => { pp.text(i, e.x, e.y) })
				mainrect.map((e, i) => { pp.text(i, e.x, e.y) })

				if (_index == index) {
					currentline = popped
					currentmirror = mirrorline
				}

				if (_index % 2 == 1) {
					let img = pp.createGraphics(nw, nh)
					circles(img)

					let mask = pp.createGraphics(nw, nh)
					// drawQuad(v(0,0), v(30,15), v(28,45), v(0,45), mask)
					let vv1 = baselines[_index]
					let vv2 = baselines[_index + 1]
					let cuttl = [vv1[0].x - nx, vv1[0].y - ny]
					mask.quad(
						cuttl[0],
						cuttl[1],
						vv1[1].x - nx,
						vv1[1].y - ny,

						vv2[1].x - nx,
						vv2[1].y - ny,
						vv2[0].x - nx,
						vv2[0].y - ny
					)
					img.mask(mask)
					let yy = pp.min(cuttl[1], vv1[1].y - ny)
					img = img.get(cuttl[0], yy, nw, pp.max(vv2[1].y, vv2[0].y) - yy)

					let realcurrentline = linescopy[_index]
					let start = vdup(realcurrentline[0])
					let end = vdup(mirrorline[0])
					let diffv = end.sub(start)
					let transformedline = realcurrentline.map(v => vdup(v)).map(e => e.add(diffv))

					let p2 = mirrorline[0]
					let p1 = mirrorline[1]
					let p3 = transformedline[1]

					let inv = 1
					if (p1.y - p3.y < 0) inv = -1

					// pp.stroke(255,0,255)
					// pp.strokeWeight(5)
					// pp.line(transformedline[0].x, transformedline[0].y, transformedline[1].x, transformedline[1].y)
					// pp.triangle(p1.x,p1.y, p2.x, p2.y, p3.x, p3.y)

					let AB = pp.dist(p1.x, p1.y, p2.x, p2.y);
					let BC = pp.dist(p2.x, p2.y, p3.x, p3.y);
					let AC = pp.dist(p1.x, p1.y, p3.x, p3.y);
					let cosAngle = (AB * AB + BC * BC - AC * AC) / (2 * AB * BC);
					// cosAngle = pp.constrain(cosAngle, -1, 1);
					let _angle = pp.acos(cosAngle)

					pp.push()
					let off = 0
					if (p3.y < p2.y) off = p2.y - p3.y
					pp.translate(mirrorline[0].x, mirrorline[0].y)
					pp.rotate(_angle * inv)
					pp.image(img, 0, -off)
					pp.pop()

				}

				_index++

			}
			// pp.line(currentline[0].x, currentline[0].y, currentline[1].x, currentline[1].y)

			pp.pop()
			p.image(pp, -400, 50, pp.width, pp.height)
		}


		p.stroke(255, 0, 0)
		p.strokeWeight(1)

		p.stroke(255, 0, 255)
		// p.line(transformedline[0].x, transformedline[0].y,transformedline[1].x, transformedline[1].y)
		p.text(index, 30, 50)

		p.stroke(0, 0, 255)


		p.pop()
	}
}

let load = () => {
	let d = localStorage.getItem('data')
	if (d) {
		let _baselines = JSON.parse(d).map(line => line.map(point => v(point.x, point.y)))
		if (_baselines.length < baselines.length) _baselines = _baselines.concat(baselines.slice(_baselines.length - 1))
		// for(let i = 2; i<_baselines.length; i++){
		// 	setTimeout(() => baselines = _baselines.slice(0,i+1), i*50)
		// }

		// for(let i = _baselines.length; i>2; i--){
		// 	setTimeout(() => baselines = _baselines.slice(0,i+1), baselines.length*50 - (i*50))
		// }
		baselines = _baselines
	}
}
let save = () => {
	let storable = baselines.map(line => line.map(point => ({ x: point.x, y: point.y })))
	localStorage.setItem('data', JSON.stringify(storable))
}
let rup = () => baselines[index][1].add(v(0, -5))
let lup = () => baselines[index][0].add(v(0, -5))
let rdown = () => baselines[index][1].add(v(0, +5))
let ldown = () => baselines[index][0].add(v(0, +5))
document.onkeydown = e => {
	if (e.key == 'ArrowRight' || e.key == 'd') {
		baselines.length - 2 > index ? index++ : null
		console.log(index)
	}
	if (e.key == 'ArrowLeft' || e.key == 'a') {
		index > 0 ? index-- : null
		console.log(index)
	}

	if (e.key == 'ArrowDown') { rdown(); save() }
	if (e.key == 'ArrowUp') { rup(); save() }
	// if (e.key == 's' && e.shiftKey) {
	// 	console.log('switch')
	// }
	if (e.key == "S") right = !right
	if (e.key == 's') {
		ldown(); save()
	}
	if (e.key == 'w') { lup(); save() }
}

load()
