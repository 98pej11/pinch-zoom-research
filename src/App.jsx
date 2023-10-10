import React, { useRef, useEffect, useState } from "react";
import * as S from "./App.styles";

export default function App() {
  const canvasRef = useRef(null);
  const [getCtx, setGetCtx] = useState(null);
  const [painting, setPainting] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false); // 추가: 지우개 모드 상태

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 캔버스 크기 설정
    canvas.width = 300;
    canvas.height = 500;

    // 배경색 설정
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000000";
    setGetCtx(ctx);

    // 핀치 줌 초기 변수 설정
    let initialPinchDistance = 0;
    let initialScale = 1;

    // 핀치 줌 처리
    const handlePinch = (e) => {
      // 필기 중지
      setPainting(false);
      if (e.touches.length >= 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const distance = Math.sqrt(
          (touch1.clientX - touch2.clientX) ** 2 +
            (touch1.clientY - touch2.clientY) ** 2
        );

        if (initialPinchDistance === 0) {
          initialPinchDistance = distance;
          initialScale =
            parseFloat(
              canvas.style.transform.replace("scale(", "").replace(")", "")
            ) || 1;
        }

        const scaleFactor = (distance / initialPinchDistance) * initialScale;

        // 캔버스에 스케일 적용
        canvas.style.transform = `scale(${scaleFactor})`;

        // 기본 핀치 줌 제스처 방지
        canvas.style.touchAction = "none";
      }
    };
    return () => {
      // Clean up event listeners
      canvas.removeEventListener("touchmove", handlePinch);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [getCtx]);

  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getPenColor = () => {
    // 지우개 모드일 때는 배경색과 같은 회색으로 설정
    return isEraserMode ? "#EEEEEE" : "#000000"; // 펜 색상을 조절
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calculate the canvas's position and offset within the page
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = canvasRect.left;
    const offsetY = canvasRect.top;

    // Adjust the client coordinates based on the canvas position
    const clientX = (e.clientX || e.touches[0].clientX) - offsetX;
    const clientY = (e.clientY || e.touches[0].clientY) - offsetY;

    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
    setPainting(true);

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setPainting(false);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calculate the canvas's position and offset within the page
    const canvasRect = canvas.getBoundingClientRect();
    const offsetX = canvasRect.left;
    const offsetY = canvasRect.top;

    e.preventDefault();

    if (painting) {
      // Adjust the client coordinates based on the canvas position
      const clientX = (e.clientX || e.touches[0].clientX) - offsetX;
      const clientY = (e.clientY || e.touches[0].clientY) - offsetY;

      ctx.strokeStyle = getPenColor();
      ctx.lineTo(clientX, clientY);
      ctx.stroke();
    }
  };

  return (
    <S.NoteContainer>
      <div>
        <canvas
          className="canvas"
          style={{ margin: "3%", cursor: "pointer" }}
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={startDrawing}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleMouseMove}
        ></canvas>
      </div>

      <S.ButtonBox>
        <button onClick={toggleEraserMode}>
          {isEraserMode ? "필기 모드 전환" : "지우개 모드 전환"}
        </button>
        <button onClick={clearCanvas}>전체 지우기</button>
      </S.ButtonBox>
    </S.NoteContainer>
  );
}
