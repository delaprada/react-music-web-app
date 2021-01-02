import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import style from '../../assets/global-style';
import { prefixStyle } from '../../api/utils';
const transform = prefixStyle('transform');

const ProgressBarWrapper = styled.div`
  height:30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, .3);
    .progress {
      position: absolute;
      height: 100%;
      background: ${style["theme-color"]};
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid ${style["border-color"]};
        border-radius: 50%;
        background: ${style["theme-color"]};
      }
    }
  }
`;

function ProgressBar(props) {
  const progressBar = useRef();
  const progress = useRef();
  const progressBtn = useRef();
  const [touch, setTouch] = useState({});

  const { percent } = props;
  const { percentChange } = props;

  const progressBtnWidth = 16;

  //监听percent，让进度条根据播放进度发生变化
  useEffect(() => {
    if (percent >= 0 && percent <= 1 && !touch.initiated) {
      const barWidth = progressBar.current.clientWidth - progressBtnWidth;
      const offsetWidth = percent * barWidth;
      progress.current.style.width = `${offsetWidth}px`;
      progressBtn.current.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
    }
    // eslint-disable-next-line
  }, [percent]);

  const _offset = (offsetWidth) => {
    // 设置进度条长度为offsetWidth，按钮的x偏移量为offsetWidth
    progress.current.style.width = `${offsetWidth}px`;
    progressBtn.current.style.transform = `translate3d(${offsetWidth}px, 0, 0)`;
  };

  const progressTouchStart = (e) => {
    const startTouch = {};

    // 表示滑动动作开始
    startTouch.initiated = true;
    startTouch.startX = e.touches[0].pageX;
    startTouch.left = progress.current.clientWidth;
    setTouch(startTouch);
  };

  const progressTouchMove = (e) => {
    if (!touch.initiated) {
      return;
    }
    const deltaX = e.touches[0].pageX - touch.startX;

    // 进度条净宽度 = 进度条宽度 - 按钮宽度
    const barWidth = progressBar.current.clientWidth - progressBtnWidth;

    // 控制偏移量不会导致按钮超过进度条的最小（0）和最大（barWidth）范围
    const offsetWidth = Math.min(Math.max(0, touch.left + deltaX), barWidth);
    _offset(offsetWidth);
  };

  const progressTouchEnd = (e) => {
    // 深拷贝
    const endTouch = JSON.parse(JSON.stringify(touch));
    endTouch.initiated = false;
    setTouch(endTouch);
    _changePercent();
  };

  // 点击事件（与前面的拖动事件效果不同）
  const progressClick = (e) => {
    // 进度条当前长度，getBoundingClientRect可获取DOM元素到浏览器可视范围的距离
    const rect = progressBar.current.getBoundingClientRect();
    const offsetWidth = e.pageX - rect.left;
    _offset(offsetWidth);
    _changePercent();
  }

  const _changePercent = () => {
    const barWidth = progressBar.current.clientWidth - progressBtnWidth;
    const curPercent = progress.current.clientWidth / barWidth;

    // 把新的进度传给回调函数并执行
    percentChange(curPercent);
  }

  return (
    <ProgressBarWrapper>
      <div className="bar-inner"
        ref={progressBar}
        onClick={progressClick}
      >
        <div className="progress" ref={progress}></div>
        <div className="progress-btn-wrapper"
          ref={progressBtn}
          onTouchStart={progressTouchStart}
          onTouchMove={progressTouchMove}
          onTouchEnd={progressTouchEnd}
        >
          <div className="progress-btn"></div>
        </div>
      </div>
    </ProgressBarWrapper>
  );
}

export default ProgressBar;