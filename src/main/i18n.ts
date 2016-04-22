export interface Resources {
	Statement: {
		Repeat: string;
		Forward: string;
		Turn: string;
	},
	times: string;
	steps: string;
	degrees: string;
	Action: {
		add: string;
		remove: string;
		run: string;
		stop: string;
		step: string;
		load: string;
		save: string;
	}
}

let LANG: string;
export let resources: Resources;

export function setLanguage(lang: string) {
	LANG = lang;
	resources = ResourceBundles[LANG];
}

export const ResourceBundles: {[lang: string]: Resources} = {
	"en": {
		Statement: {
			Repeat: "repeat",
			Forward: "forward",
			Turn: "turn",
		},
		times: "times",
		steps: "steps",
		degrees: "degrees",
		Action: {
			add: "add",
			remove: "remove",
			run: "run",
			stop: "stop",
			step: "step",
			load: "load",
			save: "save",
		}
	},
	"de": {
		Statement: {
			Repeat: "wiederhole",
			Forward: "vorwärts",
			Turn: "drehe",
		},
		times: "mal",
		steps: "Schritte",
		degrees: "Grad",
		Action: {
			add: "hinzufügen",
			remove: "entfernen",
			run: "Start",
			stop: "Stop",
			step: "Schritt",
			load: "Laden",
			save: "Speichern"
		}
	}
};