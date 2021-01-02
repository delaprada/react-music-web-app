import React, { useState, useEffect, useCallback, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";
import Header from "../../baseUI/header/index";
import Scroll from "../../baseUI/scroll/index";
import Loading from "../../baseUI/loading/index";
import MusicNote from '../../baseUI/music-note';
import SongsList from "../SongsList/index";
import { getAlbumList, changeEnterLoading } from "./store/actionCreators.js";
import { getCount, getName, isEmptyObject } from "../../api/utils";
import {
  Container,
  TopDesc,
  Menu,
  SongList,
  SongItem
} from "./style";
import style from "../../assets/global-style";

export const HEADER_HEIGHT = 45;

function Album(props) {
  const [isMarquee, setIsMarquee] = useState(false);
  const [title, setTitle] = useState("歌单");
  const [showStatus, setShowStatus] = useState(true);

  const id = props.match.params.id;

  const { 
    currentAlbum: currentAlbumImmutable,
    enterLoading,
    songsCount,
  } = props;
  const { getAlbumDataDispatch } = props;

  let currentAlbum = currentAlbumImmutable.toJS();

  const headerEl = useRef();
  const musicNoteRef = useRef ();

  useEffect(() => {
    getAlbumDataDispatch(id);
  }, []);

  const handleBack = useCallback(() => {
    setShowStatus(false);
  }, []);

  const handleScroll = useCallback((pos) => {
    let minScrollY = -HEADER_HEIGHT;
    let percent = Math.abs(pos.y / minScrollY);
    let headerDom = headerEl.current;

    // 滑过顶部的高度开始变化
    if (pos.y < minScrollY) {
      headerDom.style.backgroundColor = style["theme-color"];
      headerDom.style.opacity = Math.min(1, (percent - 1) / 2);
      setTitle(currentAlbum.name);
      setIsMarquee(true);
    } else {
      headerDom.style.backgroundColor = "";
      headerDom.style.opacity = 1;
      setTitle("歌单");
      setIsMarquee(false);
    }
  }, [currentAlbum]);

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation ({ x, y });
  };

  const renderTopDesc = () => {
    return (
      <TopDesc background={currentAlbum.coverImgUrl}>
        <div className="background">
          <div className="filter"></div>
        </div>
        <div className="img_wrapper">
          <div className="decorate"></div>
          <img src={currentAlbum.coverImgUrl} alt="" />
          <div className="play_count">
            <i className="iconfont play">&#xe885;</i>
            <span className="count">
              {Math.floor(currentAlbum.subscribedCount / 1000) / 10} 万
            </span>
          </div>
        </div>
        <div className="desc_wrapper">
          <div className="title">{currentAlbum.name}</div>
          <div className="person">
            <div className="avatar">
              <img src={currentAlbum.creator.avatarUrl} alt="" />
            </div>
            <div className="name">{currentAlbum.creator.nickname}</div>
          </div>
        </div>
      </TopDesc>
    );
  };

  const renderMenu = () => {
    return (
      <Menu>
        <div>
          <i className="iconfont">&#xe6ad;</i>
          评论
        </div>
        <div>
          <i className="iconfont">&#xe86f;</i>
          点赞
        </div>
        <div>
          <i className="iconfont">&#xe62d;</i>
          收藏
        </div>
        <div>
          <i className="iconfont">&#xe606;</i>
          更多
        </div>
      </Menu>
    );
  };

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container play={songsCount}>
        <Header ref={headerEl} title={title} isMarquee={isMarquee} handleClick={handleBack}></Header>
        {!isEmptyObject(currentAlbum) ?
          (
            <Scroll
              bounceTop={false}
              onScroll={handleScroll}
            >
              <div>
                {renderTopDesc()}
                {renderMenu()}
                <SongsList
                  collectCount={currentAlbum.subscribedCount}
                  showCollect={true}
                  songs={currentAlbum.tracks}
                  musicAnimation={musicAnimation}
                />
              </div>
            </Scroll>
          ) : null}
        {enterLoading ? <Loading></Loading> : null}
        <MusicNote ref={musicNoteRef}></MusicNote>
      </Container>
    </CSSTransition>
  );
}

const mapStateToProps = (state) => ({
  currentAlbum: state.getIn(["album", "currentAlbum"]),
  enterLoading: state.getIn(["album", "enterLoading"]),
  songsCount: state.getIn(["player", "playList"]).size,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch(id) {
      dispatch(changeEnterLoading(true));
      dispatch(getAlbumList(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Album));
