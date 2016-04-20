/**
 * Turtle program model. Basically a tree of statements.
 */

import * as Turtle from "./turtle";

/**
 * Driver that executes the statements one after another.
 * Also keeps track of the current statement.
 */
export class Runner {
	
	public current: Statement;
	
	constructor(private canvas: Turtle.TurtleCanvas, private root: Statement) {
		this.current = root;
	}
	
	step(): boolean {
		this.current = this.current.execute(this.canvas);
		return !!this.current;
	}
	
	finished(): boolean {
		return this.current === undefined;
	}
	
	reset(): void {
		this.root.reset();
		this.current = this.root;
	}
}

export interface ActionListener {
	(): void;
}

/**
 * Base implementation of statements.
 */
export abstract class Statement {
	/** Generic list of sub-statements. Semantics depend on statement implementation. */
	children: Statement[] = [];
	
	/**
	 * Pointer to superordinate statement.
	 */
	parent: Statement;
	
	/** Listener for structural changes - only the root statement has one */
	structureChangeListener: ActionListener;
	
	/**
	 * Execute this statement and return the following statement.
	 */
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
		if(this.structureChangeListener) {
			this.structureChangeListener();
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

/** Json reader for a single statement. */
export interface StatementReader<T extends Statement> {
	(json: any): T;
}

/** Json writer for a single statement. */
export interface StatementWriter<T extends Statement> {
	(stmt: T): any;
}

/**
 * Definition of IO operations for a statement.
 */
export interface StatementIO<T extends Statement> {
	read: StatementReader<T>;
	write: StatementWriter<T>;
}

export class ForwardIO implements StatementIO<Forward> {
	read (json: any): Forward {
		const forward = new Forward();
		forward.amount = json.amount;
		return forward;
	}
	
	write (stmt: Forward): any {
		return {
			type: "Forward",
			amount: stmt.amount
		};
	}
}

export class TurnIO implements StatementIO<Turn> {
	read (json: any): Turn {
		const turn = new Turn();
		turn.angle = json.angle;
		return turn;
	}
	
	write (stmt: Turn): any {
		return {
			type: "Turn",
			angle: stmt.angle
		};
	}
}

export class RepeatIO implements StatementIO<Repeat> {
	read (json: any): Repeat {
		const repeat = new Repeat();
		repeat.times = json.times;
        repeat.add(readStatement(json.statement));
        return repeat;
	}
	
	write (stmt: Repeat): any {
		return {
			type: "Repeat",
			times: stmt.times,
			statement: writeStatement(stmt.children[0])
		}
	}
}

export class SequenceIO implements StatementIO<Sequence> {
	read (json: any): Sequence {
		const sequence = new Sequence();
        json.statements.forEach((jsonStmt: any) => sequence.add(readStatement(jsonStmt)));
        return sequence;
	}
	
	write (stmt: Sequence): any {
		return {
			type: "Sequence",
			statements: stmt.children.map(stmt => writeStatement(stmt))
		};
	}	
}

/**
 * Collection of all existing statement types and their IO facilities
 */
export const STATEMENT_TYPES: {[type: string]: StatementIO<any>} = {
	Forward: new ForwardIO(),
	Turn: new TurnIO(),
	Repeat: new RepeatIO(),
	Sequence: new SequenceIO()
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

const name = function(type: any): string {
	return type.constructor.name;
}
