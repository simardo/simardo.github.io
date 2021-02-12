const onHashChange = (_: HashChangeEvent): void => {
    render();
}

const onLoad = (_: Event): void => {
    render();
}

window.addEventListener('hashchange', onHashChange);
window.addEventListener('load', onLoad);

function render(): void {
    const path: string = parseLocation();

    const component: Component = findComponent(path);
    document.getElementById('content')!.innerHTML = component.render();

    document.querySelector('scool-operation')!.addEventListener(ScoolOperation.EVENT_OPERATION_SUBMIT, (event) => {
        console.log(`plussub`, (event as CustomEvent).detail);

        validate(challenge, (event as CustomEvent).detail);

        next(challenge);
    });

    next(challenge);
}

function parseLocation(): string {
    return location.hash.substr(1).toLowerCase() || '/';
}

function findComponent(path: string): Component {
    const route: Route | undefined = routes.find(r => r.path.toLowerCase() === path);
    return route?.component || errorComponent;
}

type Route = {
    path: string;
    component: Component;
}

const homeComponent: Component = {
    render: () => {
        return `<div>home component</div>`;
    }
}

const arithmetiqueComponent: Component = {
    render: () => {
        return `<scool-arithmetique>
    <scool-operation id="scool-op" slot="operator" s-if="true" left-operand="0" right-operand="0" operator="+"></scool-operation>
    <div id="results" slot="operator"></div>
</scool-arithmetique>`;
    }
}

const page2Component: Component = {
    render: () => {
        return `<div>page 2</div>`;
    }
}

const errorComponent: Component = {
    render: () => {
        return `<div>404</div>`;
    }
}

const routes: Route[] = [
    { path: '/', component: homeComponent },
    { path: '/arithmetique', component: arithmetiqueComponent },
    { path: '/page2', component: page2Component },
];

type Component = {
    render: () => string;
}

type Operator = '+' | '-' | 'x' | '/';

type Operation = {
    next: (table: number, max: number) => [number, number, Operator];
}

const plus: Operation = {
    next: (table: number, max: number) => [table, Math.round(Math.random() * max), '+']
}

const minus: Operation = {
    next: (table: number, max: number) => [table + Math.round(Math.random() * max), table, '-']
}

const mult: Operation = {
    next: (table: number, max: number) => [table, Math.round(Math.random() * max), 'x']
}

const div: Operation = {
    next: (table: number, max: number) => {
        const mult: number = Math.ceil(Math.random() * max) * table;
        return [mult, table, '/'];
    }
}

type ChallengeResults = {
    [key: string]: [number, number, number];
}

type Challenge = {
    operations: Operation[];
    tables: number[];
    max: number;
    results: ChallengeResults;
    current?: [number, number, Operator];
}

const challenge: Challenge = {
    operations: [
        /*plus,*/ mult/*, minus, div*/
    ],
    tables: [7,8,9],
    max: 10,
    results: {}
}

const next: (challenge: Challenge) => void = c => {
    const [op, t] = [c.operations[Math.round(Math.random() * (c.operations.length - 1))], c.tables[Math.round(Math.random() * (c.tables.length - 1))]];
    challenge.current = op.next(t, c.max);
    const [left, right, opr] = challenge.current;

    document.getElementById('scool-op')!.setAttribute('left-operand', left.toString());
    document.getElementById('scool-op')!.setAttribute('right-operand', right.toString());
    document.getElementById('scool-op')!.setAttribute('operator', opr);
};

const emojis: string[] = ['&#x1F922', '&#x1F974', '&#x1F62D', '&#x1F641', '&#x1F610', '&#x1F642', '&#x1F600', '&#x1F601', '&#x1F929']

const validate: (challenge: Challenge, response: number) => boolean = (c, r) => {
    const [left, right, opr] = challenge.current!;

    let answer: number;
    if (opr === '+') {
        answer = left + right;
    } else if (opr === '-') {
        answer = left - right;
    } else if (opr === 'x') {
        answer = left * right;
    } else {
        answer = left / right;
    }

    const key: string = `${left},${right},${opr}`;
    let score: [number, number, number] = challenge.results[key];
    if (score === undefined) {
        score = [r, answer, 4];
        challenge.results[key] = score;
    }
    score[1] = r;

    if (r === answer) {
        score[2] = Math.min(score[2] + 1, emojis.length - 1);
    } else {
        score[2] = Math.max(score[2] - 1, 0);
    }

    // remove
    const color: string = r === answer ? 'lime' : 'red';
    const asw: string = r === answer ? '' : `(${answer})`;
    document.getElementById('results')!.innerHTML = `${left} ${opr} ${right} = <span style="color: ${color}">${r}</span> ${asw} ${emojis[score[2]]}`;

    return r === answer;
}

customElements.define('scool-arithmetique',
    class extends HTMLElement {
        constructor() {
            super();
            let template: HTMLTemplateElement = document.getElementById('template-scool-arithmetique') as HTMLTemplateElement;

            this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
        }
    }
);

class ScoolCommon {
    public static S_IF = 's-if';
}

class ScoolOperation extends HTMLElement {
    private $root: HTMLElement;
    private $leftOperand: HTMLElement;
    private $rightOperand: HTMLElement;
    private $operator: HTMLElement;
    private $responseInput: HTMLInputElement;

    private static LEFT_OPERAND: string = 'left-operand';
    private static RIGHT_OPERAND: string = 'right-operand';
    private static OPERATOR: string = 'operator';
    private static RESPONSE_INPUT: string = 'response-input';

    public static EVENT_OPERATION_SUBMIT: string = 'operationsubmit';
    // public static EVENT_COMPONENT_CONNECTED: string = 'componentconnected';

    static get observedAttributes() {
        return [this.LEFT_OPERAND, this.RIGHT_OPERAND, this.OPERATOR, ScoolCommon.S_IF];
    }

    private onInputKeypress: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
        const target: HTMLInputElement = event.target as HTMLInputElement;

        if (event.key === 'Enter' && target.value) {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent(ScoolOperation.EVENT_OPERATION_SUBMIT, { detail: target.valueAsNumber }));
            target.value = '';
        }
    };

    constructor() {
        super();
        let template: HTMLTemplateElement = document.getElementById('template-scool-operation') as HTMLTemplateElement;

        const shadowRoot: ShadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.$root = shadowRoot.firstElementChild as HTMLElement;
        this.$root.hidden = true;
        this.$leftOperand = shadowRoot.querySelector(`#${ScoolOperation.LEFT_OPERAND}`) as HTMLElement;
        this.$rightOperand = shadowRoot.querySelector(`#${ScoolOperation.RIGHT_OPERAND}`) as HTMLElement;
        this.$operator = shadowRoot.querySelector(`#${ScoolOperation.OPERATOR}`) as HTMLElement;
        this.$responseInput = shadowRoot.querySelector(`#${ScoolOperation.RESPONSE_INPUT}`) as HTMLInputElement;
    }

    connectedCallback() {
        this.$responseInput.addEventListener('keypress', this.onInputKeypress);
        // this.dispatchEvent(new CustomEvent(ScoolOperation.EVENT_COMPONENT_CONNECTED, { detail: this.id }));
    }

    disconnectedCallback() {
        this.$responseInput.removeEventListener('keypress', this.onInputKeypress);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === ScoolOperation.LEFT_OPERAND) {
            this.$leftOperand.innerHTML = newValue;
        } else if (name === ScoolOperation.RIGHT_OPERAND) {
            this.$rightOperand.innerHTML = newValue;
        } else if (name === ScoolOperation.OPERATOR) {
            this.$operator.innerHTML = newValue;
        } else if (name === ScoolCommon.S_IF) {
            this.$root.hidden = newValue === 'false';
        }
    }
}

customElements.define('scool-operation', ScoolOperation);
