import * as React from "react";
import * as ReactDom from "react-dom";

import * as Program from "../main/program";

export function render(slot: Element, program: Program.Statement): void {
	ReactDom.render(factory(program), slot);
}

function factory(stmt: Program.Statement): React.ReactElement<any> {
	if(stmt instanceof Program.Forward) {
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

export interface ForwardProps {
	forward: Program.Forward;
}
export interface ForwardState {
	value: string;
}
export class Forward extends React.Component<ForwardProps, ForwardState> {
	
	constructor(props: ForwardProps) {
		super(props);
		this.state = {
			value: "" + props.forward.amount
		};
	}
	
	render(): React.ReactElement<any> {
		return <li>Forward: <NumberInput {...new PropertyAccessor<Number>(this.props.forward, "amount")}/></li>;
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

export interface TurnProps {
	turn: Program.Turn;
}
export class Turn extends React.Component<TurnProps, void> {
	constructor(props: TurnProps) {
		super(props);
	}
	
	render(): React.ReactElement<any> {
		return <li>Turn: <NumberInput {...new PropertyAccessor<Number>(this.props.turn, "angle")}/></li>;
	}
}

export interface SequenceProps {
	sequence: Program.Sequence;
}
export class Sequence extends React.Component<SequenceProps, void> {
	render(): React.ReactElement<any> {
		const children = this.props.sequence.children.map((c) => {
			return factory(c);
		});
		return <div>
			Sequence:
			<ul>{children}</ul>
		</div>		
	}
}

export interface RepeatProps {
	repeat: Program.Repeat;
}
export class Repeat extends React.Component<RepeatProps, void> {
	render(): React.ReactElement<any> {
		const statement = this.props.repeat.children.length > 0
			? factory(this.props.repeat.children[0])
			: null;
		return <li>
				Repeat <NumberInput {...new PropertyAccessor<Number>(this.props.repeat, "times")}/> times:
				<ul>
					<li>{statement}</li>
				</ul>
			</li>
	}
}


export class PropertyAccessor<T> {
	constructor(private object: any, private property: string) {}
	
	get = () => this.object[this.property];
	
	set = (value: T) => {
		this.object[this.property] = value;
	}
}
export interface NumberInputState {
	value: string;
}
export class NumberInput extends React.Component<PropertyAccessor<Number>, NumberInputState> {
	
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
