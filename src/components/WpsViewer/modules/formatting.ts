import { getLatestRevisionDate, getRevisionByDate, delay } from "./common";
import { handleMatchingRevisions } from "./revisions";

export const getDocLength = async (app: any) => {
  const DocumentRange = await app.ActiveDocument.GetDocumentRange();
  const End = await DocumentRange.End;
  return End - 8;
};

/**
 * 清空文档所有内容（使用 selection 选中全文后删除）
 * @param app WPS Application 实例
 * @example
 * ```typescript
 * await clearAllText(app);
 * ```
 */
export const clearAllText = async (app: any) => {
  try {
    const length = await getDocLength(app);
    // console.log("length", length);
    const range = await app?.ActiveDocument?.Range(0, length);
    // 获取选中文本
    const text = await range.Text;
    range.Text = "";
    return text;
  } catch (error) {
    console.error("清空文档失败:", error);
    throw error;
  }
};

export const formatDocumentFont = async (app: any, font: string) => {
  const length = await getDocLength(app);
  const range = app?.ActiveDocument?.Range(0, length);
  range.Font.Name = font;
  await delay(300);
  const now = new Date().getTime();
  const date = await getLatestRevisionDate(app);
  if (now - new Date(date).getTime() > 2000) return;
  const revisions = await getRevisionByDate(app, date);
  await handleMatchingRevisions(revisions, "accept");
};
