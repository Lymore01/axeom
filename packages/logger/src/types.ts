export interface Logger {
  info: (msg: string, obj?: any) => void;
  error: (msg: string, obj?: any) => void;
  warn: (msg: string, obj?: any) => void;
  debug: (msg: string, obj?: any) => void;
}
