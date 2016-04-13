import * as Turtle from "./turtle";

export class Runner {
	constructor(private canvas: Turtle.TurtleCanvas, public current: Statement) {
	}
	
	step(): boolean {
		this.current = this.current.execute(this.canvas);
		return !!this.current;
	}
}

export interface ActionListener {
	(): void;
}

export abstract class Statement {
	children: Statement[] = [];
	parent: Statement;
	changeListener: ActionListener;
	
    abstract execute(canvas: Turtle.TurtleCanvas): Statement;
	
	add(child: Statement): void {
		child.parent = this;
		this.children.push(child);
		this.fireChange();
	}
	
	remove(child: Statement): void {
		child.parent = undefined;
		this.children = this.children.filter(c => c != child);
		this.fireChange();
	}
	
	detach(): void {
		this.parent.remove(this);
	}
	
	fireChange(): void {
		if(this.changeListener) {
			this.changeListener();
		} else if (this.parent) {
			this.parent.fireChange();
		}
	}
	
	reset(): void {
		this.children.forEach(c => c.reset());
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
	
	reset() {
		this.current = 0;
		super.reset();
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
	
	reset() {
		this.count = 0;
		super.reset();
	}
}

export interface StatementReader {
	(json: any): Statement;
}

export interface StatementWriter {
	(stmt: Statement): any;
}

export interface StatementType {
	read: StatementReader;
	write: StatementWriter;
}

const name = function(type: any): string {
	return type.constructor.name;
}

export const STATEMENT_TYPES: {[type: string]: StatementType} = {
	Forward: {
		"read": (json: any) => {
			const forward = new Forward();
			forward.amount = json.amount;
			return forward;
		},
		"write": (stmt: Forward) => {
			return {
				type: "forward",
				amount: stmt.amount
			}
		}
	},
	Turn: {
		"read": (json: any) => {
		const turn = new Turn();
		turn.angle = json.angle;
        return turn;
		},
		"write": (stmt: Turn) => {
			return {
				type: "turn",
				angle: stmt.angle
			}
		}	
	},
	Repeat: {
		"read": (json: any) => {
		const repeat = new Repeat();
		repeat.times = json.times;
        repeat.add(readStatement(json.statement));
        return repeat;
		},
		"write": (stmt: Repeat) => {
			return {
				type: "repeat",
				times: stmt.times,
				statement: stmt.children[0]
			}
		}
	},
	Sequence: {
		"read": (json: any) => {
		const sequence = new Sequence();
        json.statements.forEach((jsonStmt: any) => sequence.add(readStatement(jsonStmt)));
        return sequence;
		},
		"write": null	
	}
}

export const readStatement = (json: any): Statement => {
	const statementType = STATEMENT_TYPES[json.type];
	if(statementType === undefined) {
		throw new Error("unknown statement type " + json.type);
	}
	return statementType.read(json);
}

export const writeStatement = (stmt: Statement): any => {
	const statementType = STATEMENT_TYPES[name(stmt)];
	if(statementType === undefined) {
		throw new Error("unknown statement " + name(stmt));
	}
	return statementType.write(stmt);
}
