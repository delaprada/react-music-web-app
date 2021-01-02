import React, { useEffect } from 'react';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import Scroll from '../../baseUI/scroll';
import Horizen from '../../baseUI/horizen-item';
import Loading from '../../baseUI/loading';
import { categoryTypes, alphaTypes } from '../../api/config';
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreHotSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreSingerList,
  changeCategory,
  changeAlpha,
} from './store/actionCreators';
import {
  NavContainer,
  ListContainer,
  List,
  ListItem,
  EnterLoading,
} from './style';
import singerPic from './singer.png';

function Singers(props) {
  const { 
    category,
    alpha,
    singerList,
    enterLoading,
    pullUpLoading,
    pullDownLoading,
    pageCount,
    songsCount,
  } = props;

  const { getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch, updateCategory, updateAlpha } = props;

  useEffect(() => {
    if (!singerList.length && category === '' && alpha === '') {
      getHotSingerDispatch();
    }
  }, []);

  let handleUpdateAlpha = (val) => {
    updateAlpha(val);
    updateDispatch(category, val);
  }

  let handleUpdateCategory = (val) => {
    updateCategory(val);
    updateDispatch(val, alpha);
  }

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount);
  }

  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha);
  }

  const enterDetail = (id) => {
    props.history.push(`/singers/${id}`)
  }

  const renderSingerList = () => {
    const list = singerList ? singerList.toJS() : [];

    return (
      <List>
        {
          list.map((item, index) => {
            return (
              <ListItem key={item.accountId + "" + index} onClick={() => enterDetail(item.id)}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={singerPic} alt="music" />}>
                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  }

  return (
    <div>
      <NavContainer>
        <Horizen
          list={categoryTypes}
          title={"分类 (默认热门):"}
          handleClick={val => handleUpdateCategory(val)}
          oldVal={category}
        >
        </Horizen>
        <Horizen
          list={alphaTypes}
          title={"首字母:"}
          handleClick={val => handleUpdateAlpha(val)}
          oldVal={alpha}
        >
        </Horizen>
      </NavContainer>
      <ListContainer play={songsCount}>
        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList()}
        </Scroll>
        {enterLoading ? <EnterLoading><Loading></Loading></EnterLoading> : null}
      </ListContainer>
      {renderRoutes(props.route.routes)}
    </div>
  )
}

const mapStateToProps = (state) => ({
  category: state.getIn(['singers', 'category']),
  alpha: state.getIn(['singers', 'alpha']),
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount']),
  songsCount: state.getIn(['player', 'playList']).size,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },
    // 更新category值
    updateCategory(category) {
      dispatch(changeCategory(category));
    },
    // 更新alpha值
    updateAlpha(alpha) {
      dispatch(changeAlpha(alpha));
    },
    updateDispatch(category, alpha) {
      // 由于改变了分类，所以pageCount清空
      dispatch(changePageCount(0));
      dispatch(changeEnterLoading(true));
      dispatch(getSingerList(category, alpha));
    },
    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count + 1));
      if (hot) {
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category, alpha));
      }
    },
    // 顶部下拉刷新
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      // 属于重新获取数据
      dispatch(changePageCount(0));
      if (category === '' && alpha === '') {
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category, alpha));
      }
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers));