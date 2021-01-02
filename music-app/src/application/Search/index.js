import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import LazyLoad, { forceCheck } from 'react-lazyload';
import {
  getHotKeyWords,
  getSuggestList,
  changeEnterLoading,
} from './store/actionCreators';
import { getSongDetail } from '../Player/store/actionCreators';
import SearchBox from '../../baseUI/search-box';
import Scroll from '../../baseUI/scroll';
import Loading from '../../baseUI/loading';
import MusicalNote from '../../baseUI/music-note';
import { getName } from '../../api/utils';
import {
  Container,
  ShortcutWrapper,
  HotKey,
  List,
  ListItem,
  SongItem,
} from './style';
import musicPic from './music.png';
import singerPic from './singer.png';

function Search(props) {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');

  const {
    hotList,
    enterLoading,
    suggestList: immutableSuggestList,
    songsList: immutableSongsList,
    songsCount,
  } = props;

  const suggestList = immutableSuggestList.toJS();
  const songsList = immutableSongsList.toJS();

  const {
    getHotKeyWordsDispatch,
    getSuggestListDispatch,
    changeEnterLoadingDispatch,
    getSongDetailDispatch,
  } = props;

  const musicNoteRef = useRef();

  useEffect(() => {
    setShow(true);

    if (!hotList.size) {
      getHotKeyWordsDispatch();
    }
  }, []);

  const setShowfalse = () => {
    setShow(false);
  };

  const searchBack = useCallback(() => {
    setShow(false);
  }, []);

  const handleQuery = useCallback((q) => {
    console.log(q);
    setQuery(q);

    if (!q) {
      return;
    }
    changeEnterLoadingDispatch(true);
    getSuggestListDispatch(q);
  }, []);

  const selectItem = (e, id) => {
    getSongDetailDispatch(id);
    musicNoteRef.current.startAnimation({x:e.nativeEvent.clientX, y:e.nativeEvent.clientY});
  };

  const renderHotKey = () => {
    let list = hotList ? hotList.toJS() : [];
    return (
      <ul>
        {
          list.map(item => {
            return (
              <li className="item" key={item.first} onClick={() => setQuery(item.first)}>
                <span>{item.first}</span>
              </li>
            )
          })
        }
      </ul>
    )
  };

  const renderSingers = () => {
    let singers = suggestList.artists;
    if (!singers || !singers.length) return;
    return (
      <List>
        <h1 className="title"> 相关歌手 </h1>
        {
          singers.map((item, index) => {
            return (
              <ListItem key={item.accountId + "" + index} onClick={() => props.history.push(`singers/${item.id}`)}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={singerPic} alt="singer" />}>
                    <img src={item.picUrl} width="100%" height="100%" alt="music" />
                  </LazyLoad>
                </div>
                <span className="name"> 歌手: {item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  const renderAlbum = () => {
    let albums = suggestList.playlists;
    if (!albums || !albums.length) {
      return;
    }

    return (
      <List>
        <h1 className="title"> 相关歌单 </h1>
        {
          albums.map((item, index) => {
            return (
              <ListItem key={item.accountId + "" + index} onClick={() => props.history.push(`/album/${item.id}`)}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={musicPic} alt="music" />}>
                    <img src={item.coverImgUrl} width="100%" height="100%" alt="music" />
                  </LazyLoad>
                </div>
                <span className="name">歌单：{item.name}</span>
              </ListItem>
            );
          })
        }
      </List>
    );
  };

  const renderSongs = () => {
    return (
      <SongItem style={{ paddingLeft: "20px" }}>
        {
          songsList.map(item => {
            return (
              <li key={item.id} onClick={(e) => selectItem(e, item.id)}>
                <div className="info">
                  <span>{item.name}</span>
                  <span>
                    {getName(item.artists)} - {item.album.name}
                  </span>
                </div>
              </li>
            )
          })
        }
      </SongItem>
    )
  }

  return (
    <CSSTransition
      in={show}
      timeout={300}
      appear={true}
      classNames="fly"
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container play={songsCount}>
        <div className="search_box_wrapper">
          <SearchBox back={searchBack} newQuery={query} handleQuery={handleQuery}></SearchBox>
        </div>
        <ShortcutWrapper show={!query}>
          <Scroll>
            <div>
              <HotKey>
                <h1 className="title">热门搜索</h1>
                {renderHotKey()}
              </HotKey>
            </div>
          </Scroll>
        </ShortcutWrapper>
        <ShortcutWrapper show={query}>
          <Scroll onScorll={forceCheck}>
            <div>
              {renderSingers()}
              {renderAlbum()}
              {renderSongs()}
            </div>
          </Scroll>
        </ShortcutWrapper>
        {enterLoading ? <Loading></Loading> : null}
        <MusicalNote ref={musicNoteRef}></MusicalNote>
      </Container>
    </CSSTransition>
  );
}

const mapStateToProps = (state) => ({
  hotList: state.getIn(['search', 'hotList']),
  enterLoading: state.getIn(['search', 'enterLoading']),
  suggestList: state.getIn(['search', 'suggestList']),
  songsCount: state.getIn(['player', 'playList']).size,
  songsList: state.getIn(['search', 'songsList']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    getHotKeyWordsDispatch() {
      dispatch(getHotKeyWords());
    },
    getSuggestListDispatch(data) {
      dispatch(getSuggestList(data));
    },
    changeEnterLoadingDispatch(data) {
      dispatch(changeEnterLoading(data));
    },
    getSongDetailDispatch(id) {
      dispatch(getSongDetail(id));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Search));