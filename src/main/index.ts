import * as Program from "../main/program";
import * as Turtle from "../main/turtle";
import * as Editor from "../main/editor";
import * as Actions from "../main/actions";

import FLOWER from "../data/flower";

const EMPTY: any = {
	"type": "Sequence",
	"statements": []
};

const trails = <HTMLCanvasElement>document.getElementById("trails");
const turtle = <HTMLCanvasElement>document.getElementById("turtle");

const editor = <HTMLCanvasElement>document.getElementById("editor");
const actions = <HTMLCanvasElement>document.getElementById("actions");

let program: Program.Statement;
let turtleCanvas: Turtle.TurtleCanvas;
let runner: Program.Runner;
let onChange: () => void;

load(FLOWER);

function load(json: any): void {
	program = Program.readStatement(json);
	turtleCanvas = new Turtle.TurtleCanvas(trails, turtle, 5.0);
	runner = new Program.Runner(turtleCanvas, program);
	
	onChange = () => Editor.render(editor, program, runner);
	program.structureChangeListener = onChange;
	onChange();
}

function init(): void {
	program.reset();
	runner.reset();
	turtleCanvas = new Turtle.TurtleCanvas(trails, turtle, 5.0);	
}

function stepCompactingSequences(): boolean {
	
	if(runner.finished()) {
		init();
	}
	
	let result: boolean;
	do {
		result = runner.step();
	} while (!runner.finished() && runner.current instanceof Program.Sequence);
	return result;
}

let timer: number;
Actions.render(
	actions,
	{
		onRun: () => {
			if(runner.finished()) {
				init();
			}
			function step(): void {
				if (stepCompactingSequences()) {
					timer = setTimeout(step, 10);
				}
			};
			step();
		},

		onStop: () => {
			clearTimeout(timer);
			timer = undefined;
		},

		onStep: () => {
			if(runner.finished()) {
				init();
			}
			stepCompactingSequences();
			onChange();
		},

		onLoad: (f: any) => {
			load(JSON.parse(f));
		},
		
		onSave: () => {
			return JSON.stringify(Program.writeStatement(program));
		}
	}
);

(<any>window).program = program;
(<any>window).runner = runner;
