import { Wps, WpsApplication } from "@/interface";
import { generateRandomString } from "./utils";
import { getLatestRevisionDate } from "./common";
import { coloringTextByRange, setInputColor } from "./common";
import { searchAndLocateText } from "./search";
/**
 * @deprecated Use `handleInsertText(app, { insert })` instead. 请改用 `handleInsertText(app, { insert })`。
 */
export const insertTextAtCursor = async (app: WpsApplication, text: string) => {
  try {
    const selection = await app.ActiveDocument.ActiveWindow.Selection;
    if (selection) {
      await selection.InsertAfter(text);
      return true;
    } else {
      // 备选方案：在文档末尾添加文本
      const range = app?.ActiveDocument?.Range;
      if (range) {
        const endRange = range.SetRange(range.End, range.End);
        endRange.Text = text;
      }
    }
    return false;
  } catch (error) {
    console.error("在光标位置插入文本失败:", error);
    return false;
  }
};

/**
 * @deprecated Use \navigateTopMatch` + `handleInsertText` instead (query & select -> insert). 请改用 `navigateTopMatch` + `handleInsertText`（查询 + 选中 -> 插入文本）。`
 */
export const replaceOriginalContent = async (
  app: Wps,
  origin: string = "",
  replace: string = "",
  pos: number,
  len: number,
  isHighlight: boolean = false
) => {
  const bookmarks = await app?.ActiveDocument?.Bookmarks;
  const name = generateRandomString(8);
  await bookmarks.Add({
    Name: name,
    Range: {
      Start: pos,
      End: pos + len,
    },
  });

  const isReplaceSuccess = await bookmarks.ReplaceBookmark([
    {
      name: name,
      type: "text",
      value: replace,
    },
  ]);

  if (isHighlight) {
    await coloringTextByRange(app, { start: pos, end: pos + len });
  }

  const date = await getLatestRevisionDate(app);
  return { success: isReplaceSuccess, modifyDate: date };
};

export const handleInsertText = async (
  app: WpsApplication,
  { text, insert }: { text?: string; insert: string }
) => {
  try {
    if (!text) {
      // 场景1: 在光标位置添加文本
      insertTextAtCursor(app, insert);
      return true;
    } else {
      // 场景2: 查找并替换指定文本
      const searchResult = await searchAndLocateText(app, {
        targetText: text,
        precision: 100,
      });
      const firstMatch = searchResult?.topMatches?.[0];
      if (firstMatch && typeof firstMatch.pos === "number" && typeof firstMatch.len === "number") {
        const { pos, len } = firstMatch;
        // 设置选择范围为找到的文本
        const range = app?.ActiveDocument?.Range?.SetRange(
          pos,
          pos + len
        );

        if (range) {
          // 替换选中的文本
          range.Text = insert;
          // 可选：设置替换后的文本样式（如高亮显示）
          // range.HighlightColorIndex = app?.Enum?.WdColorIndex?.wdYellow;
          return true;
        }
      } else {
        console.warn("未找到指定文本:", text);
        // 可以选择在文档末尾添加文本作为备选方案
        const range = app?.ActiveDocument?.Range;
        if (range) {
          const endRange = range.SetRange(range.End, range.End);
          endRange.Text = `\n${insert}`;
          return true;
        }
      }
    }
    // 如果到达这里说明没有可替换的文本，也没有插入成功
    return false;
  } catch (error) {
    console.error("处理替换文本失败:", error);
    return false;
  }
};
