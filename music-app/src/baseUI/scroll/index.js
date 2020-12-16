import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';
import styled from 'styled-components';
import Loading from '../loading';
import LoadingV2 from '../loading-v2';
import { debounce } from '../../api/utils';

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const PullUpLoading = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  width: 60px;
  height: 60px;
  margin: auto;
  z-index: 100;
`;

export const PullDownLoading = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 30px;
  margin: auto;
  z-index: 100;
`;

/* 
函数式组件天生不具备被上层组件直接调用 ref 的条件，
因此需要用 React 当中一些特殊的方式来处理，
即使用 forwardRef 进行包裹。
*/
const Scroll = forwardRef((props, ref) => {
  const [bScroll, setBScroll] = useState();
  const scrollContainerRef = useRef();

  const { direction, click, refresh, pullUpLoading, pullDownLoading, bounceTop, bounceBottom } = props;
  const { pullUp, pullDown, onScroll } = props;

  let pullUpDebounce = useMemo(() => {
    return debounce(pullUp, 300)
  }, [pullUp]);
  
  let pullDownDebounce = useMemo(() => {
    return debounce(pullDown, 300)
  }, [pullDown]);


  const PullUpdisplayStyle = pullUpLoading ? { display: "block" } : { display: "none" };
  const PullDowndisplayStyle = pullDownLoading ? { display: "block" } : { display: "none" };

  useEffect(() => {
    const scroll = new BScroll(scrollContainerRef.current, {
      scrollX: direction === "horizental",
      scrollY: direction === "vertical",
      probeType: 3,
      click: click,
      bounce: {
        top: bounceTop,
        bottom: bounceBottom
      }
    });
    setBScroll(scroll);
    return () => {
      setBScroll(null);
    }
  }, []);

  // 每次重新渲染都要刷新实例，防止无法滑动
  useEffect(() => {
    if (refresh && bScroll) {
      bScroll.refresh();
    }
  });

  // 给实例绑定scroll事件
  useEffect(() => {
    if (!bScroll || !onScroll) {
      return;
    }
    bScroll.on('scroll', (scroll) => {
      onScroll(scroll);
    })
    return () => {
      bScroll.off('scroll');
    }
  }, [onScroll, bScroll]);

  // 进行上拉到底的判断，调用上拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullUp) {
      return;
    }
    bScroll.on('scrollEnd', () => {
      // 判断是否滑动到了底部
      if (bScroll.y <= bScroll.maxScrollY + 100) {
        pullUpDebounce();
      }
    });
    return () => {
      bScroll.off('scrollEnd');
    }
  }, [pullUp, pullUpDebounce, bScroll]);

  // 进行下拉的判断，调用下拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullDown) {
      return;
    }
    bScroll.on('touchEnd', (pos) => {
      // 判断用户的下拉动作
      if (pos.y > 50) {
        pullDownDebounce();
      }
    });
    return () => {
      bScroll.off('touchEnd');
    }
  }, [pullDown, pullDownDebounce, bScroll]);

  // 一般和forwardRef一起使用，ref已经在forwardRef中默认传入
  useImperativeHandle(ref, () => ({
    refresh() {
      if (bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },
    getBScroll() {
      if (bScroll) {
        return bScroll;
      }
    }
  }));

  return (
    // 此处添加ref是为了获取dom，在new BScroll时以这个作为包裹的父容器
    <ScrollContainer ref={scrollContainerRef}>
      {props.children}
      {/* 滑到底部加载动画 */}
      <PullUpLoading style={PullUpdisplayStyle}><Loading></Loading></PullUpLoading>
      <PullDownLoading style={PullDowndisplayStyle}><LoadingV2></LoadingV2></PullDownLoading>
    </ScrollContainer>
  );
})

Scroll.defaultProps = {
  direction: "vertical",
  click: true,
  refresh: true,
  onScroll: null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};

Scroll.propTypes = {
  direction: PropTypes.oneOf(['vertical', 'horizental']), // 滚动的方向
  refresh: PropTypes.bool, // 是否刷新
  onScroll: PropTypes.func, // 滑动触发的回调函数
  pullUp: PropTypes.func, // 上拉加载逻辑
  pullDown: PropTypes.func, // 下拉加载逻辑
  pullUpLoading: PropTypes.bool, // 是否显示上拉 loading 动画
  pullDownLoading: PropTypes.bool, // 是否显示下拉 loading 动画
  bounceTop: PropTypes.bool, // 是否支持向上吸顶
  bounceBottom: PropTypes.bool // 是否支持向下吸底
}

export default Scroll;