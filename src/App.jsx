import React, { useRef, useEffect, useState } from "react";
import * as S from "./App.styles";

export default function App() {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [painting, setPainting] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 300;
    canvas.height = 500;

    /**  HTML5 캔버스 요소에 그림을 그리거나 수정하는 데 사용하는 그래픽 객체 */
    const context = canvas.getContext("2d");

    context.fillStyle = "#EEEEEE";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.fillRect(0, 0, canvas.width, canvas.height);
    setCtx(context);

    /** 두 손가락 간의 거리를 추적 */
    let initialPinchDistance = 0;
    /** X 축 방향 스케일을 측정하고 초기화. 현재 스케일과 초기 스케일을 비교하여 확대 또는 축소 동작을 결정하는 데 사용 */
    let initialScale = 1;

    // 핀치 줌 처리
    const handlePinch = (e) => {
      e.preventDefault();

      if (e.touches.length >= 2) {
        setPainting(false);
        /** 화면에 닿은 두 손가락의 좌표 정보 */
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        /** 두 손가락 사이의 거리를 계산 -> 두 점 사이의 유클리드 거리를 계산하는 공식 */
        const distance = Math.sqrt(
          (touch1.clientX - touch2.clientX) ** 2 +
            (touch1.clientY - touch2.clientY) ** 2
        );

        /** 초기 핀치 거리(initialPinchDistance)가 0인 경우에만 초기화를 수행.
         * 이것은 핀치 동작을 처음 시작할 때만 실행되며, 이전 상태와 현재 상태를 비교하기 위해 사용 */
        if (initialPinchDistance === 0) {
          initialPinchDistance = distance;
          /** getTransform(): 현재 캔버스의 변환 매트릭스 정보를 반환. 이 매트릭스에는 이동, 회전, 스케일 및 기타 변환 정보가 포함됨. */
          /** .a : 현재 캔버스의 X 축 방향 스케일 */
          initialScale = ctx.getTransform().a;
        }

        /** 현재 핀치 거리와 초기 핀치 거리 간의 비율을 계산  */
        const scaleFactor = (distance / initialPinchDistance) * initialScale;
        /**  scaleFactor에 따라 캔버스가 확대 또는 축소 */
        canvas.style.transform = `scale(${scaleFactor})`;
      }
    };

    /** "touchmove" 이벤트가 발생할 때 handlePinch 함수를 호출 , 스크롤 동작과의 충돌 방지 */
    canvas.addEventListener("touchmove", handlePinch, { passive: false });

    return () => {
      canvas.removeEventListener("touchmove", handlePinch, { passive: false });
    };
  }, [ctx, scaleFactor]);

  /** 상대적인 좌표로 변환하는 역할 */
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;

    /** 캔버스의 현재 위치와 크기 정보를 가져옴 */
    const canvasRect = canvas.getBoundingClientRect();

    /** 캔버스의 가로와 세로 크기를 현재 크기로 나누어서 스케일 요인을 계산 */
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    /** 사용자의 X 좌표와 Y 좌표를 가져옴 */
    /** 마우스 이벤트와 터치 이벤트 모두를 처리하기 위해 조건부로 작동 */
    /** 먼저 e.clientX 값을 확인하고, 만약 없으면(터치 이벤트인 경우) 첫 번째 터치 이벤트의 clientX 값을 가져옴 */
    const clientX = (e.clientX || e.touches[0].clientX) - canvasRect.left;
    const clientY = (e.clientY || e.touches[0].clientY) - canvasRect.top;

    /** 상대적인 좌표로 변환 */
    const canvasX = clientX * scaleX;
    const canvasY = clientY * scaleY;

    return { x: canvasX, y: canvasY };
  };

  /** 그리기 시작 위치*/
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setPainting(true);

    e.preventDefault();
  };

  /** 그리기 진행 */
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCanvasCoordinates(e);

    e.preventDefault();

    if (painting) {
      ctx.strokeStyle = getPenColor();
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  /** 그리기 끝 */
  const handleMouseUp = () => {
    setPainting(false);
  };

  /** 지우개 || 필기 모드 펜 컬러 */
  const getPenColor = () => {
    return isEraserMode ? "#EEEEEE" : "#000000";
  };

  /** 지우개<->필기 모드 변환 */
  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
  };

  /** 캔버스 전체 지우기 */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <S.NoteContainer>
      <div>
        <canvas
          style={{
            cursor: "pointer",
            transform: `scale(${scaleFactor})`,
          }}
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
