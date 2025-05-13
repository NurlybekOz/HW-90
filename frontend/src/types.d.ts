export interface Point {
    x: number;
    y: number;
    color: string;
}

export interface IncommingPoints {
    type: string;
    payload: Point[];
}