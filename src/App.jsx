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
    canvas.width = 500;
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
      if (e.touches.length >= 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const distance = Math.sqrt(
          (touch1.clientX - touch2.clientX) ** 2 +
            (touch1.clientY - touch2.clientY) ** 2
        );

        if (initialPinchDistance === 0) {
          initialPinchDistance = distance;
          initialScale = getCtx.getTransform().a;
        }

        const scaleFactor = (distance / initialPinchDistance) * initialScale;

        // 캔버스에 스케일 적용
        canvas.style.transform = `scale(${scaleFactor})`;

        // 기본 핀치 줌 제스처 방지
        canvas.style.touchAction = "none";
      }
    };

    // 캔버스에 핀치 줌 이벤트 리스너 추가
    canvas.addEventListener("touchmove", handlePinch, { passive: false });

    return () => {
      // 이벤트 리스너 정리
      canvas.removeEventListener("touchmove", handlePinch);
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
    return isEraserMode ?"#EEEEEE" : "#000000"; // 펜 색상을 조절
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    ctx.beginPath(); // 새로운 경로 시작
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

    e.preventDefault();
    if (painting) {
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      ctx.strokeStyle = getPenColor(); // 펜의 색상 설정
    
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