import React, { useState } from "react";
import Style from "../styles/player.module.css";
import PlayIcon from "./assets/play.svg";
import PauseIcon from "./assets/pause.svg";
import PreviousIcon from "./assets/previous.svg";
import SkipIcon from "./assets/skip.svg";
let size = {};
let padding = [null];
let borderSize = null;

//Render Implementation
const Player = ({ Style, serial, src, img, title }) => {
  size = { height: Style.height, width: Style.width };
  padding = Style.padding;
  borderSize = Style.borderSize;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInit, setIsInit] = useState(null);
  const properties = {
    isInit: isInit,
    isPlaying: isPlaying,
    serial: serial,
    canvasCtx: null,
  };
  const callbacks = { setIsInit: setIsInit, setIsPlaying: setIsPlaying };
  const { playOrPause } = playerFunctions(callbacks, properties);
  return (
    <AudioPlayer>
      <JumboTron img={img} title={title} serial={serial} />
      <PlayerContainer serial={serial}>
        <PlayerComponent serial={serial}>
          <PlayPauseButton isPlaying={isPlaying} setIsPlaying={playOrPause} />
          <SliderContainer>
            <Slider serial={serial}>
              <Visualizer serial={serial} />
            </Slider>
          </SliderContainer>
          <audio style={{ hidden: true }} src={`/${src}.mp3`}></audio>
        </PlayerComponent>
      </PlayerContainer>
    </AudioPlayer>
  );
};

const playerFunctions = ({ setIsInit, setIsPlaying }, { isInit, serial }) => {
  let functions = {};

  functions.playOrPause = (truthy) => {
    let player = document.getElementById(`player_${serial}`).children[0];
    let playPauseButton = player.children[0];
    let audioElement = player.children[2];
    let slider = player.children[1].children[0];
    let sliderContainer = player.children[1];
    let size = slider.offsetWidth / sliderContainer.offsetWidth;

    if (!isInit) {
      let canvas = document.getElementById("visualizer_" + serial);

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      let canvasCtx = canvas.getContext("2d");
      let audioSource = audioCtx.createMediaElementSource(audioElement);
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);

      setIsInit({ canvasCtx, audioCtx, analyser, dataArray, bufferLength });
      isInit = { canvasCtx, audioCtx, analyser, dataArray, bufferLength };
      functions.visualize();
    }

    if (truthy) {
      const { canvasCtx, audioCtx } = isInit;
      playPauseButton.style.backgroundColor = "rgb(268, 225, 40)";
      playPauseButton.style.boxShadow = "rgb(228, 200, 40) -2px 2px 7px inset";
      player.children[1].style.background = "rgb(253, 225, 0)";
      player.children[1].style.boxShadow =
        "rgb(193, 150, 0) -10px 10px 24px inset";
      player.children[1].children[0].children[0].style.background = `linear-gradient(0deg, rgba(83,83,83,0) 0%, rgba(242, 218, 123, 0.08) 46%, rgba(83,83,83,0) 100%)`;
      player.parentElement.parentElement.children[0].style.boxShadow =
        "0 0 24px rgb(242, 218, 123)";
      player.parentElement.parentElement.children[0].children[0].style.backgroundColor = `rgba(242, 218, 123, 0.6)`;
      player.style.boxShadow = "0 0 24px rgb(242, 218, 123)";

      player.style.backgroundColor = "rgb(242, 218, 123)";
      canvasCtx.strokeStyle = "rgb(242, 225, 158)";
      audioElement.play();
      audioElement.onplay = () => audioCtx.resume();

      audioElement.volume = size > 1 ? 1 : size;
    } else {
      const { canvasCtx } = isInit;
      player.children[1].style.background = "rgb(17, 100, 56)";
      player.children[1].style.boxShadow =
        " inset -10px 10px 24px rgb(8, 68, 35)";
      playPauseButton.style.boxShadow = "inset -2px 2px 7px rgb(26, 151, 82)";
      player.children[1].children[0].children[0].style.background = `linear-gradient(0deg, rgba(83,83,83,0) 0%, rgba(60, 228, 136, 0.08) 46%, rgba(83,83,83,0) 100%)`;
      player.parentElement.parentElement.children[0].children[0].style.backgroundColor = `rgba(32, 192, 104, 0.6)`;
      player.parentElement.parentElement.children[0].style.boxShadow =
        "0 0 10px rgb(32, 192, 104)";
      player.style.boxShadow = "0 0 10px rgb(32, 192, 104)";
      playPauseButton.style.backgroundColor = "rgb(60, 228, 136)";
      player.style.backgroundColor = "rgb(32, 192, 104)";
      canvasCtx.strokeStyle = "rgb(116, 255, 179)";
      (function myLoop(i) {
        if (--i && audioElement.volume - 0.01 > 0) {
          setTimeout(function () {
            audioElement.volume -= 0.01;

            myLoop(i);
          }, 10);
        } else {
          audioElement.volume = 0;
          audioElement.pause();
          return;
        }
      })(100);
    }
    setIsPlaying(truthy);
  };

  functions.visualize = () => {
    let canvas = document.getElementById("visualizer_" + serial);
    requestAnimationFrame(functions.visualize);
    const { analyser, dataArray, canvasCtx, bufferLength } = isInit;
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = " rgb(75, 75, 75)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    //canvasCtx.strokeStyle = "rgb(242, 225, 158)";

    canvasCtx.beginPath();

    let sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = Math.pow(dataArray[i] / 128.0, 0.4);
      let y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };
  return functions;
};
//Component Details
const AudioPlayer = ({ children }) => {
  return (
    <div
      className={Style["audio-player"]}
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        margin: "0px 10px 0px",
      }}
      onMouseEnter={(e) => console.log(e.target)}
    >
      {children}
    </div>
  );
};
const JumboTron = ({ children, serial, img, title }) => {
  return (
    <div
      id={"jumbo_player_" + serial}
      style={{
        height: size.width + "px",
        width: size.width - padding[0] * 2 + "px",
        transform: `translateY(${padding[0] - 4 + size.height / 2}px)`,
      }}
      className={Style["jumbo_player"]}
      onMouseEnter={() => {
        document.getElementById(`player-title-${serial}`).style.opacity = 1;
      }}
      onTouchEnd={() => {
        document.getElementById(`player-title-${serial}`).style.opacity = 1;
        setTimeout(() => {
          document.getElementById(`player-title-${serial}`).style.opacity = 0;
        }, 2000);
      }}
      onMouseLeave={() => {
        document.getElementById(`player-title-${serial}`).style.opacity = 0;
      }}
    >
      <div
        className={Style["jumbo_tron_overlay"]}
        style={{
          position: "absolute",
          height: size.width + "px",
          width: size.width - padding[0] * 2 + "px",
        }}
      />
      <p
        id={`player-title-${serial}`}
        style={{
          pointerEvents: "none",
          textAlign: "center",
          width: "100%",
          height: "100%",
          marginTop: "5%",
          zIndex: 4,
          fontSize: "150%",
          position: "absolute",
          color: "white",
          opacity: "0",
        }}
      >
        {title}
      </p>
      <img style={{ height: "100%", width: "100%" }} src={`/${img}.jpg`} />
    </div>
  );
};
const PlayerContainer = ({ children, serial }) => {
  return (
    <div
      id={"player_" + serial}
      style={{
        padding: padding[0] + "px",
        height: size.height + "px",
        width: size.width + "px",
        borderWidth: borderSize,
      }}
      className={Style["player-container"]}
    >
      {children}
    </div>
  );
};

const PlayerComponent = ({ children, serial }) => {
  let isDrag = false;
  const resize = (clientX) => {
    let player = document.getElementById(`player_${serial}`).children[0];
    let playPauseButton = player.children[0];
    let slider = player.children[1].children[0];
    let audioElement = player.children[2];
    if (isDrag && clientX >= slider.getBoundingClientRect().left - 10) {
      let size =
        ((clientX - slider.getBoundingClientRect().left) /
          (player.offsetWidth - playPauseButton.offsetWidth - 10)) *
        100;
      slider.style.width = size > 0.1 ? size + "%" : 0 + "%";
      if (size >= 0 && size <= 100)
        audioElement.volume = size / 100 > 0.01 ? size / 100 : 0;
    }
  };
  return (
    <div
      className={Style["player-component"]}
      onMouseDown={(e) => (isDrag = true)}
      onMouseUp={(e) => (isDrag = false)}
      onMouseMove={(e) => resize(e.clientX)}
      onTouchMove={(e) => {
        isDrag = true;

        resize(e.touches[0].clientX);
      }}
      onTouchEnd={() => {
        isDrag = false;
      }}
    >
      {children}
      {}
    </div>
  );
};

const PlayPauseButton = ({ isPlaying, setIsPlaying }) => {
  let Status = !isPlaying ? PlayIcon : PauseIcon;

  return (
    <div
      style={{
        height: "100%",
        width: size.height + "px",
        maxWidth: size.height - padding[0] * 2 + "px",
      }}
      className={Style["play-pause-button"]}
      onMouseDown={(e) => setIsPlaying(!isPlaying, e.clientX)}
    >
      <Status />
    </div>
  );
};

const SliderContainer = ({ children }) => {
  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className={Style["slider-container"]}
    >
      {children}
    </div>
  );
};

const Slider = ({ children }) => {
  [0];
  return (
    <div style={{ height: "100%", width: "100%" }} className={Style["slider"]}>
      {children}
    </div>
  );
};

const Visualizer = ({ serial }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          boxShadow: `inset 0px 0px 30px rgba(0, 0, 0, 0.6)`,
          background: `linear-gradient(0deg, rgba(83,83,83,0) 0%, rgba(60, 228, 136, 0.06) 46%, rgba(83,83,83,0) 100%)`,
        }}
      ></div>
      <canvas
        id={"visualizer_" + serial}
        style={{
          height: "100%",
          width: "100%",
        }}
      ></canvas>
    </>
  );
};
export default Player;
