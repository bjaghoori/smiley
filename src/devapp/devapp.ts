import * as Program from "../main/program";
import * as Turtle from "../main/turtle";
import * as Editor from "../main/editor";
import * as Actions from "../main/actions";

const flower: any = {
  "type": "Sequence",
  "statements": [
    {
      "type": "Repeat",
      "times": 8,
      "statement": {
        "type": "Sequence",
        "statements": [
	      {
	        "type": "Forward",
		    "amount": 5
	      },
          {
            "type": "Turn",
            "angle": 45
          },
          {
            "type": "Repeat",
            "times": 18,
            "statement": {
              "type": "Sequence",
              "statements": [
                {
                  "type": "Forward",
                  "amount": 5
                },
                {
                  "type": "Turn",
                  "angle": 20
                }
              ]
            }
          }
        ]
      }
    }
  ]
};

const trails = <HTMLCanvasElement>document.getElementById("trails");
const turtle = <HTMLCanvasElement>document.getElementById("turtle");

const editor = <HTMLCanvasElement>document.getElementById("editor");
const actions = <HTMLCanvasElement>document.getElementById("actions");

const program = Program.readStatement(flower);

let turtleCanvas: Turtle.TurtleCanvas;
let runner: Program.Runner;
init();

const onChange = () => Editor.render(editor, program, runner);
program.changeListener = onChange;
onChange();

function init(): void {
	program.reset();
	turtleCanvas = new Turtle.TurtleCanvas(trails, turtle, 5.0);
	runner = new Program.Runner(turtleCanvas, program);
}

function stepCompactingSequences(): boolean {
	let result: boolean;
	do {
		result = runner.step();	
	} while(runner.current && runner.current instanceof Program.Sequence);
	return result;
}

let timer: number;
Actions.render(
	actions,
	{
		onRun: () => {
			init();
			function step(): void {
				if (stepCompactingSequences()) {
					timer = setTimeout(step, 10);
				} else {
					runner = undefined;
				}
			};	
			step();
		},
		
		onStop: () => {
			clearTimeout(timer);
			//runner = undefined;
		},
		
		onStep: () => {
			if(!runner) {
				init();
			}
			if(!stepCompactingSequences()) {
				runner = undefined;
			}
			onChange();
		}
	}
);

(<any>window).program = program;
(<any>window).runner = runner;
