export interface Point2d {
	x: number;
	y: number;
}

export class Turtle {
	private static DEG2RAD = 2 * Math.PI / 360;
	
	public penDown = true;
	public direction = 180;
	
	constructor(private l: TurtleListener, public position: Point2d) {}
	
	public forward(amount: number) {
		const previousPosition = this.position;
		this.position = {
			x: this.position.x + Math.sin(this.direction * Turtle.DEG2RAD) * amount,
			y: this.position.y + Math.cos(this.direction * Turtle.DEG2RAD) * amount
		}
		this.l.turtleMoved(previousPosition);
	}
	
	public turn(angle: number) {
		this.direction += angle;
	}
}

export interface TurtleListener {
	turtleMoved(previousPosition: Point2d): void;
}

export class TurtleCanvas implements TurtleListener {
	public turtle: Turtle;
	public context: CanvasRenderingContext2D;
	
    constructor(
		private canvas: HTMLCanvasElement,
		private scale: number) {
    	
		this.context = canvas.getContext("2d");
		this.context.moveTo(0, 0);
		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.turtle = new Turtle(this, { x: canvas.width/2.0/scale, y: canvas.height/2.0/scale });    
		this.context.fillStyle = "black";
    }

    private line(p0: Point2d, p1: Point2d) {
		console.log(JSON.stringify(p0) + " => " + JSON.stringify(p1));
        this.context.beginPath();
		this.context.moveTo(p0.x * this.scale, p0.y * this.scale);
		this.context.lineTo(p1.x * this.scale, p1.y * this.scale);
        this.context.stroke();
    }
	
	turtleMoved(previousPosition: Point2d): void {
		this.line(previousPosition, this.turtle.position);
	}
}
