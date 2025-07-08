declare module 'react-native-chart-kit';

// React Native Video declarations
declare module 'react-native-video' {
  interface VideoProperties {
    source: any;
    style?: any;
    resizeMode?: string;
    onLoad?: (data: any) => void;
    onProgress?: (data: any) => void;
    onEnd?: () => void;
    paused?: boolean;
    repeat?: boolean;
    volume?: number;
    muted?: boolean;
  }

  export default class Video extends React.Component<VideoProperties> {}
}

// React Native SVG Charts
declare module 'react-native-svg-charts' {
  export interface ChartData {
    value: number;
    label?: string;
    color?: string;
  }

  export interface LineChartProps {
    data: number[];
    width?: number;
    height?: number;
    chartConfig?: any;
    style?: any;
  }

  export class LineChart extends React.Component<LineChartProps> {}
  export class BarChart extends React.Component<any> {}
  export class PieChart extends React.Component<any> {}
  export class AreaChart extends React.Component<any> {}
}

// Daily.co types
declare module '@daily-co/react-native-daily-js' {
  export interface DailyCall {
    join(options?: any): Promise<void>;
    leave(): Promise<void>;
    destroy(): Promise<void>;
    startCamera(): Promise<void>;
    stopCamera(): Promise<void>;
    setLocalAudio(enabled: boolean): Promise<void>;
    setLocalVideo(enabled: boolean): Promise<void>;
    participants(): any;
    localParticipant(): any;
    sendAppMessage(message: any): void;
    DailyMediaView?: any;
    on(event: string, handler: (event?: any) => void): void;
    off(event: string, handler: (event?: any) => void): void;
    meetingState(): DailyMeetingState | null;
    callClientId?: string;
    iframe?: any;
    isDestroyed?: boolean;
    loadCss?: any;
  }

  export interface DailyCallOptions {
    url?: string;
    token?: string;
    userName?: string;
  }

  export interface DailyMeetingState {
    meetingState: 'new' | 'loading' | 'loaded' | 'joining' | 'joined' | 'left' | 'error';
  }

  export type DailyEvent = 
    | 'joining-meeting'
    | 'joined-meeting'
    | 'left-meeting'
    | 'participant-joined'
    | 'participant-left'
    | 'participant-updated'
    | 'error';

  export function createCallObject(options?: DailyCallOptions): DailyCall;
  export const DailyMediaView: any;

  export function createDailyCall(options?: DailyCallOptions): DailyCall;
}

// Background Timer
declare module 'react-native-background-timer' {
  export default class BackgroundTimer {
    static setTimeout(callback: () => void, delay: number): number;
    static clearTimeout(timeoutId: number): void;
    static setInterval(callback: () => void, delay: number): number;
    static clearInterval(intervalId: number): void;
    static start(delay?: number): void;
    static stop(): void;
  }
} 