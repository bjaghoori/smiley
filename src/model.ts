export class Program {
    _args: Expression[] = [];
    _rootStatement: RootStatement;

    constructor(canvas: HTMLCanvasElement) {
        this._rootStatement = new RootStatement(new SmileyCanvas(canvas.getContext("2d"), 5.0));
    }
}

class Expression {
    value(): number {
        throw new Error("abstract");
    }
}

export class NumericExpression extends Expression {
    _value: number;

    value(): number {
        return this._value;
    }
}

export class VariableExpression extends Expression {
    _variable: Assignment;

    value(): number {
        return this._variable.value();
    }
}

export class Statement {
    parent: Statement;

    root(): RootStatement {
        if (this instanceof RootStatement) {
            return <RootStatement>this;
        } else {
            return this.parent.root();
        }
    }

    execute(): boolean {
        return false;
    }

    init(): void {
    }

}

export interface AssignmentArguments {
    name: string;
    value: Expression;
}
export class Assignment extends Statement {
    _args: AssignmentArguments;
    value(): number {
        return this._args.value.value();
    }

    init(): void {
    }
}

export interface PointArguments {
    x: Expression;
    y: Expression;
}

export class Point extends Statement {
    _args: PointArguments = {
        x: null,
        y: null
    }

    execute(): boolean {
        this.root()._canvas.point(this._args.x.value(), this._args.y.value());
        return false;
    }
}

export class Sequence extends Statement {
    private _statements: Statement[] = [];
    current = 0;

    add(stmt: Statement) {
        stmt.parent = this;
        this._statements.push(stmt);
    }

    execute(): boolean {
        if (this.current >= this._statements.length) {
            return false;
        }
        if (!this._statements[this.current].execute()) {
            this.current++;
        }
        return this.current < this._statements.length;
    }
}

export class RootStatement extends Sequence {
    _canvas: SmileyCanvas;

    constructor(canvas: SmileyCanvas) {
        super();
        this._canvas = canvas;
    }
}

class SmileyCanvas {
    constructor(private context: CanvasRenderingContext2D, private scale: number) {
        this.context.fillStyle = "black";
    }

    point(x: number, y: number) {
        this.context.beginPath();
        this.context.arc(x * this.scale, y * this.scale, this.scale, 0, 360);
        this.context.fill();
        this.context.stroke();
    }
}

export class Reader {

    constructor(private canvas: HTMLCanvasElement) { }

    read(json: any): Program {
        var program = new Program(this.canvas);
        json.statements.forEach((jsonStmt: any) => program._rootStatement.add(this.readStatement(jsonStmt)));
        return program;
    }

    readStatement(json: any): Statement {
        if (json.type === "point") {
            return this.readPoint(json);
        } else {
            throw new Error("unknown statement type " + json.type);
        }
    }

    readPoint(json: any): Point {
        var point = new Point();
        point._args.x = this.readExpression(json.x);
        point._args.y = this.readExpression(json.y);
        return point;
    }
    
    readExpression(json: any): Expression {
        if(!isNaN(json)) {
            var e = new NumericExpression();
            e._value = parseInt(json);
            return e;
        }
    }
}