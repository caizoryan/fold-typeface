import PDFDocument from 'pdfkit'
import fs from 'fs'

let inch = v => v * 72
const doc = new PDFDocument({ layout: 'landscape' });
doc.pipe(fs.createWriteStream('zinecover.pdf'));
let stylesheet = (doc, t) => Object.entries(t).forEach(([k, v]) => doc[k](v))

let front = {
	fontSize: 28,
	font: './monument_mono_bold.otf',
	fillColor: [0, 0, 0, 100],
}

stylesheet(doc, front)
let x = inch(6)
doc.text("BEING SURVEILLED", x, inch(4))
doc.fontSize(12)
doc.text("THE ARE.NA CHANNEL", x, inch(4.5))
doc.image("./climb.png", inch(.5), inch(6), { width: inch(3) })

doc.end();
