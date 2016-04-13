import * as React from "react";
import * as ReactDom from "react-dom";

export interface ActionListeners {
	onRun: ActionListener;
	onStop: ActionListener;
	onStep: ActionListener;
}

export interface ActionListener {
	(): void;
}

export function render(slot: Element, listeners: ActionListeners): void {
	ReactDom.render(<Actions listeners={listeners}/>, slot);
}

interface ActionsProps {
	listeners: ActionListeners;
}
class Actions extends React.Component<ActionsProps, void> {
	render(): React.ReactElement<any> {
		return <div>
			<button type="button" onClick={() => this.props.listeners.onRun()}>run</button>
			<button type="button" onClick={() => this.props.listeners.onStop()}>stop</button>
			<button type="button" onClick={() => this.props.listeners.onStep()}>step</button>
		</div>
	}
}