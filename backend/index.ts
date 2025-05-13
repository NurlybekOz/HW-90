import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';
import {IncomingMessage, Point} from './types';

const app = express();
const port = 8000;
const wsInstance = expressWs(app);

app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);
const connectedClients: WebSocket[] = [];
const points: Point[] = [];

router.ws('/canvas', (ws, req) => {
    console.log('client connected');
    connectedClients.push(ws);
    console.log('Total connections: ' + connectedClients.length);
    ws.send(JSON.stringify({type: 'INIT', payload: points}));

    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

            if(decodedMessage.type === 'SET_POINT') {
                const newPoint = decodedMessage.payload;
                points.push(...newPoint);
                connectedClients.forEach((clientWs) => {
                    clientWs.send(JSON.stringify({
                        type: 'NEW_POINT',
                        payload: decodedMessage.payload,
                    }));
                });
            }

        } catch (e) {
            ws.send(JSON.stringify({type: 'ERROR', payload: 'Invalid message'}));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1);
        console.log('Total connections: ' + connectedClients.length);
    });
});

app.use(router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});