export interface Point2d {
	x: number;
	y: number;
}

export class Turtle {
	public static DEG2RAD = 2 * Math.PI / 360;
	
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
		const previousAngle = this.direction;
		this.direction += angle;
		this.direction = this.direction % 360;
		this.l.turtleTurned(previousAngle);
	}
}

export interface TurtleListener {
	turtleMoved(previousPosition: Point2d): void;
	turtleTurned(previousAngle: number): void;
}

export class TurtleCanvas implements TurtleListener {
	private static TURTLE_SIZE = 24;
	
	public turtle: Turtle;
	public trailsContext: CanvasRenderingContext2D;
	public turtleContext: CanvasRenderingContext2D;
	
    constructor(
		trailsCanvas: HTMLCanvasElement,
		turtleCanvas: HTMLCanvasElement,
		private scale: number) {
    	
		this.trailsContext = TurtleCanvas.initContext(trailsCanvas);
		this.turtleContext = TurtleCanvas.initContext(turtleCanvas);
		
		this.turtle = new Turtle(
			this,
			{
				x: trailsCanvas.width/2.0/scale,
				y: trailsCanvas.height/2.0/scale
			}
		);
		
		this.turtleMoved(this.turtle.position);
    }

    private line(p0: Point2d, p1: Point2d): void {
        this.trailsContext.beginPath();
		this.trailsContext.moveTo(p0.x * this.scale, p0.y * this.scale);
		this.trailsContext.lineTo(p1.x * this.scale, p1.y * this.scale);
        this.trailsContext.stroke();
    }
	
	private drawTurtle(previousPosition: Point2d): void {
		this.turtleContext.clearRect(
			(previousPosition.x) * this.scale - TurtleCanvas.TURTLE_SIZE / 2.0 - 1,
			(previousPosition.y) * this.scale - TurtleCanvas.TURTLE_SIZE / 2.0 - 1,
			TurtleCanvas.TURTLE_SIZE + 2,
			TurtleCanvas.TURTLE_SIZE + 2);
		
		const startAngle = (360 - this.turtle.direction) % 360;
		const endAngle = (180 - this.turtle.direction) % 360;
		this.turtleContext.beginPath();
		this.turtleContext.arc(
			this.turtle.position.x * this.scale,
			this.turtle.position.y * this.scale,
			TurtleCanvas.TURTLE_SIZE / 2.0,
			startAngle * Turtle.DEG2RAD,
			endAngle * Turtle.DEG2RAD);
			this.turtleContext.fill();
	}
	
	turtleMoved(previousPosition: Point2d): void {
		this.line(previousPosition, this.turtle.position);
		this.drawTurtle(previousPosition);
	}
	
	turtleTurned(previousAngle: number): void {
		this.drawTurtle(this.turtle.position);
	}
	
	private static initContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
		const context = canvas.getContext("2d");
		context.moveTo(0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "black";
		return context;
	}
}
