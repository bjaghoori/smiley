const Path = require("path");

module.exports = {
	entry: Path.join(__dirname, "../lib/devapp/devapp.js"),
	devtool: "source-map",
	// cache: true,
	resolve: {
	},
	resolveLoader: { fallback: Path.join(__dirname, "..", "node_modules") },
	output: {
		path: Path.join(__dirname, "./"),
		publicPath: "/devapp",
		filename: "bundle.js"
	},
	devServer: {
		contentBase: "./"
	}
};
