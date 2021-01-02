import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import style from '../../assets/global-style';

const ToastWrapper = styled.div`
  position: fixed;
  bottom: 0;
  z-index: 1000;
  width: 100%;
  height: 50px;
  /* background: ${style["highlight-background-color"]}; */
  &.drop-enter{
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  &.drop-enter-active{
    opacity: 1;
    transition: all 0.3s;
    transform: translate3d(0, 0, 0);
  }
  &.drop-exit-active{
    opacity: 0;
    transition: all 0.3s;
    transform: translate3d(0, 100%, 0);
  }
  .text{
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-size: ${style["font-size-l"]};
  }
`;

// 外面组件需要拿到这个函数组件的ref，所以需要使用forwardRef
const Toast = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState('');

  const { text } = props;

  // 外部组件要拿到函数组件ref的方法，所以要使用useImperativeHandle这个hook
  useImperativeHandle(ref, () => ({
    show() {
      // 防抖处理
      // 实现效果为：若频繁点击，则不将show设为false
      if(timer) {
        clearTimeout(timer);
      }
      setShow(true);
      setTimer(setTimeout(() => {
        setShow(false);
      }, 3000));
    }
  }));

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="drop"
      unmountOnExit
    >
      <ToastWrapper>
        <div className="text">{text}</div>
      </ToastWrapper>
    </CSSTransition>
  )
});

export default React.memo(Toast);