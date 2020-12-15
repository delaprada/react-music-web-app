import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(
  // 用于异步操作，使得dispatch能够接受函数作为参数，自动发出第二个action
  applyMiddleware(thunk)
));

export default store;