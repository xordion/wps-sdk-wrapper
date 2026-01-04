import { getLatestRevisionDate, getRevisionByDate } from "./common";

export const clearHitHighlight = (app: any) => {
  if (app) {
    app?.ActiveDocument?.Find?.ClearHitHighlight();
  }
};

export const highlightText = async (app: any, pos: number, length: number) => {
  try {
    if (!app) return false;
    await clearHitHighlight(app);
    const range = await app.ActiveDocument.Range.SetRange(pos, pos + length);
    return false;
  } catch (error) {
    console.error("高亮文本失败:", error);
    return false;
  }
};

export const highlightByRange = async (
  app: any,
  pos: number,
  length: number
) => {
  const range = app?.ActiveDocument?.Range?.SetRange(pos, pos + length);
  await app?.ActiveDocument?.ActiveWindow?.ScrollIntoView(range);
  app?.ActiveDocument?.Range?.SetRange(pos, pos + length);
  return { pos, length };
};

// 重新导出 common 中的颜色方法
export { coloringTextByRange, setInputColor } from './common';

export const coloringTextByRevision = async (app: any, revisions: any, color: string = '#0000ff') => {
  const { coloringTextByRange } = await import('./common');
  for (const info of revisions) {
    const { start, text } = info;
    await coloringTextByRange(app, {start, end: start + text.length}, color);
  }
}

export const coloredOnChange = (wps: any, color: string = '#0000ff') => {
  const handler = async (data: any) => {
    try {
      // console.log("WindowSelectionChange: ", data);
      const now = new Date().getTime();
      const latestRevisionDate = await getLatestRevisionDate(wps.Application);
      if (now - new Date(latestRevisionDate).getTime() > 1000) return;
      
      const currentRevisions =
        (await getRevisionByDate(wps.Application, latestRevisionDate)) || [];
      await coloringTextByRevision(wps.Application, currentRevisions, color);
    } catch (error) {
      console.warn('coloredOnChange handler 执行失败:', error);
    }
  };

  wps.ApiEvent.AddApiEventListener("WindowSelectionChange", handler);
  
  // 返回清除函数
  return () => {
    try {
      wps.ApiEvent.RemoveApiEventListener("WindowSelectionChange", handler);
    } catch (error) {
      console.warn('移除事件监听器失败:', error);
    }
  };
};
