import * as Turtle from "./turtle";

export class Runner {
	constructor(private canvas: Turtle.TurtleCanvas, private current: Statement) {
	}
	
	step(): boolean {
		console.log(this.current);
		this.current = this.current.execute(this.canvas);
		return !!this.current;
	}
}

export abstract class Statement {
	children: Statement[] = [];
	parent: Statement;
	
    abstract execute(canvas: Turtle.TurtleCanvas): Statement;
	
	add(child: Statement): void {
		child.parent = this;
		this.children.push(child);
	}
}

export class Forward extends Statement {
	amount: number;
	
	execute(canvas: Turtle.TurtleCanvas): Statement {
		canvas.turtle.forward(this.amount);
		return this.parent;
	}
}

export class Turn extends Statement {
	angle: number;
	
	execute(canvas: Turtle.TurtleCanvas): Statement {
		canvas.turtle.turn(this.angle);
		return this.parent;
	}
}

export class Sequence extends Statement {
    current = 0;

    execute(canvas: Turtle.TurtleCanvas): Statement {
        if (this.current >= this.children.length) {
			this.current = 0;
            return this.parent;
        }
		return this.children[this.current++];
    }
}

export class Repeat extends Statement {
	times: number;
	count = 0;
	
	execute(canvas: Turtle.TurtleCanvas): Statement {
		if(this.children.length === 0) {
			return this.parent;
		}
        if (this.count >= this.times) {
			this.count = 0;
            return this.parent;
        }
		this.count++;
		return this.children[0];
    }
}

export class Reader {	
    readStatement(json: any): Statement {
        if (json.type === "forward") {
            return this.readForward(json);
        } else if (json.type === "turn") {
            return this.readTurn(json);
        } else if (json.type === "sequence") {
            return this.readSequence(json);
        } else if (json.type === "repeat") {
            return this.readRepeat(json);
        } else {
            throw new Error("unknown statement type " + json.type);
        }
    }
	
	readSequence(json: any): Sequence {
        const sequence = new Sequence();
        json.statements.forEach((jsonStmt: any) => sequence.add(this.readStatement(jsonStmt)));
        return sequence;
    }

	readRepeat(json: any): Repeat {
        const repeat = new Repeat();
		repeat.times = json.times;
        repeat.add(this.readStatement(json.statement));
        return repeat;
    }

    readForward(json: any): Forward {
        const forward = new Forward();
		forward.amount = json.amount;
        return forward;
    }
	
	readTurn(json: any): Turn {
        const turn = new Turn();
		turn.angle = json.angle;
        return turn;
    }	
}