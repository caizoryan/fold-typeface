import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'pdf.js',
	output: {
		file: 'pdfkit.js',
		format: 'es'
	},
	plugins: [nodeResolve()]
};
