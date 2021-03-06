const CALC_COMPONENTS = {
    'zero': {
        display: '0',
        type: 'num',
    }, 
    'one': {
        display: '1',
        type: 'num',
    }, 
    'two': {
        display: '2',
        type: 'num',
    }, 
    'three': {
        display: '3',
        type: 'num',
    }, 
    'four': {
        display: '4',
        type: 'num',
    }, 
    'five': {
        display: '5',
        type: 'num',
    }, 
    'six': {
        display: '6',
        type: 'num',
    }, 
    'seven': {
        display: '7',
        type: 'num',
    },  
    'eight': {
        display: '8',
        type: 'num',
    },  
    'nine':  {
        display: '9',
        type: 'num',
    }, 
    'decimal': {
        display: '.',
        type: 'decimal',
    }, 
    'add': {
        display: '+',
        type: 'operator',
    },  
    'subtract': {
        display: '-',
        type: 'operator',
    },  
    'multiply': {
        display: '×',
        type: 'operator',
    },
    'divide': {
        display: '/',
        type: 'operator',
    }, 
    'clear': {
        display: 'AC',
        type: 'clear',
    },
};


function isOperator(char) {
    return char === '+' || char === '-' || char === '/' || char === '×';
}


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formula: '',
            currVal: '0',
            prevComputed: '',
            prevEntry: '',
            hasDecimal: false,
        };
        this.handleAction = this.handleAction.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Handle the click events
    handleAction(event) {
        const action = event.target.id;

        if (action === 'clear') {
            this.setState({
                formula: '',
                currVal: '0',
                prevComputed: '',
                prevEntry: '',
                hasDecimal: false,
            });
            $('#display').text('0');
            $('#formula').text('');
        } else {
            let invalid = false;
            const currIn = CALC_COMPONENTS[action];
            const {formula, currVal, prevEntry} = this.state;
            let newFormula = formula != '0' ? formula + currIn.display : currIn.display;
            let newCurrVal = currVal != '0' ? currVal + currIn.display : currIn.display;
                
            // If we follow up on an operator with a number
            if (currIn.type === 'num' && prevEntry.type === 'operator') {
                newCurrVal = currIn.display;
            }

            // If input is an operator
            if (currIn.type === 'operator') {
                let prvIdx = formula.length - 1;
                let twoBefore = formula[prvIdx - 1];

                // If input is subtraction
                if (currIn.display === '-') {
                    if (prevEntry.display === '-' && isOperator(twoBefore)) {
                        newFormula = formula;
                    }
                    if (formula.length === 1 && prevEntry.display === '-') {
                        newFormula = '-';
                    }
                    newCurrVal = '-';
                // If input ins't subtraction
                } else if (newFormula.length > 1) {
                    // 2 operators in a row
                    if (prevEntry.type === 'operator') {
                        // Special case if we already have 2 operators before our current operator input
                        if (isOperator(twoBefore)) {
                            prvIdx -= 1
                        }
                        newFormula = formula.substr(0, prvIdx) + currIn.display;
                    }
                    newCurrVal = currIn.display;
                }
                this.setState({ hasDecimal: false });
            }

            // Checks for correct decimal placements
            if (currIn.type === 'decimal') {
                if (this.state.hasDecimal == true) {
                    invalid = true;
                } else {
                    if (prevEntry.type === 'operator' || currVal === '0') {
                        newFormula = formula === '' ? '0.' : currVal === '0' ? formula + '.' : formula + '0.';
                        newCurrVal = '0.';
                    }
                    this.setState({ hasDecimal: true });
                }
            }  

            // Check if input length is at most 22 characters long or input is invalid
            if (newCurrVal.length > 17 || invalid) {
                const lengthCheck = newCurrVal.length > 17;
                newFormula = formula;
                newCurrVal = currVal;
                
                if (lengthCheck) {
                    $('#display').text('DIGIT LIMIT MET');
                    $('.num').attr('disabled');
                    setTimeout(() => {
                        $('#display').text(this.state.currVal);
                        $('.num').removeAttr('disabled');
                    }, 1250);
                }
            }
            
            this.setState({
                formula: newFormula,
                currVal: newCurrVal,
                prevEntry: currIn,
            });
        }
    }


    // Handle final calculations
    handleSubmit() {
        let compute = this.state.formula;
        let result = '';
        let beforeResult = '';
        // No input, only 1 or 2 operators as input
        if (compute.length == 0 || isOperator(compute) || (compute.length == 2 && isOperator(compute[0]) && isOperator(compute[1]))) {
            result = 'NaN';
        // Ends with an operator or we're computing with 'NaN'
        } else if (compute.indexOf('NaN') !== -1 || isOperator(compute[compute.length - 1])) {
            result = 'NaN';
        // Guarenteed to not end with an operator
        } else {
            let values;
            const prevComputed = this.state.prevComputed.toString();
            // Check to see if our previously computed number contains an 'e'
            if (compute.indexOf('e') == -1) {
                values = compute.split(/[+\-\/×]/);
            } else {
                compute = compute.substring(compute.indexOf(prevComputed) + prevComputed.length);
                values = compute.split(/[+\-\/×]/);
                values.unshift(prevComputed);
            }

            // Starts with a '×' or '/'
            if (values[0] === '' && compute[0] !== '+' && compute[0] !== '-') {
                result = 'NaN';
            } else {
                beforeResult = this.state.formula;
                if (values[0].indexOf('e') !== -1) {
                    compute = prevComputed + compute;
                }

                result = values[0] === '' ? 0 : +values[0];
                compute = compute.substring(compute.indexOf(values[0]) + values[0].length);
                values.shift();

                while (values.length > 0) {
                    // Only 1 operator before start of next number
                    if (compute.indexOf(values[0]) == 1) {
                        if (compute[0] === '+') {
                            result += +values[0];
                        } else if (compute[0] === '-') {
                            result -= +values[0];
                        } else if (compute[0] === '×') {
                            result *= +values[0];
                        } else if (compute[0] === '/') {
                            result /= +values[0];
                        }
                    // 2 operators before start of next number
                    } else if (compute.indexOf(values[0]) == 2) {
                        if (compute[0] === '+') {
                            result += -values[0];
                        } else if (compute[0] === '-') {
                            result -= -values[0];
                        } else if (compute[0] === '×') {
                            result *= -values[0];
                        } else if (compute[0] === '/') {
                            result /= -values[0];
                        }
                    }

                    compute = compute.substring(compute.indexOf(values[0]) + values[0].length);
                    values.shift();
                }
            }
        }

        this.setState({
            formula: result,
            prevComputed: result,
            currVal: '',
        }, () => {
            $('#display').text(result);
            $('#formula').text(beforeResult + `=${result}`);
        });
    }


    render() {
        const COMPONENTS = Object.entries(CALC_COMPONENTS).map((e) => {
            return <button id={e[0]} key={e[0]} onClick={this.handleAction} className={e[1].type}>{e[1].display}</button>
        });

        return (
            <div id="project-container">
                <div id="formula">{this.state.formula}</div>
                <div id="display">{this.state.currVal}</div>
                {COMPONENTS}
                <button id="equals" onClick={this.handleSubmit}>=</button>
            </div>
        );
    }
}



ReactDOM.render(<App />, document.getElementById('app'));