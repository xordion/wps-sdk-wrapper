import { getLatestRevisionDate, getRevisionByDate, delay } from "./common";
import { handleMatchingRevisions } from "./revisions";

/**
 * @deprecated Prefer feature APIs such as `clearAllText` / `formatDocumentFont` instead of direct length dependency. 建议优先使用业务 API（如 `clearAllText` / `formatDocumentFont`）。
 */
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

const SERIAL_PREFIX_PATTERNS: RegExp[] = [
  /^[\t\u00A0\u2000-\u200B\uFEFF]+/u,
  /^\d{1,4}(?:[\.．]\d{1,4}){0,3}[\.\u3001\uFF0E)）:：．]\s*/u,
  /^[\uFF10-\uFF19]{1,4}(?:[\.．][\uFF10-\uFF19]{1,4}){0,3}[\.\u3001\uFF0E)）:：．]\s*/u,
  /^[（(]\d{1,4}[)）]\s*/u,
  /^[（(][\uFF10-\uFF19]{1,4}[)）]\s*/u,
  /^[\u2460-\u2473]\s*/u,
  /^[\u24EA]\s*/u,
  /^[\u2474-\u2487]\s*/u,
  /^第[0-9一二三四五六七八九十百千万〇两零\d]+[条款項章节節]\s*/u,
  /^[a-zA-Z][\.\)、．]\s*/u,
];

const stripLeadingSerialsOneLine = (line: string): string => {
  let text = line;
  for (let index = 0; index < 16; index += 1) {
    text = text.replace(/^\s+/, "");
    let matched = false;
    for (const pattern of SERIAL_PREFIX_PATTERNS) {
      const next = text.replace(pattern, "");
      if (next !== text) {
        text = next;
        matched = true;
        break;
      }
    }
    if (!matched) {
      break;
    }
  }
  return text;
};

/**
 * Normalize copied clause text before search/insert so line-leading serial markers
 * do not affect WPS document matching.
 */
export const formatSearchTextForDocMatch = (input: string): string => {
  if (!input) return input;
  return input
    .split(/\r?\n/)
    .map((line) => stripLeadingSerialsOneLine(line))
    .join("\n")
    .trim();
};
