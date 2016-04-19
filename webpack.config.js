const Path = require("path");

module.exports = {
	entry: Path.join(__dirname, "./lib/main/index.js"),
	// cache: true,
	resolve: {
	},
	resolveLoader: { fallback: Path.join(__dirname, "node_modules") },
	output: {
		path: Path.join(__dirname, "./lib"),
		publicPath: "/",
		filename: "bundle.js"
	},
	devServer: {
		contentBase: "./"
	}
};
