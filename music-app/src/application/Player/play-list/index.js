import React, { useRef, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import Scroll from '../../../baseUI/scroll';
import Confirm from '../../../baseUI/confirm';
import {
  changeShowPlayList,
  changePlayingState,
  changeCurrentIndex,
  changePlayMode,
  changePlayList,
  changeSequencePlayList,
  changeCurrentSong,
  deleteSong,
} from '../store/actionCreators';
import {
  prefixStyle,
  getName,
  findIndex,
  shuffle,
} from '../../../api/utils';
import { playMode } from '../../../api/config';
import {
  PlayListWrapper,
  ScrollWrapper,
  ListHeader,
  ListContent,
} from './style';

function PlayList(props) {
  const [isShow, setIsShow] = useState(false);
  const [canTouch, setCanTouch] = useState(true);

  // touchStart后记录y值
  const [startY, setStartY] = useState(0);

  // touchStart事件是否已经被触发
  const [initialed, setInitialed] = useState(0);

  // 用户下滑的距离
  const [distance, setDistance] = useState(0);

  const playListRef = useRef();
  const listWrapperRef = useRef();
  const confirmRef = useRef();
  const listContentRef = useRef();

  const {
    showPlayList,
    currentIndex,
    mode,
    currentSong: immutableCurrentSong,
    playList: immutablePlayList,
    sequencePlayList: immutableSequencePlayList,
  } = props;
  const {
    togglePlayListDispatch,
    changeCurrentIndexDispatch,
    changePlayListDispatch,
    changeModeDispatch,
    deleteSongDispatch,
    clearDispatch,
  } = props;
  const { clearPreSong } = props;

  const currentSong = immutableCurrentSong.toJS();
  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();
  const transform = prefixStyle("transform");

  const onEnterCB = useCallback(() => {
    // 显示列表
    setIsShow(true);

    // 最开始是隐藏在下面
    listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`;
  }, [transform]);

  const onEnteringCB = useCallback(() => {
    // 让列表展现
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0, 0, 0)`;
  }, [transform]);

  const onExitingCB = useCallback(() => {
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);

  const onExitedCB = useCallback(() => {
    setIsShow(false);
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);

  const getCurrentIcon = (item) => {
    // 是不是当前正在播放的歌曲
    const current = currentSong.id === item.id;
    const className = current ? 'icon-play' : '';
    const content = current ? '&#xe6e3;' : '';
    return (
      <i className={`current iconfont ${className}`} dangerouslySetInnerHTML={{ __html: content }}></i>
    )
  };
  const getPlayMode = () => {
    let content, text;
    if (mode === playMode.sequence) {
      content = "&#xe625;";
      text = "顺序播放";
    } else if (mode === playMode.loop) {
      content = "&#xe653;";
      text = "单曲循环";
    } else {
      content = "&#xe61b;";
      text = "随机播放";
    }
    return (
      <div>
        <i className="iconfont" onClick={(e) => changeMode(e)} dangerouslySetInnerHTML={{ __html: content }}></i>
        <span className="text" onClick={(e) => changeMode(e)}>{text}</span>
      </div>
    )
  };

  const changeMode = (e) => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList);
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
    }
    changeModeDispatch(newMode);
  };

  const handleChangeCurrentIndex = (index) => {
    if (currentIndex === index) {
      return;
    }
    changeCurrentIndexDispatch(index);
  }

  const handleDeleteSong = (e, song) => {
    e.stopPropagation();
    deleteSongDispatch(song);
  }

  const handleShowClear = () => {
    confirmRef.current.show();
  }

  const handleConfirmClear = () => {
    clearDispatch();
    clearPreSong();
  }

  const handleTouchStart = (e) => {
    // 歌曲列表在scroll的时候canTouch为false
    // initialed为true表示已经触发touchstart事件了
    if (!canTouch || initialed) {
      return;
    }
    listWrapperRef.current.style["transition"] = "";

    // 避免由于distance未置空导致第二次打开播放列表上划时播放列表关闭问题
    // 因为TouchMove事件中distance<0是直接return，不会重新设置distance
    // TouchEnd事件判断用的是上一次关闭播放列表时的distance，所以会导致判断出错，播放列表关闭
    setDistance(0);

    // 记录开始touch时的y值
    setStartY(e.nativeEvent.touches[0].pageY);
    setInitialed(true);
  };

  const handleTouchMove = (e) => {
    if (!canTouch || !initialed) {
      return;
    }
    let distance = e.nativeEvent.touches[0].pageY - startY;

    // 向上滑播放列表位置不动
    if (distance < 0) {
      return;
    }

    setDistance(distance);
    listWrapperRef.current.style[transform] = `translate3d(0, ${distance}px, 0)`;
  };

  const handleTouchEnd = (e) => {
    setInitialed(false);

    if (distance > 150) {
      // 设置阈值为150px, 大于150则关闭playList
      togglePlayListDispatch(false);
    } else {
      // 否则反弹回去
      listWrapperRef.current.style["transition"] = "all 0.3s";
      listWrapperRef.current.style[transform] = `translate3d(0, 0, 0)`;
    }
  }

  const handleScroll = (pos) => {
    let state = pos.y === 0 ? true : false;
    setCanTouch(state);
  }

  return (
    <CSSTransition
      in={showPlayList}
      timeout={300}
      classNames="list-fade"
      onEnter={onEnterCB}
      onEntering={onEnteringCB}
      onExiting={onExitingCB}
      onExited={onExitedCB}
    >
      <PlayListWrapper
        ref={playListRef}
        style={isShow === true ? { display: "block" } : { display: "none" }}
        onClick={() => togglePlayListDispatch(false)}
      >
        <div className="list_wrapper"
          ref={listWrapperRef}
          // 阻止冒泡
          onClick={e => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ListHeader>
            <h1 className="title">
              {getPlayMode()}
              <span className="iconfont clear" onClick={handleShowClear}>
                &#xe63d;
              </span>
            </h1>
          </ListHeader>
          <ScrollWrapper>
            <Scroll
              ref={listContentRef}
              onScroll={pos => handleScroll(pos)}
              bounceTop={false}
            >
              <ListContent>
                {
                  playList.map((item, index) => {
                    return (
                      <li className="item" key={item.id} onClick={() => handleChangeCurrentIndex(index)}>
                        {getCurrentIcon(item)}
                        <span className="text">{item.name} - {getName(item.ar)}</span>
                        <span className="like">
                          <i className="iconfont">&#xe601;</i>
                        </span>
                        <span className="delete" onClick={(e) => handleDeleteSong(e, item)}>
                          <i className="iconfont">&#xe63d;</i>
                        </span>
                      </li>
                    )
                  })
                }
              </ListContent>
            </Scroll>
          </ScrollWrapper>
        </div>
        <Confirm
          ref={confirmRef}
          text={"是否删除全部？"}
          cancelBtnText={"取消"}
          confirmBtnText={"确定"}
          handleConfirm={handleConfirmClear}
        >
        </Confirm>
      </PlayListWrapper>
    </CSSTransition>
  );
}

const mapStateToProps = (state) => ({
  currentIndex: state.getIn(['player', 'currentIndex']),
  currentSong: state.getIn(['player', 'currentSong']),
  playList: state.getIn(['player', 'playList']),
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),
  showPlayList: state.getIn(['player', 'showPlayList']),
  mode: state.getIn(['player', 'mode']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    // 修改当前歌曲在列表中的index, 即切歌
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data));
    },
    // 修改当前播放模式
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    // 修改当前歌曲列表
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    },
    deleteSongDispatch(data) {
      dispatch(deleteSong(data));
    },
    clearDispatch() {
      // 1. 清空两个列表
      dispatch(changePlayList([]));
      dispatch(changeSequencePlayList([]));
      // 2. 初始化currentIndex
      dispatch(changeCurrentIndex(-1));
      // 3. 关闭PlayList的显示
      dispatch(changeShowPlayList(false));
      // 4. 将当前歌曲置空
      dispatch(changeCurrentSong({}));
      // 5. 重置播放状态
      dispatch(changePlayingState(false));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(PlayList));