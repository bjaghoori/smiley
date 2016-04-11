import * as Program from "../main/program";
import * as Turtle from "../main/turtle";
import * as Editor from "../main/editor";

const flower: any = {
  "type": "sequence",
  "statements": [
    {
      "type": "repeat",
      "times": 8,
      "statement": {
        "type": "sequence",
        "statements": [
	      {
	        "type": "forward",
		    "amount": 5
	      },
          {
            "type": "turn",
            "angle": 45
          },
          {
            "type": "repeat",
            "times": 18,
            "statement": {
              "type": "sequence",
              "statements": [
                {
                  "type": "forward",
                  "amount": 5
                },
                {
                  "type": "turn",
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

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const editor = <HTMLCanvasElement>document.getElementById("editor");
const run = <HTMLButtonElement>document.getElementById("run");

const program = new Program.Reader().readStatement(flower);

Editor.render(editor, program);

(<any>window).program = program;

run.onclick = () => {
	const turtleCanvas = new Turtle.TurtleCanvas(canvas, 5.0);
	const runner = new Program.Runner(turtleCanvas, program);
	
	function step(): void {
		if (runner.step()) {
			setTimeout(step, 5);
		}
	};
	
	step();
}
