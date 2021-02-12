const onHashChange = (_) => {
    render();
};
const onLoad = (_) => {
    render();
};
window.addEventListener('hashchange', onHashChange);
window.addEventListener('load', onLoad);
function render() {
    const path = parseLocation();
    const component = findComponent(path);
    document.getElementById('content').innerHTML = component.render();
    document.querySelector('scool-operation').addEventListener(ScoolOperation.EVENT_OPERATION_SUBMIT, (event) => {
        console.log(`plussub`, event.detail);
        validate(challenge, event.detail);
        next(challenge);
    });
    next(challenge);
}
function parseLocation() {
    return location.hash.substr(1).toLowerCase() || '/';
}
function findComponent(path) {
    const route = routes.find(r => r.path.toLowerCase() === path);
    return route?.component || errorComponent;
}
const homeComponent = {
    render: () => {
        return `<div>home component</div>`;
    }
};
const arithmetiqueComponent = {
    render: () => {
        return `<scool-arithmetique>
    <scool-operation id="scool-op" slot="operator" s-if="true" left-operand="0" right-operand="0" operator="+"></scool-operation>
    <div id="results" slot="operator"></div>
</scool-arithmetique>`;
    }
};
const page2Component = {
    render: () => {
        return `<div>page 2</div>`;
    }
};
const errorComponent = {
    render: () => {
        return `<div>404</div>`;
    }
};
const routes = [
    { path: '/', component: homeComponent },
    { path: '/arithmetique', component: arithmetiqueComponent },
    { path: '/page2', component: page2Component },
];
const plus = {
    next: (table, max) => [table, Math.round(Math.random() * max), '+']
};
const minus = {
    next: (table, max) => [table + Math.round(Math.random() * max), table, '-']
};
const mult = {
    next: (table, max) => [table, Math.round(Math.random() * max), 'x']
};
const div = {
    next: (table, max) => {
        const mult = Math.ceil(Math.random() * max) * table;
        return [mult, table, '/'];
    }
};
const challenge = {
    operations: [
        /*plus,*/ mult /*, minus, div*/
    ],
    tables: [7, 8, 9],
    max: 10,
    results: {}
};
const next = c => {
    const [op, t] = [c.operations[Math.round(Math.random() * (c.operations.length - 1))], c.tables[Math.round(Math.random() * (c.tables.length - 1))]];
    challenge.current = op.next(t, c.max);
    const [left, right, opr] = challenge.current;
    document.getElementById('scool-op').setAttribute('left-operand', left.toString());
    document.getElementById('scool-op').setAttribute('right-operand', right.toString());
    document.getElementById('scool-op').setAttribute('operator', opr);
};
const emojis = ['&#x1F922', '&#x1F974', '&#x1F62D', '&#x1F641', '&#x1F610', '&#x1F642', '&#x1F600', '&#x1F601', '&#x1F929'];
const validate = (c, r) => {
    const [left, right, opr] = challenge.current;
    let answer;
    if (opr === '+') {
        answer = left + right;
    }
    else if (opr === '-') {
        answer = left - right;
    }
    else if (opr === 'x') {
        answer = left * right;
    }
    else {
        answer = left / right;
    }
    const key = `${left},${right},${opr}`;
    let score = challenge.results[key];
    if (score === undefined) {
        score = [r, answer, 4];
        challenge.results[key] = score;
    }
    score[1] = r;
    if (r === answer) {
        score[2] = Math.min(score[2] + 1, emojis.length - 1);
    }
    else {
        score[2] = Math.max(score[2] - 1, 0);
    }
    // remove
    const color = r === answer ? 'lime' : 'red';
    const asw = r === answer ? '' : `(${answer})`;
    document.getElementById('results').innerHTML = `${left} ${opr} ${right} = <span style="color: ${color}">${r}</span> ${asw} ${emojis[score[2]]}`;
    return r === answer;
};
customElements.define('scool-arithmetique', class extends HTMLElement {
    constructor() {
        super();
        let template = document.getElementById('template-scool-arithmetique');
        this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    }
});
class ScoolCommon {
}
ScoolCommon.S_IF = 's-if';
class ScoolOperation extends HTMLElement {
    constructor() {
        super();
        this.onInputKeypress = (event) => {
            const target = event.target;
            if (event.key === 'Enter' && target.value) {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent(ScoolOperation.EVENT_OPERATION_SUBMIT, { detail: target.valueAsNumber }));
                target.value = '';
            }
        };
        let template = document.getElementById('template-scool-operation');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.$root = shadowRoot.firstElementChild;
        this.$root.hidden = true;
        this.$leftOperand = shadowRoot.querySelector(`#${ScoolOperation.LEFT_OPERAND}`);
        this.$rightOperand = shadowRoot.querySelector(`#${ScoolOperation.RIGHT_OPERAND}`);
        this.$operator = shadowRoot.querySelector(`#${ScoolOperation.OPERATOR}`);
        this.$responseInput = shadowRoot.querySelector(`#${ScoolOperation.RESPONSE_INPUT}`);
    }
    // public static EVENT_COMPONENT_CONNECTED: string = 'componentconnected';
    static get observedAttributes() {
        return [this.LEFT_OPERAND, this.RIGHT_OPERAND, this.OPERATOR, ScoolCommon.S_IF];
    }
    connectedCallback() {
        this.$responseInput.addEventListener('keypress', this.onInputKeypress);
        // this.dispatchEvent(new CustomEvent(ScoolOperation.EVENT_COMPONENT_CONNECTED, { detail: this.id }));
    }
    disconnectedCallback() {
        this.$responseInput.removeEventListener('keypress', this.onInputKeypress);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === ScoolOperation.LEFT_OPERAND) {
            this.$leftOperand.innerHTML = newValue;
        }
        else if (name === ScoolOperation.RIGHT_OPERAND) {
            this.$rightOperand.innerHTML = newValue;
        }
        else if (name === ScoolOperation.OPERATOR) {
            this.$operator.innerHTML = newValue;
        }
        else if (name === ScoolCommon.S_IF) {
            this.$root.hidden = newValue === 'false';
        }
    }
}
ScoolOperation.LEFT_OPERAND = 'left-operand';
ScoolOperation.RIGHT_OPERAND = 'right-operand';
ScoolOperation.OPERATOR = 'operator';
ScoolOperation.RESPONSE_INPUT = 'response-input';
ScoolOperation.EVENT_OPERATION_SUBMIT = 'operationsubmit';
customElements.define('scool-operation', ScoolOperation);
//# sourceMappingURL=app.js.map