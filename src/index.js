import React from "react";
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.css';

let int;
const createStore = (reducer, initialState) => {
    let currentState = initialState;
    const listeners = [];

    const getState = () => currentState;
    const dispatch = action => {
        currentState = reducer(currentState, action);
        listeners.forEach(listener => listener());
        return action;
    };

    const subscribe = listener => listeners.push(listener);

    return { getState, dispatch, subscribe };
};

const connect = (mapStateToProps, mapDispatchToProps) => Component => {
    class WrappedComponent extends React.Component {
        componentDidMount() {
            this.context.store.subscribe(this.handleChange);
        }

        handleChange = () => {
            this.forceUpdate();
        };

        render() {
            return (
                <Component
                    {...this.props}
                    {...mapStateToProps(this.context.store.getState(), this.props)}
                    {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                />
            );
        }
    }

    WrappedComponent.contextTypes = {
        store: PropTypes.object
    };

    return WrappedComponent;
};

class Provider extends React.Component {
    getChildContext() {
        return {
            store: this.props.store
        };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}

Provider.childContextTypes = {
    store: PropTypes.object
};

// APP

// actions
const CHANGE_INTERVAL = "CHANGE_INTERVAL";

// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value
});

// reducers
const reducer = (state, action) => {
    switch (action.type) {
        case CHANGE_INTERVAL:
            return {
                ...state,
                currentInterval: state.currentInterval + action.payload
            };
        default:
            return {};
    }
};

// components

class IntervalComponent extends React.Component {
    render() {
        return (
            <div>
        <span>
          Интервал обновления секундомера: {this.props.currentInterval} сек.
        </span>
                <span>
          <button onClick={() => this.props.changeInterval(-1)}>-</button>
          <button onClick={() => this.props.changeInterval(1)}>+</button>
        </span>
            </div>
        );
    }
}

const Interval = connect(
    state => ({
        currentInterval: state.currentInterval
    }),
    dispatch => ({
        changeInterval: value => dispatch(changeInterval(value))
    })
)(IntervalComponent);

class TimerComponent extends React.Component {
    constructor() {
        super();
        this.startButton = React.createRef();
    }
    state = {
        currentTime: 0
    };

    handleStart = () => {
        const { currentInterval } = this.props;
        const startButton = this.startButton.current;
        startButton.classList.add("disable");
        this.setState({
            currentTime: 0
        });
        const changeCurrentTime = () => {
            this.setState(state => ({
                currentTime: state.currentTime + currentInterval
            }));
        };

        int = setInterval(changeCurrentTime.bind(this), currentInterval * 1000);
    };

    handleStop = () => {
        const startButton = this.startButton.current;
        startButton.classList.remove("disable");
        clearInterval(int);
        this.setState({ currentTime: 0 });
    };

    render() {
        return (
            <div>
                <Interval />
                <div>Секундомер: {this.state.currentTime} сек.</div>
                <div>
                    <button
                        className="button-start"
                        onClick={this.handleStart}
                        ref={this.startButton}
                    >
                        Старт
                    </button>
                    <button onClick={this.handleStop}>Стоп</button>
                </div>
            </div>
        );
    }
}

const Timer = connect(
    state => ({
        currentInterval: state.currentInterval
    }),
    () => {}
)(TimerComponent);

const initialState = {
    currentInterval: 1
};

// init
ReactDOM.render(
    <Provider store={createStore(reducer, initialState)}>
        <Timer />
    </Provider>,
    document.getElementById("root")
);


