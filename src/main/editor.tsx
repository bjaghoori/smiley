import * as React from "react";
import * as ReactDom from "react-dom";

import * as Program from "../main/program";

export function render(slot: Element, program: Program.Statement, runner: Program.Runner): void {
	ReactDom.render(createWidget(program, runner), slot);
}

function createWidget(stmt: Program.Statement, runner: Program.Runner): React.ReactElement<any> {
	if (stmt instanceof Program.Forward) {
		return <Forward statement={stmt} runner={runner}/>;
	} else if(stmt instanceof Program.Turn) {
		return <Turn statement={stmt} runner={runner}/>;
	} else if(stmt instanceof Program.Repeat) {
		return <Repeat statement={stmt} runner={runner}/>;
	} else if(stmt instanceof Program.Sequence) {
		return <Sequence statement={stmt} runner={runner}/>;
	} 
	return null;
}

interface WidgetProps<T extends Program.Statement> {
	statement: T;
	runner: Program.Runner;
}

interface ForwardState {
	value: string;
}
class Forward extends React.Component<WidgetProps<Program.Forward>, ForwardState> {
	
	constructor(props: WidgetProps<Program.Forward>) {
		super(props);
		this.state = {
			value: "" + props.statement.amount
		};
	}
	
	render(): React.ReactElement<any> {
		return <li>
			Forward
			<NumberInput {...new PropertyAccessor<Number>(this.props.statement, "amount")}/>
			steps
			<Remove statement={this.props.statement}/>
			<CurrentMarker statement={this.props.statement} runner={this.props.runner}/>
		</li>;
	}
	
	protected onChange(e: React.FormEvent): void {
		const value: string = (e.target as HTMLInputElement).value;
		this.setState({
			value: value
		});
	}

	protected onBlur(e: React.FocusEvent): void {
		this.props.statement.amount = new Number(this.state.value).valueOf();
	}
}

class Turn extends React.Component<WidgetProps<Program.Turn>, void> {
	constructor(props: WidgetProps<Program.Turn>) {
		super(props);
	}
	
	render(): React.ReactElement<any> {
		return <li>
			Turn
			<NumberInput {...new PropertyAccessor<Number>(this.props.statement, "angle")}/>
			degrees
			<Remove statement={this.props.statement}/>
			<CurrentMarker statement={this.props.statement} runner={this.props.runner}/>
		</li>
	}
}

interface SequenceState {
	newStatement: string;
}
class Sequence extends React.Component<WidgetProps<Program.Sequence>, SequenceState> {
	
	constructor() {
		super();
		this.state = {
			newStatement: undefined
		};
	}
	
	render(): React.ReactElement<any> {
		const statemenst = this.props.statement.children.map((c) => {
			return createWidget(c, this.props.runner);
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
			if(key !== "Sequence") {
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
		const name = (e.target as HTMLSelectElement).value;
		this.props.statement.add(FACTORY(name));
		this.setState(
			{
				newStatement: undefined
			}
		);
	}
}


class Repeat extends React.Component<WidgetProps<Program.Repeat>, void> {
	render(): React.ReactElement<any> {
		const statement = this.props.statement.children.length > 0
			? createWidget(this.props.statement.children[0], this.props.runner)
			: null;
		return <li>
				Repeat
				<NumberInput {...new PropertyAccessor<Number>(this.props.statement, "times")}/>
				times
				<Remove statement={this.props.statement}/>
				<CurrentMarker statement={this.props.statement} runner={this.props.runner}/>
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
		return <input
			type="number"
			value={this.state.value}
			onChange={(e) => this.onChange(e)}
			onBlur={(e) => this.onBlur(e)}/>;
	}
	
	private onChange(e: React.FormEvent): void {
		const value: string = (e.target as HTMLInputElement).value;
		this.setState({
			value: value
		});
	}

	private onBlur(e: React.FocusEvent): void {
		const n = new Number(this.state.value).valueOf();
		if(n >= 1 && n <= 1000) {
			this.props.set(n);
		} else {
			this.setState({
				value: "" + this.props.get()
			});
		}
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

const FACTORY = (name: string): Program.Statement => {
	if(name === "Forward") {
		return new Program.Forward();
	} else if(name === "Turn") {
		return new Program.Turn();
	} else if(name === "Repeat") {
		const repeat = new Program.Repeat();
		repeat.add(new Program.Sequence());
		return repeat;
	} else {
		throw new Error("unknown type:" + name);
	}
}

class CurrentMarker extends React.Component<WidgetProps<Program.Statement>, void> {
	render(): React.ReactElement<any> {
		return this.props.statement === this.props.runner.current
			? <span>&lt;==</span>
			: null;
	}
}