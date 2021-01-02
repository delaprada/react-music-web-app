import {
  getHotSingerListRequest,
  getSingerListRequest,
} from '../../../api/request';
import {
  CHANGE_CATEGORY,
  CHANGE_ALPHA,
  CHANGE_SINGER_LIST,
  CHANGE_PAGE_COUNT,
  CHANGE_PULLUP_LOADING,
  CHANGE_PULLDOWN_LOADING,
  CHANGE_ENTER_LOADING,
} from './constants';
import {
  fromJS
} from 'immutable';

const changeSingerList = (data) => ({
  type: CHANGE_SINGER_LIST,
  data: fromJS(data)
});

export const changeCategory = (data) => ({
  type: CHANGE_CATEGORY,
  data
});

export const changeAlpha = (data) => ({
  type: CHANGE_ALPHA,
  data
});

export const changePageCount = (data) => ({
  type: CHANGE_PAGE_COUNT,
  data
});

export const changeEnterLoading = (data) => ({
  type: CHANGE_ENTER_LOADING,
  data
});

// 滑动最底部loading
export const changePullUpLoading = (data) => ({
  type: CHANGE_PULLUP_LOADING,
  data
});

// 顶部下拉刷新loading
export const changePullDownLoading = (data) => ({
  type: CHANGE_PULLDOWN_LOADING,
  data
});

// 第一次加载热门歌手
export const getHotSingerList = () => {
  return (dispatch) => {
    getHotSingerListRequest(0).then(res => {
      const data = res.artists;
      dispatch(changeSingerList(data));
      dispatch(changeEnterLoading(false));
      dispatch(changePullDownLoading(false));
    }).catch(() => {
      console.log('热门歌手数据获取失败');
    })
  }
};

// 加载更多热门歌手
export const refreshMoreHotSingerList = () => {
  return (dispatch, getState) => {
    const pageCount = getState().getIn(['singers', 'pageCount']);
    console.log(pageCount);
    const singerList = getState().getIn(['singers', 'singerList']).toJS();
    getHotSingerListRequest(pageCount).then(res => {
      console.log(res);
      const data = [...singerList, ...res.artists];
      dispatch(changeSingerList(data));
      dispatch(changePullUpLoading(false));
    }).catch(() => {
      console.log('歌手数据获取失败');
    })
  }
};

// 第一次加载对应类别的歌手
export const getSingerList = (category, alpha) => {
  return (dispatch) => {
    getSingerListRequest(category, alpha, 0).then(res => {
      const data = res.artists;
      dispatch(changeSingerList(data));
      dispatch(changeEnterLoading(false));
      dispatch(changePullDownLoading(false));
    }).catch(() => {
      console.log('歌手数据获取失败');
    })
  }
};

// 加载更多歌手
export const refreshMoreSingerList = (category, alpha) => {
  return (dispatch, getState) => {
    const pageCount = getState().getIn(['singers', 'pageCount']);
    const singerList = getState().getIn(['singers', 'singerList']);
    getSingerListRequest(category, alpha, pageCount).then(res => {
      const data = [...singerList, ...res.artists];
      dispatch(changeSingerList(data));
      dispatch(changePullUpLoading(false));
    }).catch(() => {
      console.log('歌手数据获取失败');
    });
  }
};