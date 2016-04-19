const Path = require("path");

module.exports = {
	entry: Path.join(__dirname, "../lib/main/index.js"),
	devtool: "source-map",
	// cache: true,
	resolve: {
	},
	resolveLoader: { fallback: Path.join(__dirname, "..", "node_modules") },
	output: {
		path: Path.join(__dirname, "./"),
		publicPath: "/",
		filename: "lib/bundle.js"
	},
	devServer: {
		contentBase: "./"
	}
};
