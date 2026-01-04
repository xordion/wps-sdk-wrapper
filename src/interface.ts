export interface Wps {
  // 常用的列一列
  Application: WpsApplication;
  WordApplication?: () => WpsApplication;
  PDFApplication?: () => WpsApplication;
  ExcelApplication?: () => WpsApplication;
  // 其他函数、属性
  [key: string]: any;
}

// wps 实例类型
export type WpsApplication = any;

export interface WpsToken {
  token: string;
  timeout: number;
}

export interface WpsOptions {
  mode?: "normal" | "simple";
  commonOptions?: {
    isShowTopArea?: boolean;
    isShowHeader?: boolean;
    isBrowserViewFullscreen?: boolean;
    isIframeViewFullscreen?: boolean;
  };
  wordOptions?: {
    isShowDocMap?: boolean;
    isBestScale?: boolean;
    isShowBottomStatusBar?: boolean;
    mobile?: {
      isOpenIntoEdit?: boolean;
    };
  };
  pdfOptions?: {
    isShowComment?: boolean;
    isInSafeMode?: boolean;
    isShowBottomStatusBar?: boolean;
  };
  pptOptions?: {
    isShowBottomStatusBar?: boolean;
    mobile?: {
      isOpenIntoEdit?: boolean;
    };
  };
  commandBars?: WpsCommandBar[];
  [key: string]: any;
}

export interface WpsCommandBar {
  cmdId?: string;
  attributes?: {
    name?: string;
    visible?: boolean;
    [key: string]: any;
  }[];
  [key: string]: any;
}


export interface WpsInitParams {
  fileId: string | null;
  fileName?: string;
  appId: string;
  containerSelector: string;
  onInit?: (wps: Wps) => void;
  onReady?: (wps: Wps, app: any) => void;
  isReadOnly?: boolean;
  token?: string;
  timeout?: number;
  simple?: boolean;
  onError?: (error: any) => void;
  refreshToken?: () => Promise<WpsToken>;
  trackRevisions?: boolean;
  [key: string]: any;
}
