import PDFDocument from 'pdfkit'
import fs from 'fs'

let size = 40
let gap = 10
let funkyforms = (doc) => {
	for (let i = inch(1); i < inch(6); i += size + gap) {
		for (let j = inch(3); j < inch(7); j += size + gap) {
			if (Math.random() > 0.5) continue

			let rotation = Math.random() * 10 + 15
			let x = i - 5
			let y = j - 2
			let opacity = Math.random()

			doc
				.save()
				.rotate(rotation, { origin: [i - 5 + 20, j - 2 + 20] })
				.rect(x, y, size, size)
				.strokeOpacity(opacity)
				.stroke('White')
				.restore()

			doc
				.fontSize(7)
				.fillColor('White', .6)
				.text("(( " + Math.floor(opacity * 100) + "% ))", x + 5, y + 5, { lineBreak: false })
		}
	}

	doc
		.save()
		.circle(inch(7), inch(3), inch(1.8))
		.dash(5, { space: 10 })
		.stroke('White')
		.restore()

	doc
		.save()
		.circle(inch(5), inch(5.8), inch(.8))
		.dash(5, { space: 10 })
		.lineWidth(3)
		.stroke('White')
		.restore()

	doc
		.save()
		.circle(inch(2.3), inch(5.4), inch(.5))
		.dash(5, { space: 10 })
		.lineWidth(5)
		.stroke('White')
		.restore()

	doc
		.moveTo(inch(4.5), inch(1))
		.lineTo(inch(4), inch(7))
		.lineWidth(3)
		.stroke('White')

	doc
		.moveTo(inch(8), inch(1))
		.lineTo(inch(6), inch(5))
		.lineWidth(5)
		.stroke('White')


	doc
		.moveTo(inch(10), inch(1))
		.lineTo(inch(7), inch(4))
		.lineWidth(8)
		.stroke('White')



}
let cmyktext = (doc) => {
	doc
		.fontSize(12)
		.opacity(1)
		.fillColor([100, 100, 100, 100])
		.text(`This insert also illustrates how the colors white and black interact with each other on orange paper. My hope is that this test print works...`, inch(2), inch(1.5), { width: inch(3), height: inch(7) })

	doc
		.fontSize(12)
		.opacity(1)
		.fillColor([0, 0, 100, 0])
		.text(`But also thinking about how I can make this other colors and test out that stuff.`, inch(2), inch(4), { width: inch(3), height: inch(2) })

	for (let i = inch(4); i < inch(9); i += size / 4 + gap / 4) {
		for (let j = inch(2); j < inch(5); j += size / 4 + gap / 4) {
			if (Math.random() > 0.4) continue

			let rotation = Math.random() * 10 + 15
			let x = i + 5
			let y = j + 2
			let opacity = Math.random()

			doc
				.save()
				.rotate(rotation, { origin: [i - 5 + 20, j - 2 + 20] })
				.circle(x, y, size / 8, size / 8)
				.lineWidth(2)
				.strokeOpacity(opacity)
				.stroke([Math.random() * 100, 0, 100, 0])
				.restore()

		}
	}
}
let cmykimages = (doc) => {
	doc.image('./image1.png', inch(7), inch(2), { width: inch(2) })
	doc.image('./image2.png', inch(1), inch(3), { width: inch(2) })
}
const doc = new PDFDocument({ layout: 'landscape' });


let inch = v => v * 72
doc.pipe(fs.createWriteStream('cover.pdf'));
// doc.addSpotColor('White', 0, 100, 0, 0)
// doc.addSpotColor('NeonY', 0, 0, 100, 0)
doc.addSpotColor('Silver', 20, 0, 0, 40)


doc
	.rect(0, 0, inch(11), inch(6.5))
	.fill('Silver')


for (let x = inch(0); x < inch(11); x += inch(.45)) {
	for (let y = inch(6.4); y < inch(11); y += inch(.45)) {
		Math.random() > .7 ?
			doc.rect(x, y, inch(Math.random()+.5), inch(Math.random()+.2))
			.fill('Silver'):null
	}
}

let rectCircles = (x, y, w, h, s) => {
	let off = 15 * s
	doc.rect(x, y + off, w, h - off)
	doc.fill('white')

	for (let i = x; i < x + w; i += 5) {
		doc.circle(i, y, 1 * s)
		doc.circle(i + 3 * s, y + 5 * s, 2 * s)
		doc.circle(i, y + 11 * s, 3 * s)
		doc.fill('white')

		doc.circle(i + 3 * s, y + 14 * s, 2 * s)
		doc.fill('white')
		// doc.stroke('white')
	}

	for (let i = x; i < x + w; i += 5) {
		doc.circle(i, y + 14 * s + h, 1 * s)
		doc.circle(i + 3 * s, y + 10 * s + h, 2 * s)
		doc.circle(i, y + 4 * s + h, 3 * s)
		doc.fill('white')

		doc.circle(i + 3 * s, y + h, 2 * s)
		doc.fill('white')
		// doc.stroke('black')
	}

}

doc.addPage()
let ind = .6
for (let i = inch(-1); i < inch(4.5); i += inch(.65)) {
	for (let o = 0; o < inch(11); o += inch(2)) {
		rectCircles(o, i + (o / 32), inch(2), inch(.4), ind)
	}
	ind += .05
}

doc
	.font('./font.ttf')
	.fontSize(38)
	.fillColor('white')
	.text("FOLDINATOR", inch(6.5), inch(5.25))

let blackbgtext = (text, x, y) => {
	doc
		.rect(x, y, doc.widthOfString(text), doc.heightOfString(text))
		.fill('black')
		.fillColor('white')
		.text(text, x, y, {lineBreak: false})
}

// doc.addPage()
doc.fontSize(9)

doc.fontSize(24)
blackbgtext('DIAGRAMS', inch(8), inch(6.4))
blackbgtext('TOOLS', inch(7.3), inch(6.7))
blackbgtext('ALGORITHMS', inch(.4), inch(6.6))
blackbgtext('INTERFACES', inch(6.3), inch(7.7))

doc.fontSize(18)
blackbgtext('SPOT COLOR', inch(4.3), inch(6.7))
blackbgtext('PORTABLE DOCUMENT FORMAT', inch(1.3), inch(7.2))
blackbgtext('JAVASCRIPT', inch(.5), inch(7.7))

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



