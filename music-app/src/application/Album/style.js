import styled from 'styled-components';
import style from '../../assets/global-style';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${props => props.play > 0 ? "60px" : 0};
  z-index: 1000;
  background: ${style["background-color"]};
  transform-origin: right bottom;
  
  &.fly-enter, &.fly-appear {
    transform: rotateZ(30deg) translate3d(100%, 0, 0);
  }
  &.fly-enter-active, &.fly-appear-active {
    transition: transform .3s;
    transform: rotateZ(0deg) translate3d(0, 0, 0);
  }
  &.fly-exit {
    transform: rotateZ(0deg) translate3d(0, 0, 0);
  }
  &.fly-exit-active {
    transition: transform .3s;
    transform: rotateZ(30deg) translate3d(100%, 0, 0);
  }
`

export const TopDesc = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 275px;
  margin-bottom: 20px;
  padding: 5px 20px 50px 20px;
  background-size: 100%;
  .background {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: url(${props => props.background})left top no-repeat;
    transform: scale(1.5);
    filter: blur(20px);
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.2);
    }
  }
  .img_wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    .decorate {
      position: absolute;
      top: 0;
      width: 100%;
      height: 35px;
      border-radius: 3px;
      background: linear-gradient(hsla(0,0%,43%,.4),hsla(0,0%,100%,0));
    }
    .play_count {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: ${style["font-size-s"]};
      line-height: 15px;
      color: ${style["font-color-light"]};
      .play {
        vertical-align: top;
      }
    }
    img {
      width: 120px;
      height: 120px;
      border-radius: 3px;
    }
  }
  .desc_wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    height: 120px;
    padding: 0 10px;
    .title {
      max-height: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 700;
      font-size: ${style["font-size-l"]};
      line-height: 1.5;
      color: ${style["font-color-light"]};
    }
    .person {
      display: flex;
      .avatar {
        width: 20px;
        height: 20px;
        margin-right: 5px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .name {
        line-height: 20px;
        font-size: ${style["font-size-m"]};
        color: ${style["font-color-desc-v2"]};
      }
    }
  }
`

export const Menu = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  box-sizing: border-box;
  margin: -20px 30px 10px 30px;
  >div {
    display: flex;
    flex-direction: column;
    z-index: 1000;
    font-size: ${style["font-size-s"]};
    font-weight: 500;
    line-height: 20px;
    text-align: center;
    color: #3b1f1f;
    color: ${style["font-color-light"]};
    .iconfont {
      font-size: 20px;
    }
  }
`

export const SongList = styled.div`
  border-radius: 10px;
  opacity: 0.98;
  background: ${style["highlight-background-color"]};
  .first_line {
    position: relative;
    justify-content: space-between;
    box-sizing: border-box;
    margin-left: 10px;
    padding: 10px 0;
    border-bottom: 1px solid ${style["border-color"]};
    .play_all {
      display: inline-block;
      line-height: 24px;
      color: ${style["font-color-desc"]};
      .iconfont {
        margin-right: 10px;
        font-size: 24px;
        vertical-align: top;
      }
      .sum {
        font-size: ${style["font-size-s"]};
        color: ${style["font-color-desc-v2"]};
      }
      >span {
        vertical-align: top;
      }
    }
    .add_list, .isCollected {
      display: flex;
      align-items: center;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 130px;
      font-size: 0;
      line-height: 34px;
      vertical-align: top;
      background: ${style["theme-color"]};
      color: ${style["font-color-light"]};
      .iconfont {
        margin: 0 5px 0 10px;
        font-size: 10px;
        vertical-align: top;
      }
      span {
        font-size: 14px;
        line-height: 34px;
      }
      .isCollected {
        display: flex;
        background: ${style["background-color"]};
        color: ${style["font-color-desc"]};
      }
    }
  }
`

export const SongItem = styled.ul`
  >li {
    display: flex;
    align-items: center;
    height: 60px;
    .index {
      flex-basis: 60px;
      width: 60px;
      height: 60px;
      line-height: 60px;
      text-align: center;
    }
    .info {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-around;
      box-sizing: border-box;
      height: 100%;
      padding: 5px 0;
      border-bottom: 1px solid ${style ["border-color"]};
      ${style.noWrap ()}
      >span {
        ${style.noWrap ()}
      }
      >span:first-child {
        color: ${style ["font-color-desc"]};
      }
      >span:last-child {
        font-size: ${style ["font-size-s"]};
        color: #bba8a8;
      }
    }
  }
`