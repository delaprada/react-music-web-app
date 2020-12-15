import { combineReducers } from 'redux-immutable';
import { reducer as recommendReducer } from '../application/Recommend/store/index';
import { reducer as singersReducer } from '../application/Singers/store/index';

// combineReducers里的对象便是state
export default combineReducers ({
  recommend: recommendReducer,
  singers: singersReducer,
});