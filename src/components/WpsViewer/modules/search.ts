import { highlightByRange } from "./highlight";

// 搜索配置接口

/**
 * 处理转义字符，将字符串中的转义序列转换为真正的字符
 * @param str 包含转义字符的字符串
 * @returns 处理后的字符串
 */
function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\\\/g, '\\');
}

/**
 * 改进的文本搜索和定位功能
 * @param app WPS应用实例
 * @param content 要搜索的内容
 * @param isLocate 是否定位到搜索结果
 */
export const searchAndLocateText = async (
  app: any,
  content: string,
  isLocate = false
) => {
  if (!app) return null;

  // 处理转义字符
  const processedContent = unescapeString(content);
  let searchResults = await multiLineSearch(app, processedContent, false);
  if (!searchResults?.length) {
    if (isLocate) {
      console.warn(`搜索失败: 未找到匹配的文本 "${content}"`);
    }
    return null;
  }

  const firstResult = { pos: searchResults[0].pos, len: processedContent.length };
  if (isLocate) {
    await highlightByRange(app, firstResult.pos, firstResult.len);
  }

  return {
    findResult: firstResult,
    pos: firstResult.pos,
    len: firstResult.len,
    totalMatches: searchResults.length,
  };
};

/**
 * 多行匹配搜索
 */
async function multiLineSearch(
  app: any,
  content: string,
  caseSensitive: boolean
) {
  // 将分割逻辑从 /\s+/（匹配所有空白字符，包括空格）改为 /[\r\n\f\v]+/（仅匹配换行符，不包括空格）
  const lines = content.trim().split(/[\r\n\f\v]+/).map((line) => line.trim());
  const results = [];
  for (const line of lines) {
    const findResult = await app?.ActiveDocument?.Find?.Execute(
      line.trim(),
      caseSensitive
    );
    // 缺少匹配就返回失败
    if (!findResult?.length) return null;
    results.push(...findResult);
  }

  return results;
}
