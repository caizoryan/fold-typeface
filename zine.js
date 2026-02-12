import PDFDocument from 'pdfkit'
import fs from 'fs'
import { Grid } from './grid.js';

let inch = v => v * 72
let xCount = 12


let front = {
	fontSize: 28,
	font: './monument_mono_bold.otf',
	fillColor: [0, 0, 0, 100],
}

let title = {
	fontSize: 8,
	font: './font.ttf',
	fillColor: [0, 0, 0, 50],
}

let body = {
	fontSize: 8,
	font: './_font.ttf',
	fillColor: [0, 0, 0, 80],
}

let tag = {
	fontSize: 7,
	fillColor: '#000',
	font: './monument_mono_medium.otf'
}

let line = (doc, x1, y1, x2, y2, strokeColor = 'black', strokeWeight = 1, dash) => {
	doc.save()
	doc.lineWidth(strokeWeight)

	doc.moveTo(x1, y1)                               // set the current point
		.lineTo(x2, y2)                            // draw a line

	dash ? doc.dash(dash) : null
	doc.stroke(strokeColor);                                   // stroke the path
	doc.restore()
}
let metadata = (doc, block, dims) => {
	let { x, y, width, height } = dims

	line(doc, x, y - inch(.125), x + width, y - inch(.125), [0, 100, 0, 0], .1)

	Object.entries(tag).forEach(([k, v]) => doc[k](v))
	doc.text('TITLE:', x, y, { width })
	y += inch(.125)

	Object.entries(title).forEach(([k, v]) => doc[k](v))
	doc.text(block.title, x, y, { width })
	y += inch(.33)

	Object.entries(tag).forEach(([k, v]) => doc[k](v))
	doc.text('ADDED:', x, y, { width })
	y += inch(.125)

	Object.entries(title).forEach(([k, v]) => doc[k](v))
	doc.text(block.created_at, x, y, { width })
}

let block = (doc, block, dims) => {
	let { x, y, width, height } = dims
	doc.image("./images/" + block.id + ".jpg", x, y, { width })
	metadata(doc, block, { x, y: y - inch(1.5), width })
}

let grid = new Grid({
	margin: {
		top: inch(1),
		bottom: inch(1 / 2),
		inside: inch(1 / 3),
		outside: inch(1 / 2),
	},

	gutter: inch(.125),
	columns: 10,
	hanglines: [
		inch(1),
		inch(1 + 2 / 3),
		inch(2),
		inch(2 + 2 / 3),
		inch(3),
		inch(3 + 2 / 3),

		inch(4),
		inch(4 + 2 / 3),

		inch(5),
		inch(5 + 2 / 3),
	],

	spread_width: inch(10),
	spread_height: inch(8),

	page_width: inch(11),
	page_height: inch(8.5)
})

let draw_grid = (doc, grid) => {
	let [recto, verso] = grid.columns()

	let strokeWeight = .1
	let strokeColor = [10, 0, 0, 0]

	doc.lineWidth(strokeWeight)
	doc.strokeColor(strokeColor)

	grid.hanglines().forEach(e => {
		drawLineDocFn({
			points: [{ x: 0, y: e }, { x: grid.props.page_width, y: e }],
			stroke: [100, 0, 0, 0],
			strokeWeight: .1,
		})(doc)

	})

	recto.forEach((col) => {
		doc.rect(col.x, col.y, col.w, col.h)
		doc.stroke()
	})

	verso.forEach((col) => {
		doc.rect(col.x, col.y, col.w, col.h)
		doc.stroke()
	})
}

let basic = (doc) => {
	stylesheet(doc, front)
	doc.text("BEING SURVEILLED", 50, inch(4))
	line(doc, 10, 10, 150, 10)
}

let width = inch(3 / 4)
let miniLines = (doc, x, y, end, step) => {
	for (; y < end; y += step) {
		line(doc, x, y, x + width, y, [50, 0, 0, 0], .5)
	}
}
let strip = (doc, x) => {
	line(doc, x, 0, x, inch(11))
	line(doc, x + width, 0, x + width, inch(11))
	let c = 0
	for (let y = 0; y < inch(11); y += inch(1 / 2)) {
		line(doc, x, y, x + inch(3 / 4), y, [0, 100, 0, 0], 1)
		miniLines(doc, x, y, y + inch(1 / 2), inch(1 / 10))
		doc.fontSize(10.5)
		let t = (c * 10) + ""
		let w = doc.widthOfString(t)
		doc.rect(x + inch(1 / 4), y - 3, w, 6)
		doc.fill('white')

		doc.fillColor('black')
		doc.text(t, x + inch(1 / 4), y - 3, { width: 100, height: 100 })

		c++
	}
	// line(doc, x, x, x + inch(3 / 4), x)
}

let blankpage = (doc) => { }
let stylesheet = (doc, t) => Object.entries(t).forEach(([k, v]) => doc[k](v))

let page_number = 1

let spreads = []

let v = (x, y) => ({ x, y })
let vdup = v => ({ x: v.x, y: v.y })

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

function letter(
	x, y, w, h,
	code, transforms,
	color = 'blue', annotate = false,
	fill = [100, 0, 0, 0],
	boxDraw = true
) {
	let mainrect = [
		v(x, y),
		v(x + w, y),
		v(x + w, y + h),
		v(x, y + h)
	]

	let points = []

	let baselines = []
	code.forEach(points => {
		baselines.push([
			v(x, y + points[0]),
			v(x + w, y + points[1])
		])
	})

	baselines.push([vdup(mainrect[3]), vdup(mainrect[2])])
	let lines = baselines
	function rotateVector(vector, center, angleDeg) {
		const angleRad = angleDeg * (Math.PI / 180);

		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);

		// Translate point to origin
		const dx = vector.x - center.x;
		const dy = vector.y - center.y;

		// Rotate
		const rotatedX = dx * cos - dy * sin;
		const rotatedY = dx * sin + dy * cos;

		// Translate back
		return {
			x: rotatedX + center.x,
			y: rotatedY + center.y
		};
	}

	if (transforms.rotate) {
		lines = lines.map(([a, b]) => {
			let pointA = rotateVector(a, { x, y }, transforms.rotate[0])
			let pointB = rotateVector(b, { x, y }, transforms.rotate[0])

			return [pointA, pointB]
		})

		mainrect = mainrect.map(e => rotateVector(e, { x, y }, transforms.rotate[0]))
	}

	let spread = []
	let _index = 0

	let firstQuad = [
		vdup(mainrect[0]),
		vdup(mainrect[1]),
		lines[0][1],
		lines[0][0]
	]

	points.push(firstQuad)

	spread.push(doc => {
		doc.save()
		Object.entries(transforms).forEach(([key, value]) => {
			if (!Array.isArray(value)) return
			if (key == 'rotate') { }
			//doc[key](...value, { origin: [x, y] })
			else doc[key](...value)
		})
	})


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


		points.push(f)

		_index++
	}

	let box = getBounds(points.flat())

	let random = (num) => (Math.random() * (Math.random > .5 ? 1 : -1)) * num
	let diffX = x - box.x //+ random(35)
	let diffY = y - box.y //+ random(35)


	points.forEach(quad => {
		let _quad = quad.map(e => {
			e.x = e.x + diffX
			e.y = e.y + diffY
			return e
		})

		spread.push((doc) => {
			drawQuadDocFn(
				{
					lineJoin: 'round',
					points: _quad, fill: fill, stroke: color, strokeWeight: 1
				})(doc)
		})

	})

	let padding = 25
	spread.push(doc => {
		// line(doc, box.x + diffX, box.y + diffY + box.height + padding, box.x + diffX + box.width, box.y + diffY + box.height + padding)
		if (boxDraw) {
			doc.rect(box.x + diffX - padding,
				box.y - padding + diffY,
				box.width + padding * 2,
				box.height + padding * 2)
			doc.lineWidth(.2)
			doc.save()
			doc.dash(5).stroke([50, 0, 0, 0])


			doc.restore()
		}

		if (annotate) {
			doc.text(points.length - 1 + ". ",
				box.x,
				box.y + box.height + diffY
			)
		}
	})

	spread.push(doc => {
		doc.restore()
	})

	return spread
}


let nx = 120
let ny = 80
let nw = 15
let nh = 220
function getBounds(points) {
	if (!points.length) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;

	for (const p of points) {
		if (p.x < minX) minX = p.x;
		if (p.x > maxX) maxX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.y > maxY) maxY = p.y;
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}

function foldSchematic(x, y, w, h, points) {
	return (doc) => {
		doc.save()
		// doc.translate(inch(1), inch(2))
		// doc.rotate(-90, { origin: [x, y] })
		// doc.text(x, y, w, h).stroke('red')
		doc.rect(x, y, w, h).fillAndStroke([50, 0, 0, 0], 'black')
		doc.font(tag.font)
		points.forEach(e => {
			doc.fontSize(6)
			let bounds = doc.boundsOfString(e[0] + "", { lineBreak: false })
			doc.undash()
			doc.lineWidth(.1)
			let pad = 1
			doc.rect(x - 15 - pad, y + e[0] - pad, bounds.width + pad * 2, bounds.height + pad * 2)
				.fillAndStroke("white", 'black')
			doc.fillColor('black')
			doc.text(e[0] + "", x - 15, y + e[0], { lineBreak: false })

			bounds = doc.boundsOfString(e[1] + "", { lineBreak: false })
			doc.rect(x + w + 5 - pad, y + e[1] - pad, bounds.width + pad * 2, bounds.height + pad * 2)
				.fillAndStroke("white", 'black')
			doc.undash()
			doc.fillColor('black')
			doc.text(e[1] + "", x + w + 5, y + e[1], { lineBreak: false })

			doc.dash(3)
			line(doc, x, y + e[0], x + w, y + e[1])
		})
		doc.restore()
	}
}

function letterPage(code, transform = {}, dimensions = {
	width: nw,
	height: nh,
}) {
	let hangline = inch(6.5)
	let spread = [
		(doc) => {
			line(doc, 0, hangline, 900, hangline, 'black', .1, 3)
		}
	]

	let xOff = transform.xOff ? transform.xOff : 0

	let positions = [
		grid.verso_columns()[3].x,
		grid.verso_columns()[6].x,
		grid.recto_columns()[1].x,
		grid.recto_columns()[4].x,
		grid.recto_columns()[7].x,
	]
	let variable = [-3, -2, 0, 2, 3].forEach((e, i) => {
		let itemX = positions[i]
		// nx + xOff + i * 140

		spread.push(doc => {
			doc.fillOpacity(.9)
			doc.rect(itemX - 23, inch(1.25), 95, 450)
				.fillAndStroke('white', 'black')
		})
		let itemsDawg = letter(
			itemX, hangline, dimensions.width + e, dimensions.height, code, {
			...transform,
		}, 'black', false, [90, 15, 0, 0], false)

		spread.push(
			foldSchematic(
				itemX + 14,
				grid.hanglines()[1],
				dimensions.width + e,
				dimensions.height,
				code),
		)

		itemsDawg.forEach(e => spread.push(e))

	})

	return spread
}
function letterPageAndGraphics(code, title = "UPPERCASE", transform = {}, dimensions = {
	width: nw,
	height: nh,
}) {
	return [
		(doc) => draw_grid(doc, grid),
		...letterPageGraphic(code, transform, dimensions),
		...letterPage(code, transform, dimensions),
		(doc) => {
			doc.rect(
				grid.verso_columns()[0].x,
				grid.hanglines()[7],
				grid.column_width(6),
				inch(1.3)
			).fillAndStroke("white", 'black')

			doc.fillColor("black")
			let leading = 9
			let line = (num) => grid.hanglines()[8] + 8 + (num * leading)
			doc.fontSize(10.5)
			doc.font('./monument_mono_bold.otf')
			doc.text(title, grid.verso_columns()[1].x, grid.hanglines()[8])
			doc.font('./monument_mono_regular.otf')
			doc.fontSize(7)
			doc.text("HEIGHT: " + dimensions.height, grid.verso_columns()[1].x, line(1))
			doc.text("FOLDS: " + code.length, grid.verso_columns()[1].x, line(2))
		},
	]
}

function letterPageGraphic(code, transform = {}, dimensions = {
	width: nw,
	height: nh,
}) {
	let spread = []

	let xOff = transform.xOff ? transform.xOff : 0
	let yOff = transform.yOff ? transform.yOff : 0
	let ySpacing = 135
	let xSpacing = 135
	let scale = 1

	code.forEach((e, i) => {
		let t = { ...transform, scale: [scale, { origin: [nx + xOff + (i * 130), ny + yOff + 130] }] }
		let items = letter(nx + xOff + (i * xSpacing), ny + yOff, dimensions.width, dimensions.height,
			code.slice(0, i + 1), t, [0, 0, 0, 45], true, [10, 0, 0, 0], false)
		items.forEach(e => spread.push(e))
	})

	code.forEach((e, i) => {
		spread.push((doc) => doc.opacity((i / 10) + .5))
		let t = { ...transform, scale: [scale, { origin: [nx + xOff + (i * 130), ny + yOff + 130] }] }
		let items = letter(nx + xOff + (i * xSpacing), ny + yOff + ySpacing,
			dimensions.width + 2, dimensions.height,
			code.slice(0, i + 1), t,
			[0, 0, 0, 50], false, [0, 0, 30, 0], false)
		items.forEach(e => spread.push(e))
	})

	code.forEach((e, i) => {
		let t = { ...transform, scale: [scale, { origin: [nx + xOff + (i * 130), ny + yOff + 130] }] }
		spread.push((doc) => doc.opacity((i / 10) + .5))
		let items = letter(nx + xOff + (i * xSpacing), ny + yOff + ySpacing * 2,
			dimensions.width - 2, dimensions.height,
			code.slice(0, i + 1), t,
			[0, 0, 0, 50], false, [0, 0, 30, 0], false)
		items.forEach(e => spread.push(e))
	})


	return spread
}

let upperCaseG = [
	[12, 27],
	[68, 54],
	[114, 130],
	[174, 160],
	[190, 205],
]

let upperCaseE = [
	[56, 42],
	[100, 116],
	[156, 156],
	[214, 198],
	[226, 242],
]

let upperCaseE2 = [
	[38, 54],
	[82, 68],
	[101, 101],
	[135, 135],
	[150, 137],
	[178, 164],
]

let upperCaseF = [
	[35, 48],
	[84, 68],
	[110, 110],
	[150, 134],
	[178, 178],
]

let upperCaseF2 = [
	[46, 31],
	[58, 73],
	[110, 110],
	[162, 148],
]

let upperCaseB = [
	[60, 75],
	[107, 92],
	[122, 138],
	[168, 168],
	[190, 206],
	[228, 214],
]

let upperCaseA = [
	[68, 72],
	[143, 143],
	[178, 158],
]

let upperCaseB2 = [
	[74, 66],
	[103, 113],
	[128, 140],
	[171, 176],
]

let upperCaseC = [
	[46, 28],
	[50, 76],
	[120, 105],
	[140, 162],
]


spreads.push(letterPageAndGraphics(upperCaseG,
	"UPPERCASE G",
	{
		yOff: 125,
		// xOff: 40,
		rotate: [180],
	}))

spreads.push(letterPageAndGraphics(upperCaseF,
	"UPPERCASE F",
	{
		// yOff: -30,
		rotate: [90],
	}))

spreads.push(letterPageAndGraphics(upperCaseB2,
	"UPPERCASE B [VARIATION]",
	{
		// yOff: -30,
		rotate: [180],
	}))

spreads.push(letterPageAndGraphics(upperCaseC,
	"",
	{
		// yOff: -30,
		rotate: [45],
	}, {
	width: nw,
	height: 167,
}))

spreads.push(letterPageAndGraphics(upperCaseE,
	"", {
	// yOff: 90,
	// xOff: 40,
	rotate: [90],
}, {
	width: nw,
	height: 268,
}))

spreads.push(letterPageAndGraphics(upperCaseF2,
	"", {

	rotate: [90],
	// yOff: -30,
}))

spreads.push(letterPageAndGraphics(upperCaseE2,
	"", {

	// yOff: 90,
	// xOff: 10,
	rotate: [90],
},))

spreads.push(letterPageAndGraphics(upperCaseA,
	"", {

	// yOff: 90,
	// xOff: 40,
	rotate: [168],
}))

spreads.push(letterPageAndGraphics(upperCaseB,
	"", {

	// yOff: -30,
	// rotate: [90],
	// translate: [150, 0]
}, {
	width: nw,
	height: 252,
}))



let signature1 = spreads.slice(0, spreads.length / 4)
let signature2 = spreads.slice(spreads.length / 4 - 1, (spreads.length / 4) * 2 - 1)
let signature3 = spreads.slice((spreads.length / 4) * 2 - 2, (spreads.length / 4) * 3 - 2)
let signature4 = spreads.slice((spreads.length / 4) * 3 - 3)

let writeSpreads = (spreads, filename) => {
	const doc = new PDFDocument({ layout: 'landscape' });
	doc.pipe(fs.createWriteStream(filename));

	spreads.forEach((spread, i) => {

		doc.save()
		doc.scale(.95, { origin: [inch(5.5), inch(4.25)] })
		spread.forEach(item => {
			item(doc)
		})
		doc.restore()
		if (i != spreads.length - 1) doc.addPage()
	})

	doc.end();
}

let recto_image = (doc, spread, spreads) => {
	doc
		.save()
		.rect(inch(5.5), 0, inch(5.5), inch(8.5))
		.clip()
	spreads[spread].forEach(item => {
		item(doc)
	})
	doc.restore()
}
let verso_image = (doc, spread, spreads) => {
	doc
		.save()
		.rect(0, 0, inch(5.5), inch(8.5))
		.clip()

	spreads[spread].forEach(item => {
		item(doc)
	})

	doc.restore()
}

let pageImage = (doc, spreadNum, spreads) => {
	let spread = Math.floor(spreadNum / 2)
	return spreadNum % 2 == 1
		? recto_image(doc, spread, spreads)
		: verso_image(doc, spread, spreads)
}

let pages = (spreadcount) => {
	if (spreadcount % 2 == 1) {
		return Array(spreadcount).fill(undefined)
			.reduce((acc, _, i) =>
				(acc.push([i * 2, i == spreadcount - 1 ? 0 : i * 2 + 1]), acc), [])
	}

	else console.log("FUCK NOT MULTIPLE OF 4", (spreadcount * 2) - 2)
}
let imposedPages = (pagesArray) => {
	let spreadCount = pagesArray.length
	if (spreadCount % 2 != 1) {
		console.error("FUCK NOT MULTIPLE OF 4", (spreadCount * 2) - 2)
	}
	// get pages
	let last = pagesArray.length - 1
	let pair = (i) => pagesArray[last - i]
	let pairskiplast = (i) => pagesArray[last - i - 1]

	let middle = Math.ceil(last / 2)

	// switch each recto with pair spread recto till middle
	for (let i = 0; i < middle; i++) {
		let f_verso = pagesArray[i][0]
		let p_verso = pair(i)[0]

		pagesArray[i][0] = p_verso
		pair(i)[0] = f_verso
	}

	let pairedup = []

	// pair spreads up with each other
	for (let i = 0; i < middle; i++) {
		pairedup.push(pagesArray[i])
		pairedup.push(pairskiplast(i))
	}

	return pairedup
}


let drawCircleDocFn = (props) => (doc) => {
	doc.save();
	if (props.strokeWeight) doc.lineWidth(props.strokeWeight);
	let x = props.x ? props.x : 0;
	let y = props.y ? props.y : 0;
	doc.circle(x, y, props.radius ? props.radius : 5);
	if (props.stroke && props.fill) doc.fillAndStroke(props.fill, props.stroke);
	else {
		if (props.stroke) doc.stroke(props.stroke);
		if (props.fill) doc.fill(props.fill);
	}

	doc.restore();
};

let availableFonts = ["Times-Roman", "hermit", tag.font, title.font, './marist.ttf', './monument_mono_regular.otf'];

let drawTextDocFn = (props) => (doc) => {
	doc.save();
	let x = props.x;
	let y = props.y;
	let width = props.width ? props.width : 100;
	let height = props.height ? props.height : 100;
	let text = props.text;
	let fontSize = props.fontSize ? props.fontSize : 12;
	let fontFamily = props.fontFamily;
	// let stroke = props.stroke ? true : false;

	if (props.fill) doc.fillColor(props.fill);
	if (fontFamily && availableFonts.includes(fontFamily)) doc.font(fontFamily);
	// if (props.stroke) doc.stroke(props.stroke);
	doc.fontSize(fontSize);
	doc.text(text, x, y, { width, height });

	if (props.boundingBox) {
		doc.rect(x, y, width, height);
		doc.lineWidth(props.boundingBox);
		doc.stroke();
	}
	// if (props.stroke && props.fill) doc.fillAndStroke(props.fill, props.stroke);

	doc.restore();
};

let drawImageDocFn = (props) => (doc) => {
	// return;
	doc.save();
	let x = props.x;
	let y = props.y;
	let image = props.image;

	let width = props.width ? props.width : 100;

	if (!props.image) return;
	if (props.fill) doc.fillColor(props.fill);
	// if (props.stroke) doc.stroke(props.stroke);
	doc.image(image, x, y, { width });
	// if (props.stroke && props.fill) doc.fillAndStroke(props.fill, props.stroke);
	// else {
	// }

	doc.restore();
};

let drawImageCanvasFn = (props) => (ctx, canvas) => {
	let x = props.x;
	let y = props.y;
	let image = props.image;

	let width = props.width ? props.width : 100;

	if (!props.image) return;
	if (props.fill) doc.fillColor(props.fill);
	const ratio = img.height / img.width;
	const targetHeight = targetWidth * ratio;

	canvas.width = targetWidth;
	canvas.height = targetHeight;

	ctx.drawImage(img, x, y, targetWidth, targetHeight);
};

let drawLineDocFn = (props) => (doc) => {
	let points = props.points;
	if (props.points.length < 2) return;
	if (props.strokeStyle) doc.dash(props.strokeStyle[0])
	if (props.lineCap) doc.lineCap(props.lineCap)
	if (props.lineJoin) doc.lineJoin(props.lineJoin)
	// let start = points[0];
	// let x1 = start.x;
	// let y1 = start.y;
	//
	// let end = points[1];
	// let x2 = end.x;
	// let y2 = end.y;

	doc.save();
	doc.lineWidth(props.strokeWeight);
	doc.moveTo(points[0].x, points[0].y);
	points.slice(1).filter((e) =>
		e != undefined &&
		typeof e == "object"
	).forEach(
		(e) => doc.lineTo(e.x, e.y),
	);
	// .lineTo(x2, y2);
	if (props.stroke) doc.stroke(props.stroke);
	doc.restore();
};

let drawQuadDocFn = (props) => (doc) => {
	let points = props.points;
	if (props.points.length < 2) return;
	if (props.strokeStyle) doc.dash(props.strokeStyle[0])
	if (props.lineCap) doc.lineCap(props.lineCap)
	if (props.lineJoin) doc.lineJoin(props.lineJoin)
	// let start = points[0];
	// let x1 = start.x;
	// let y1 = start.y;
	//
	// let end = points[1];
	// let x2 = end.x;
	// let y2 = end.y;

	doc.save();
	doc.lineWidth(props.strokeWeight);
	doc.polygon(...props.points.slice(0, 4).map((p) => [p.x, p.y]))

	// .lineTo(x2, y2);
	if (props.stroke && props.fill) doc.fillAndStroke(props.fill, props.stroke);
	else if (props.stroke) doc.stroke(props.stroke);
	else if (props.fill) doc.fill(props.fill);
	doc.restore();
};

let drawRectDocFn = (props) => (doc) => {
	doc.save();
	if (props.strokeWeight) doc.lineWidth(props.strokeWeight);
	let x = props.x ? props.x : 0;
	let y = props.y ? props.y : 0;
	let width = props.width ? props.width : 0;
	let height = props.height ? props.height : 0;
	doc.rect(x, y, width, height);
	if (props.strokeStyle) doc.dash(props.strokeStyle[0])
	if (props.stroke && props.fill) doc.fillAndStroke(props.fill, props.stroke);
	else {
		if (props.stroke) doc.stroke(props.stroke);
		if (props.fill) doc.fill(props.fill);
	}

	doc.restore();
};

let runa = (doc, drawables) => {
	let fns = {
		"Circle": drawCircleDocFn,
		"Text": drawTextDocFn,
		"Image": drawImageDocFn,
		"Rect": drawRectDocFn,
		"Line": drawLineDocFn,
		"Group": (props) => (doc) => {
			let drawables = props.draw ? props.draw : [];

			drawables.forEach((fn) => {
				if (!fn) return;
				typeof fns[fn[0]] == "function"
					? fns[fn[0]](fn[1])(doc)
					: console.log("ERROR: Neither a fn nor a key");
			});
		},
	};

	fns.Group({ draw: drawables })(doc);
}
let writeText = (text, x, y, width, height) => doc => {
}

let writeSignature = (signature, filename) => {
	const doc = new PDFDocument({ layout: 'landscape' });
	doc.pipe(fs.createWriteStream(filename));

	let pgs = pages(signature.length)
	let imposed_pages = imposedPages(pgs)
	imposed_pages.forEach(([v, r], i) => {
		pageImage(doc, v, signature)
		pageImage(doc, r, signature)
		if (i != imposed_pages.length - 1) doc.addPage()
	})

	doc.end();
}

let printing = false
if (printing) {
	writeSignature(signature1, 'zine_signature1.pdf')
	writeSignature(signature2, 'zine_signature2.pdf')
	writeSignature(signature3, 'zine_signature3.pdf')
	writeSignature(signature4, 'zine_signature4.pdf')
}
else writeSpreads(spreads, "test.pdf")

