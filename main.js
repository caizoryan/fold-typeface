import PDFDocument  from 'pdfkit'
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
		.fillColor([100,100,100,100])
		.text(`This insert also illustrates how the colors white and black interact with each other on orange paper. My hope is that this test print works...`, inch(2), inch(1.5), {width: inch(3),height: inch(7)})

	doc
		.fontSize(12)
		.opacity(1)
		.fillColor([0,0,100,0])
		.text(`But also thinking about how I can make this other colors and test out that stuff.`, inch(2), inch(4), {width: inch(3),height: inch(2)})

	for (let i = inch(4); i < inch(9); i += size/4 + gap/4) {
		for (let j = inch(2); j < inch(5); j += size/4 + gap/4) {
			if (Math.random() > 0.4) continue

			let rotation = Math.random() * 10 + 15
			let x = i + 5
			let y = j + 2
			let opacity = Math.random()

			doc
				.save()
				.rotate(rotation, { origin: [i - 5 + 20, j - 2 + 20] })
				.circle(x, y, size/8, size/8)
				.lineWidth(2)
				.strokeOpacity(opacity)
				.stroke([Math.random() * 100,0,100,0])
				.restore()

		}
	}
}
let cmykimages = (doc) => {
	doc.image('./image1.png', inch(7), inch(2), {width: inch(2)})
	doc.image('./image2.png', inch(1), inch(3), {width: inch(2)})
}
const doc = new PDFDocument({ layout: 'landscape' });

let inch = v => v * 72
doc.pipe(fs.createWriteStream('output.pdf'));
doc.addSpotColor('White', 0, 100, 0, 0)

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



funkyforms(doc)
// cmyktext(doc)
// cmykimages(doc)

// doc.addPage()

// doc.addPage()
// funkyforms(doc)


doc.end();

