import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import SongsList from "../SongsList/index";
import Header from "../../baseUI/header/index";
import Scroll from "../../baseUI/scroll/index";
import Loading from '../../baseUI/loading/index';
import { HEADER_HEIGHT } from "./../../api/config";
import { getSingerInfo, changeEnterLoading } from './store/actionCreators';
import {
  Container,
  ImgWrapper,
  CollectButton,
  SongListWrapper,
  BgLayer,
} from './style';

function Singer(props) {
  const { 
    artist: immutableArtist,
    songs: immutableSongs,
    loading
  } = props;
  const { getSingerDataDispatch } = props;

  const artist = immutableArtist.toJS();
  const songs = immutableSongs.toJS();

  const [showStatus, setShowStatus] = useState(true);

  const collectButton = useRef();
  const imageWrapper = useRef();
  const songScrollWrapper = useRef();
  const songScroll = useRef();
  const header = useRef();
  const layer = useRef();

  // 图片初始高度
  const initialHeight = useRef(0);

  // 往上偏移的尺寸，露出圆角
  const OFFSET = 5;

  useEffect(() => {
    let h = imageWrapper.current.offsetHeight;
    songScrollWrapper.current.style.top = `${h - OFFSET}px`;
    initialHeight.current = h;

    // 遮罩先放在下面，以裹住歌曲列表
    layer.current.style.top = `${h - OFFSET}px`;
    songScroll.current.refresh();
  }, []);

  useEffect(() => {
    const id = props.match.params.id;
    getSingerDataDispatch(id);
  }, []);

  const setShowStatusFalse = useCallback(() => {
    setShowStatus(false);
  }, []);

  const handleScroll = (pos) => {
    let height = initialHeight.current;
    const newY = pos.y;
    const imageDOM = imageWrapper.current;
    const buttonDOM = collectButton.current;
    const headerDOM = header.current;
    const layerDOM = layer.current;
    const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;

    // 滑动距离占图片高度的百分比
    const percent = Math.abs(newY / height);

    // 向下拉：图片放大，按钮跟着移动
    if(newY > 0) {
      imageDOM.style["transform"] = `scale(${1 + percent})`;
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
      layerDOM.style.top = `${height - OFFSET + newY}px`;
    } else if (newY >= minScrollY) {
      layerDOM.style.top = `${height - OFFSET - Math.abs(newY)}px`;

      // 保证遮罩的层叠优先级比图片高，不至于被图片挡住
      layerDOM.style.zIndex = 1;
      imageDOM.style.paddingTop = "75%";
      imageDOM.style.height = 0;
      imageDOM.style.zIndex = -1;

      // 按钮跟着移动且渐渐变透明
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
      buttonDOM.style["opacity"] = `${1 - percent * 2}`;
    } else if (newY < minScrollY) {
      layerDOM.style.top = `${HEADER_HEIGHT - OFFSET}`;
      layerDOM.style.zIndex = 1;

      // 防止溢出的歌单内容遮住Header
      headerDOM.style.zIndex = 100;

      // 此时图片高度与Header一致
      imageDOM.style.height = `${HEADER_HEIGHT}px`;
      imageDOM.style.paddingTop = 0;
      imageDOM.style.zIndex = 99;
    }
  }

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <Header
          ref={header}
          title={artist.name}
          handleClick={setShowStatusFalse}
        ></Header>
        <ImgWrapper
          ref={imageWrapper}
          bgUrl={artist.picUrl}
        >
          <div className="filter"></div>
        </ImgWrapper>
        <CollectButton
          ref={collectButton}
        >
          <i className="iconfont">&#xe62d;</i>
          <span className="text">收藏</span>
        </CollectButton>
        <BgLayer ref={layer}></BgLayer>
        <SongListWrapper ref={songScrollWrapper}>
          <Scroll 
            ref={songScroll}
            onScroll={handleScroll}
          >
            <SongsList
              songs={songs}
              showCollect={false}
            >
            </SongsList>
          </Scroll>
        </SongListWrapper>
        { loading ? (<Loading></Loading>) : null }
      </Container>
    </CSSTransition>
  );
}

const mapStateToProps = (state) => ({
  artist: state.getIn(['singerInfo', 'artist']),
  songs: state.getIn(['singerInfo', 'songsOfArtist']),
  loading: state.getIn(['singerInfo', 'loading']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    getSingerDataDispatch(id) {
      dispatch(changeEnterLoading(true));
      dispatch(getSingerInfo(id));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singer));