// @ts-ignore
import WebOfficeSDK from "../sdk/web-office-sdk-solution-v2.0.6.es.js";
import { Wps, WpsInitParams } from "@/interface";
import { getType } from "@/utils";

export const initWPS = async ({
  fileId,
  fileName,
  appId,
  containerSelector,
  onInit,
  onReady,
  onError,
  isReadOnly,
  token,
  timeout,
  simple,
  refreshToken,
  trackRevisions = true,
  ...params
}: WpsInitParams) => {
  if (!fileId) return null;

  // 配置项
  const loadOptions = {
    workbench: {
      //增加编辑配置子项，文档头部工具栏及段落操作柄中才可选择使用该功能。
      editor: [
        "title",
        "heading",
        "fontSize",
        "bold",
        "italic",
        "underline",
        "deleteLine",
        "script",
        "colorStyle",
        "outlineList",
        "indent",
        "align",
        "find",
        "picture",
        "link",
        "blockquote",
        "horizonRule",
        "code",
        "inlineCode",
        "emoji",
        "table",
        "history",
      ],
      view: ["startTab", "mobileMenu", "contextMenu", "mobileReadMenu"],
    },
  };
  const officeType = getType(fileName || params.customArgs?.fileName);
  const options = {
    mode: simple ? "simple" : "normal",
    mount: document.querySelector(containerSelector),
    officeType,
    appId,
    fileId: fileId,
    token: timeout
      ? { token, timeout }
      : token || localStorage.getItem("token"),
    refreshToken,
    otlOptions: { loadOptions: JSON.stringify(loadOptions) },
    ...params,
  };
  // console.log("options", options);
  try {
    const wps: Wps = WebOfficeSDK.init(options);
    if (wps) {
      if (onInit) {
        onInit(wps);
      }
      await wps?.ready();
      const app = (await wps?.Application) as any;
      await app.ActiveDocument?.SetReadOnly(isReadOnly);
      if (onReady) {
        onReady(wps, app);
      }
      if (officeType === "w" && trackRevisions) {
        const TrackRevisions = await app.ActiveDocument.TrackRevisions;
        if (!TrackRevisions) {
          wps.executeCommandBar("ReviewTrackChanges");
        }
      }
      return { wps, app };
    }
  } catch (error) {
    console.error("WPS初始化失败:", error);
    onError?.(error);
    throw error;
  }

  return null;
};

export const saveDocument = async (wps: Wps) => {
  if (wps) {
    await wps.save();
  }
};

export const getWPSApplication = async (wps: Wps) => {
  if (wps) {
    return (await wps?.Application) as any;
  }
  return null;
};

export const setDocumentReadOnly = async (wps: Wps, isReadOnly: boolean) => {
  if (wps) {
    wps.ActiveDocument?.SetReadOnly(isReadOnly);
  }
};
