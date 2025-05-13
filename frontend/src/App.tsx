import React, {useEffect, useRef, useState} from 'react';
import type {IncommingPoints, Point} from "./types";

const App = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [color, setColor] = useState('#000000');
    const [isDrawing, setIsDrawing] = useState(false);

    const drawCircle = (x: number, y: number, color: string) => {
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.beginPath();
            context.fillStyle = color;
            context.arc(x, y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    };

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/canvas');

        ws.current.onmessage = (event) => {
            const decodedDraw = JSON.parse(event.data) as IncommingPoints;

            if (decodedDraw.type === 'INIT' || decodedDraw.type === 'NEW_POINT') {
                decodedDraw.payload.forEach((draw) => {
                    drawCircle(draw.x, draw.y, draw.color);
                });
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;
        setPoints((prevState) => [...prevState, {x, y, color}]);

        drawCircle(x, y, color);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !isDrawing) return;

        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;
        setPoints((prevState) => [...prevState, {x, y, color}]);

        drawCircle(x, y, color);
    };

    const handleMouseUp = () => {
        if(!ws.current) return;
        ws.current.send(JSON.stringify({ type: 'SET_POINT', payload: points }));
        setIsDrawing(false);
        setPoints([]);
    };

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600} style={{border: '1px solid black', marginTop: '10px'}}  onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
            <div>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}/>
            </div>
        </div>
    );
};

export default App;