import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen,
} from './store/actionCreators';
import MiniPlayer from './miniPlayer';
import NormalPlayer from './normalPlayer';
import PlayList from './play-list';
import Toast from '../../baseUI/Toast';
import {
  getSongUrl,
  isEmptyObject,
  shuffle,
  findIndex,
} from '../../api/utils';
import { getLyricRequest } from '../../api/request';
import { playMode } from '../../api/config';
import Lyric from '../../api/lyric-parser';

function Player(props) {
  // 目前播放时间
  const [currentTime, setCurrentTime] = useState(0);

  // 歌曲总时长
  const [duration, setDuration] = useState(0);

  // 当前播放模式
  const [modeText, setModeText] = useState("");

  // 即时歌词
  const [currentPlayingLyric, setPlayingLyric] = useState("");

  // 歌曲播放进度(会根据currentTime和duration的变化而变化)
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;

  // 记录当前的歌曲，以便于下次重渲染时比对是否是一首歌
  // 使用ref比state好，因为ref的话不会导致页面重新渲染
  const preSong = useRef({});
  const audioRef = useRef();
  const toastRef = useRef();
  const songReady = useRef(true); // 这里使用useRef猜测是因为使用ref不会导致重新渲染
  const currentLyric = useRef();
  const currentLineNum = useRef(0);

  const {
    fullScreen,
    playing,
    currentIndex,
    currentSong: immutableCurrentSong,
    playList: immutablePlayList,
    sequencePlayList: immutableSequencePlayList, // 顺序列表
    mode, // 播放模式
  } = props;

  const {
    toggleFullScreenDispatch,
    togglePlayingDispatch,
    togglePlayListDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    changePlayListDispatch,
    changeModeDispatch,
  } = props;

  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();
  const currentSong = immutableCurrentSong.toJS();

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||

      // 可以避免index因删除歌曲发生变化的时候重新播放歌曲
      playList[currentIndex].id === preSong.current.id ||
      !songReady.current
    ) {
      return;
    }
    let current = playList[currentIndex];
    changeCurrentDispatch(current);//赋值currentSong
    preSong.current = current;

    // 把标志位置设为false，表示现在新的资源没有缓冲完成，不能切歌
    songReady.current = false;
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      // play方法返回一个promise对象
      audioRef.current.play().then(() => {
        songReady.current = true;
      })
    });
    togglePlayingDispatch(true); //播放状态
    getLyric(current.id);
    setCurrentTime(0); //从头开始播放
    setDuration((current.dt / 1000) | 0); //时长
  }, [playList, currentIndex]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);

  const clickPlaying = (e, state) => {
    // 阻止冒泡
    e.stopPropagation();
    togglePlayingDispatch(state);
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000);
    }
  }

  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  }

  // 拉取进度条改变播放位置
  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
    if(currentLyric.current) {
      currentLyric.current.seek(newTime * 1000);
    }
  }

  // 一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    togglePlayingDispatch(true);
    audioRef.current.play();
  };

  const handlePrev = () => {
    // 播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) {
      index = playList.length - 1;
    }
    if (!playing) {
      togglePlayingDispatch(true);
    }
    changeCurrentIndexDispatch(index);
  }

  const handleNext = () => {
    // 播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }

    let index = currentIndex + 1;
    if (index === playList.length) {
      index = 0;
    }
    if (!playing) {
      togglePlayingDispatch(true);
    }
    changeCurrentIndexDispatch(index);
  }

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      // 顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
      setModeText("顺序循环");
    } else if (newMode === 1) {
      // 单曲循环
      changePlayListDispatch(sequencePlayList);
      setModeText("单曲循环");
    } else if (newMode === 2) {
      // 随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
      setModeText("随机播放");
    }
    changeModeDispatch(newMode);
    toastRef.current.show();
  }

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  };

  const handleError = () => {
    songReady.current = true;
    alert("播放错误");
  };

  const clearPreSong = () => {
    preSong.current = {};
  }

  const getLyric = id => {
    let lyric = "";
    if (currentLyric.current) {
      currentLyric.current.stop();
    }
    getLyricRequest(id).then(data => {
      console.log(data);
      lyric = data.lrc.lyric;
      if (!lyric) {
        currentLyric.current = null;
        return;
      }
      currentLyric.current = new Lyric(lyric, handleLyric);
      currentLyric.current.play();
      currentLineNum.current = 0;
      currentLyric.current.seek(0);
    }).catch(() => {
      // 歌词获取发生错误不影响正常播放
      songReady.current = true;
      audioRef.current.play();
    })
  }

  const handleLyric = ({ lineNum, txt }) => {
    if (!currentLyric.current) {
      return;
    }
    currentLineNum.current = lineNum;
    setPlayingLyric(txt);
  };

  return (
    <div>
      {/* 因为currentSong在store的初始值是空对象，所以为了
      避免报错，需先判断其是否为空 */}
      { isEmptyObject(currentSong) ? null :
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          percent={percent}
          toggleFullScreen={toggleFullScreenDispatch}
          togglePlayList={togglePlayListDispatch}
          clickPlaying={clickPlaying}
        />
      }
      {
        isEmptyObject(currentSong) ? null :
          <NormalPlayer
            song={currentSong}
            fullScreen={fullScreen}
            playing={playing}
            duration={duration}
            currentTime={currentTime}
            percent={percent}
            mode={mode}
            currentLyric={currentLyric.current}
            currentPlayingLyric={currentPlayingLyric}
            currentLineNum={currentLineNum.current}
            changeMode={changeMode}
            toggleFullScreen={toggleFullScreenDispatch}
            togglePlayList={togglePlayListDispatch}
            clickPlaying={clickPlaying}
            onProgressChange={onProgressChange}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />
      }
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      >
      </audio>
      <PlayList
        clearPreSong={clearPreSong}
      >
      </PlayList>
      <Toast text={modeText} ref={toastRef}></Toast>
    </div>
  );
}

// 映射Redux全局的state到props上
const mapStateToProps = (state) => ({
  fullScreen: state.getIn(['player', 'fullScreen']),
  playing: state.getIn(['player', 'playing']),
  currentSong: state.getIn(['player', 'currentSong']),
  showPlayList: state.getIn(['player', 'showPlayList']),
  mode: state.getIn(['player', 'mode']),
  currentIndex: state.getIn(['player', 'currentIndex']),
  playList: state.getIn(['player', 'playList']),
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player));