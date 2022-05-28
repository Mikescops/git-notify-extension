import React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

const render = (Component: typeof App) => {
    ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);
