import React, { useState } from "react";
import Style from "../styles/player.module.css";
import PlayIcon from "./assets/play.svg";
import PauseIcon from "./assets/pause.svg";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);
let audioSource = null;

let size = { height: 70, width: 510 };
//let margin = [];
let padding = [6];
let borderSize = 4;

//Render Implementation
const Player = ({ serial }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const properties = { isPlaying: isPlaying };
  const { playOrPause, visualize } = playerFunctions(
    setIsPlaying,
    serial,
    properties
  );
  return (
    <PlayerContainer serial={serial}>
      <PlayerComponent serial={serial}>
        <PlayPauseButton isPlaying={isPlaying} setIsPlaying={playOrPause} />
        <SliderContainer>
          <Slider serial={serial}>
            <Visualizer serial={serial} />
          </Slider>
        </SliderContainer>
        <audio style={{ hidden: true }} src="/test.mp3"></audio>
      </PlayerComponent>
    </PlayerContainer>
  );
};

const playerFunctions = (setIsPlaying, serial, properties) => {
  let functions = {};

  functions.playOrPause = (truthy) => {
    let player = document.getElementById(`player_${serial}`).children[0];
    let playPauseButton = player.children[0];
    let audioElement = player.children[2];
    let slider = player.children[1].children[0];
    let sliderContainer = player.children[1];

    let size = slider.offsetWidth / sliderContainer.offsetWidth;

    if (truthy) {
      player.parentElement.style.boxShadow = "0 0 10px rgb(242, 218, 123)";
      playPauseButton.style.backgroundColor = "rgb(228, 169, 60)";
      player.style.backgroundColor = "rgb(242, 218, 123)";

      audioElement.play();
      audioElement.onplay = () => audioCtx.resume();

      if (!audioSource) {
        audioSource = audioCtx.createMediaElementSource(audioElement);
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        functions.visualize();
      }

      audioElement.volume = size > 1 ? 1 : size;
    } else {
      player.parentElement.style.boxShadow = "0 0 10px rgb(32, 192, 104)";
      playPauseButton.style.backgroundColor = "rgb(60, 228, 136)";
      player.style.backgroundColor = "rgb(32, 192, 104)";
      (function myLoop(i) {
        if (--i && audioElement.volume - 0.01 > 0 && properties.isPlaying) {
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
    var canvas = document.getElementById("visualizer_" + serial);
    let canvasCtx = canvas.getContext("2d");

    requestAnimationFrame(functions.visualize);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgba(157, 157, 157)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(242, 225, 158)";

    canvasCtx.beginPath();

    let sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
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
    if (isDrag && clientX >= slider.offsetLeft - 10) {
      let size =
        ((clientX - slider.offsetLeft) /
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
        maxWidth: size.height - borderSize * 2 - padding[0] * 2 + "px",
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
    <canvas
      id={"visualizer_" + serial}
      style={{ height: "100%", width: 430 }}
    ></canvas>
  );
};
export default Player;
