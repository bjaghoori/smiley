import * as React from "react";
import * as ReactDom from "react-dom";

import * as Program from "../main/program";

export function render(slot: Element, program: Program.Statement): void {
	ReactDom.render(createWidget(program), slot);
}

function createWidget(stmt: Program.Statement): React.ReactElement<any> {
	if (stmt instanceof Program.Forward) {
		return <Forward forward={stmt}/>;
	} else if(stmt instanceof Program.Turn) {
		return <Turn turn={stmt}/>;
	} else if(stmt instanceof Program.Repeat) {
		return <Repeat repeat={stmt}/>;
	} else if(stmt instanceof Program.Sequence) {
		return <Sequence sequence={stmt}/>;
	} 
	return null;
}

interface ForwardProps {
	forward: Program.Forward;
}
interface ForwardState {
	value: string;
}
class Forward extends React.Component<ForwardProps, ForwardState> {
	
	constructor(props: ForwardProps) {
		super(props);
		this.state = {
			value: "" + props.forward.amount
		};
	}
	
	render(): React.ReactElement<any> {
		return <li>
			Forward
			<NumberInput {...new PropertyAccessor<Number>(this.props.forward, "amount")}/>
			steps
			<Remove statement={this.props.forward}/>
		</li>;
	}
	
	protected onChange(e: React.FormEvent): void {
		const value: string = (e.target as HTMLInputElement).value;
		this.setState({
			value: value
		});
	}

	protected onBlur(e: React.FocusEvent): void {
		this.props.forward.amount = new Number(this.state.value).valueOf();
	}
}

interface TurnProps {
	turn: Program.Turn;
}
class Turn extends React.Component<TurnProps, void> {
	constructor(props: TurnProps) {
		super(props);
	}
	
	render(): React.ReactElement<any> {
		return <li>
			Turn
			<NumberInput {...new PropertyAccessor<Number>(this.props.turn, "angle")}/> degrees
			<Remove statement={this.props.turn}/>
		</li>
	}
}

interface SequenceProps {
	sequence: Program.Sequence;
}
interface SequenceState {
	newStatement: string;
}
class Sequence extends React.Component<SequenceProps, SequenceState> {
	
	constructor() {
		super();
		this.state = {
			newStatement: undefined
		};
	}
	
	render(): React.ReactElement<any> {
		const statemenst = this.props.sequence.children.map((c) => {
			return createWidget(c);
		});
		return <div>
			<button type="button" onClick={() => this.onAdd()} disabled={this.isAdding()}>add</button>
			<ul>
				{statemenst}
				{this.newStatement()}
			</ul>
		</div>		
	}
	
	private onAdd(): void {
		this.setState(
			{
				newStatement: ""
			}
		);
	}
	
	private isAdding(): boolean {
		return this.state.newStatement !== undefined;
	}
	
	private newStatement(): React.ReactElement<any> {
		if(!this.isAdding()) {
			return null;
		}
		const options: React.ReactElement<any>[] = [<option/>];
		for(let key in Program.STATEMENT_TYPES) {
			if(key !== "sequence") {
				options.push(<option value={key}>{key}</option>);
			}
		}
		return <li>
			<select onChange={(e) => this.onSelectNewStatement(e)}>
				{options}
			</select>
		</li>
	}
	
	private onSelectNewStatement(e: React.FormEvent): void {
		const value = (e.target as HTMLSelectElement).value;
		const constructor = Program.STATEMENT_TYPES[value];
		const newStatement = new constructor();
		this.props.sequence.add(newStatement);
		this.setState(
			{
				newStatement: undefined
			}
		);
	}
}


interface RepeatProps {
	repeat: Program.Repeat;
}
class Repeat extends React.Component<RepeatProps, void> {
	render(): React.ReactElement<any> {
		const statement = this.props.repeat.children.length > 0
			? createWidget(this.props.repeat.children[0])
			: null;
		return <li>
				Repeat <NumberInput {...new PropertyAccessor<Number>(this.props.repeat, "times")}/> times:
				<Remove statement={this.props.repeat}/>
				{statement}
			</li>
	}
}


class PropertyAccessor<T> {
	constructor(private object: any, private property: string) {}
	
	get = () => this.object[this.property];
	
	set = (value: T) => {
		this.object[this.property] = value;
	}
}
interface NumberInputState {
	value: string;
}
class NumberInput extends React.Component<PropertyAccessor<Number>, NumberInputState> {
	
	constructor(props: PropertyAccessor<Number>) {
		super(props);
		this.state = {
			value: "" + props.get()
		};
	}
	
	render(): React.ReactElement<any> {
		return <input type="number" value={this.state.value} onChange={(e) => this.onChange(e)} onBlur={(e) => this.onBlur(e)}/>;
	}
	
	protected onChange(e: React.FormEvent): void {
		const value: string = (e.target as HTMLInputElement).value;
		this.setState({
			value: value
		});
	}

	protected onBlur(e: React.FocusEvent): void {
		this.props.set(new Number(this.state.value).valueOf());
	}
}

interface RemoveProps {
	statement: Program.Statement;
}
class Remove extends React.Component<RemoveProps, void> {
	render(): React.ReactElement<any> {
		return <button type="button" onClick={() => this.onClick()}>remove</button>
	}
	
	private onClick(): void {
		this.props.statement.detach();
	}
}
