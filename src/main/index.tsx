import * as Program from "../main/program";
import * as Turtle from "../main/turtle";
import * as Editor from "../main/editor";
import * as Actions from "../main/actions";

import * as Resources from "./i18n";

import * as React from "react";
import * as ReactDom from "react-dom";

import FLOWER from "../data/flower";

const EMPTY: any = {
	"type": "Sequence",
	"statements": []
};

/*
const trails = <HTMLCanvasElement>document.getElementById("trails");
const turtle = <HTMLCanvasElement>document.getElementById("turtle");

const editor = <HTMLCanvasElement>document.getElementById("editor");
const actions = <HTMLCanvasElement>document.getElementById("actions");
*/

interface AppProps {
	onChange: () => void;
	onCanvasReady: (canvas: Turtle.TurtleCanvas) => void;
}
interface AppState {
	program: Program.Statement;
	turtleCanvas: Turtle.TurtleCanvas;
	runner: Program.Runner;
	timer?: number;
}
class App extends React.Component<AppProps, AppState> implements Actions.ActionListeners {
	
	load(json: any): void {
		const program = Program.readStatement(json);

		this.setState({
			program: program,
			runner: new Program.Runner(program),
			turtleCanvas: new Turtle.TurtleCanvas(
				ReactDom.findDOMNode(this.refs["trails"]) as HTMLCanvasElement,
				ReactDom.findDOMNode(this.refs["turtle"]) as HTMLCanvasElement,
				5.0)
		});
		
		//onChange = () => Editor.render(editor, program, runner);
		program.structureChangeListener = () => {
			this.props.onChange();
		};
	}

	init(): void {
		this.state.program.reset();
		this.state.runner.reset();
	}

	stepCompactingSequences(): boolean {
		if(this.state.runner.finished()) {
			this.init();
		}
		
		let result: boolean;
		do {
			result = this.state.runner.step(this.state.turtleCanvas);
		} while (!this.state.runner.finished() && this.state.runner.current instanceof Program.Sequence);
		return result;
	}
	
	onRun(): void {
		if(this.state.runner.finished()) {
			this.init();
		}
		const step = () => {
			if (this.stepCompactingSequences()) {
				this.state.timer = setTimeout(step, 10);
			}
		};
		step();
	}
	
	onStop(): void {
		clearTimeout(this.state.timer);
		this.state.timer = undefined;
	}
	
	onStep(): void {
		if(this.state.runner.finished()) {
			this.init();
		}
		this.stepCompactingSequences();
		this.props.onChange();
	}
	
	onLoad(f: any): void {
		this.load(JSON.parse(f));
	}
	
	onSave(): string {
		return JSON.stringify(Program.writeStatement(this.state.program));
	}
	
	componentDidMount(): void {
		this.load(FLOWER);
	}
	
	render(): React.ReactElement<any> {
		let editor: React.ReactElement<any>;
		let actions: React.ReactElement<any>;
		if (this.state) {
			editor = <Editor.Editor statement={this.state.program} runner={this.state.runner}/>;
			actions = <Actions.Actions listeners={this}/>;
		}
		return <div>
			{editor}
			{actions}			

			<canvas ref="trails" width="600" height="500" style={{"display": "block"}}/>
			<canvas ref="turtle" width="600" height="500" style={{"display": "block", "position": "relative", "top": "-500px"}}/>
		</div>
	}
}

function render(): void {
	ReactDom.render(
	React.createElement(App, {
		onChange: () => render()
	}),
	document.getElementById("app"));
};

Resources.setLanguage("de");

render();
