export interface Point {
    x: number;
    y: number;
    color: string;
}

export interface IncomingMessage {
    type: string;
    payload: Point[];
}