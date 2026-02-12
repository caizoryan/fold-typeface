import PDFDocument from 'pdfkit'
import fs from 'fs'

let size = 40
let gap = 10
const doc = new PDFDocument({ layout: 'landscape' });

let inch = v => v * 72
doc.pipe(fs.createWriteStream('cmyk.pdf'));
// doc.addSpotColor('NeonY', 0, 0, 100, 0)
// doc.addSpotColor('Silver', 20, 0, 0, 40)


// for (let x = inch(0); x < inch(6); x += inch(.45)) {
// 	for (let y = inch(0); y < inch(11); y += inch(.45)) {
// 		Math.random() > .7 ?
// 			doc.rect(x, y, inch(Math.random() + .5), inch(Math.random() + .2))
// 				.fill('Silver') : null
// 	}
// }

let rectCircles = (x, y, w, h, color = 'white', s = 1) => {
	let off = 15 * s
	// doc.circle(x, y + off, w, h - off)
	doc.fill(color)

	for (let i = x; i < x + w; i += 5) {
		doc.circle(i, y, 1 * s)
		doc.circle(i + 3 * s, y + 5 * s, 2 * s)
		doc.circle(i, y + 11 * s, 3 * s)
		doc.fill(color)

		doc.circle(i + 3 * s, y + 14 * s, 2 * s)
		doc.fill(color)
		// doc.stroke(color)
	}

	for (let i = x; i < x + w; i += 5) {
		doc.circle(i, y + 14 * s + h, 1 * s)
		doc.circle(i + 3 * s, y + 10 * s + h, 2 * s)
		doc.circle(i, y + 4 * s + h, 3 * s)
		doc.fill(color)

		doc.circle(i + 3 * s, y + h, 2 * s)
		doc.fill(color)
		// doc.stroke('black')
	}

}

// // doc.addPage()
let ind = .6
// for (let i = inch(-1); i < inch(4.5); i += inch(.75)) {
// 	rectCircles(-1, i, inch(4), inch(2), 'Silver', ind)
// 	ind += .05
// }

// for (let i = inch(-1); i < inch(4.5); i += inch(.75)) {
// 	for (let o = 0; o < inch(11); o += inch(.5)) {
// 		doc.circle(i, o, 15)
// 			.fill('NeonY')
// 	}
// 	ind += .05
// }

for (let i = inch(-1); i < inch(4); i += inch(.75*2)) {
	for (let o = 0; o < inch(11); o += inch(.5*2)) {
		doc.circle(i, o, 10.5)
			.opacity(Math.random() + .3)
			.fill([0, 100, 0, 0])

		doc
			.save()
			.rotate(Math.random() *2)
			.circle(i, o, 10.5)
			.opacity(Math.random() + .3)
			.fill([100, 0, 0, 0])
			.restore()
	}
}

for (let i = inch(5); i < inch(11); i += inch(.75)) {
	for (let o = 0; o < inch(11); o += inch(.5)) {
		doc.circle(i, o, 8.5)
			.opacity(Math.random() + .3)
			.fill([0, 100, 0, 0])

		// doc
		// 	.save()
		// 	.rotate(-Math.random())
		// 	.circle(i, o, 8.5)
		// 	.opacity(Math.random() + .5)
		// 	.fill('NeonY')
		// 	.restore()

		doc
			.save()
			.rotate(Math.random() )
			.circle(i, o, 6.5)
			.opacity(Math.random() + .3)
			.fill([100, 0, 0, 0])
			.restore()
	}
}

// doc
// 	.font('./font.ttf')
// 	.fontSize(38)
// 	.fillColor('white')
// 	.text("FOLDINATOR", inch(6.5), inch(5.25))

let blackbgtext = (text, x, y) => {
	doc
		.rect(x, y, doc.widthOfString(text), doc.heightOfString(text))
		.fill('black')
		.fillColor('white')
		.text(text, x, y, { lineBreak: false })
}

// doc.addPage()
doc.fontSize(9)

// doc.fontSize(24)
// blackbgtext('DIAGRAMS', inch(8), inch(6.4))
// blackbgtext('TOOLS', inch(7.3), inch(6.7))
// blackbgtext('ALGORITHMS', inch(.4), inch(6.6))
// blackbgtext('INTERFACES', inch(6.3), inch(7.7))

// doc.fontSize(18)
// blackbgtext('SPOT COLOR', inch(4.3), inch(6.7))
// blackbgtext('PORTABLE DOCUMENT FORMAT', inch(1.3), inch(7.2))
// blackbgtext('JAVASCRIPT', inch(.5), inch(7.7))

doc.end();

// for (let i = 0; i < 792; i += 50) {
// 	for (let j = 0; j < 612; j += 50) {

// 		let rotation = Math.random() * 10 + 15
// 		let x = i - 5
// 		let y = j - 2

// 		doc
// 			.save()
// 			.rotate(rotation, { origin: [i - 5 + 20, j - 2 + 20] })
// 			.rect(x, y, 40, 40)
// 			.strokeOpacity(Math.random()+.1)
// 			.stroke('White')
// 			.restore()

// 		doc
// 			.fontSize(7)
// 			.fillColor('White', Math.random()+.1)
// 			.text("X: " + x, x+5, y + 5, { lineBreak: false })
// 			.text("Y: " + y, x+5, y + 14, { lineBreak: false })
// 	}
// }



// funkyforms(doc)
// cmyktext(doc)
// cmykimages(doc)


// doc.addPage()
// funkyforms(doc)



