import * as React from "react";
import * as ReactDom from "react-dom";

export interface ActionListeners {
	onRun: ActionListener;
	onStop: ActionListener;
	onStep: ActionListener;
	onLoad: UploadListener;
	onSave: DownloadProvider;
}

export interface ActionListener {
	(): void;
}

export interface UploadListener {
	(f: any): void;
}

export interface DownloadProvider {
	(): string;
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
			
			<input type="file" onChange={(e) => this.handleFile(e)} />
			
			<button type="button" onClick={() => this.download()}>save</button>
		</div>
	}
	
	handleFile(e: React.FormEvent): void {
		const reader = new FileReader();
		const target = e.target as any;
    	var file = target.files[0];

		reader.onload = (upload) => {
			this.props.listeners.onLoad((upload.target as any).result);
		}

    	reader.readAsText(file);
	}
	
	download() {
		const filename = "smiley.json";
		const text = this.props.listeners.onSave();
		
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}
}