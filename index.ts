// import { message } from '@/components/MessageProvider';
// @ts-ignore
// import WebOfficeSDK from './sdk/web-office-sdk-solution-v2.0.6.es.js';
import WebOfficeSDK from './sdk/web-office-sdk-solution-v2.0.6.es';
import { ISubscriptionsConf } from './sdk/index';
/**
 * 修订信息接口
 */
interface RevisionInfo {
  index: number;
  text: string;
  date: string;
  revision: any;
  start: number;
}
/**
 * 随机生成指定长度的英文字符串
 * @param length 字符串长度
 * @param includeUpperCase 是否包含大写字母，默认 true
 * @param includeLowerCase 是否包含小写字母，默认 true
 * @returns 随机生成的英文字符串
 */
const generateRandomString = (
  length: number,
  includeUpperCase: boolean = true,
  includeLowerCase: boolean = true,
): string => {
  if (length <= 0) {
    return '';
  }

  let characters = '';

  if (includeUpperCase) {
    characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  if (includeLowerCase) {
    characters += 'abcdefghijklmnopqrstuvwxyz';
  }

  // 如果没有选择任何字符集，默认使用小写字母
  if (!characters) {
    characters = 'abcdefghijklmnopqrstuvwxyz';
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

/**
 * 初始化WPS
 */
const initWPS = async ({
  fileId,
  appId,
  containerSelector,
  onReady,
  onError,
  isReadOnly,
  token,
  simple,
  refreshToken,
  ...params
}: {
  fileId: string | null;
  appId: string;
  containerSelector: string;
  onReady?: (wps: ISubscriptionsConf, app: any) => void;
  isReadOnly: boolean;
  token?: string;
  simple?: boolean;
  onError?: (error: any) => void;
  refreshToken?: (token: string, timeout?: number) => void;
  [key: string]: any;
}) => {
  if (!fileId) return null;

  const options = {
    mode: simple ? 'simple' : 'normal',
    mount: document.querySelector(containerSelector),
    officeType: WebOfficeSDK.OfficeType.Writer,
    appId,
    fileId: fileId,
    token: token || localStorage.getItem('token'),
    refreshToken,
    ...params
  };

  try {
    // console.log(options, 'options');
    const wps: ISubscriptionsConf = WebOfficeSDK.init(options);
    if (wps) {
      await wps?.ready();
      console.log(wps, 'wps');
      const app = (await wps?.Application) as any;
      await app.ActiveDocument?.SetReadOnly(isReadOnly);
      if (onReady) {
        onReady(wps, app);
      }
      // app.CommandBars('ReviewTrackChanges').Execute();
      // 获取页面是否处于修订模式
      const TrackRevisions = await app.ActiveDocument.TrackRevisions;
      if (!TrackRevisions) {
        wps.executeCommandBar('ReviewTrackChanges');
      }
      return { wps, app };
    }
  } catch (error) {
    console.error('WPS初始化失败:', error);
    onError?.(error);
    throw error;
  }

  return null;
};

/**
 * 清除高亮
 */
const clearHitHighlight = (app: any) => {
  if (app) {
    app?.ActiveDocument?.Find?.ClearHitHighlight();
  }
};

/**
 * 高亮指定位置的文本
 */
const highlightText = async (app: any, pos: number, length: number) => {
  try {
    if (!app) return false;

    // 清除之前的高亮
    await clearHitHighlight(app);

    // 设置高亮范围
    const range = await app.ActiveDocument.Range.SetRange(pos, pos + length);
    // console.log(range, 'range');
    // 应用高亮样式
    // await range.Highlight(6);

    return false;
  } catch (error) {
    console.error('高亮文本失败:', error);
    return false;
  }
};

const highlightByRange = async (app: any, pos: number, length: number) => {
  // const offsetPos = pos - 20;
  const range = app?.ActiveDocument?.Range?.SetRange(pos, pos + length);
  // range.Font.Color = '#228B22';
  // range.Font.Name = '宋体-简';

  await app?.ActiveDocument?.ActiveWindow?.ScrollIntoView(range);
  app?.ActiveDocument?.Range?.SetRange(pos, pos + length);
  return { pos, length };
};

/**
 * 搜索并定位文本
 */
const searchAndLocateText = async (
  app: any,
  content: string,
  isLocate = false,
) => {
  if (!app) return null;
  const contentArr = content?.split('\n')?.[0]?.trim();
  // console.log(contentArr, 'content');
  const findResult = await app?.ActiveDocument?.Find?.Execute(
    contentArr,
    false,
  );
  // console.log(findResult, 'findResult');

  if (!findResult?.length) {
    if (isLocate) {
      // message.warning({
      //   content: '匹配原文失败，请手动定位修订',
      // });
      console.warn('匹配原文失败，请手动定位修订');

    }
    return null;
  }
  const { pos, len } = findResult[0];
  const length = content.length > len ? content.length : len;
  await highlightByRange(app, pos, length);

  // 高亮文本
  // await highlightText(app, pos, length);
  // const font = await app.ActiveDocument.Range(0, 20).Font;
  // const name = await font.Name();
  // console.log(font.Name, 'font');
  // // font.Color = '#228B22';
  return {
    findResult,
    pos,
    len: length,
  };
};

/**
 * 在当前光标位置插入文本
 */
const insertTextAtCursor = async (app: ISubscriptionsConf, text: string) => {
  try {
    const selection = await app.ActiveDocument.ActiveWindow.Selection;
    if (selection) {
      await selection.InsertAfter(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error('在光标位置插入文本失败:', error);
    return false;
  }
};
/**
 * 获取最新的修订时间
 */
const getLatestRevisionDate = async (app: ISubscriptionsConf): Promise<string> => {
  try {
    const revisions = await app?.ActiveDocument?.Revisions;
    const count = await revisions?.Count;
    if (count > 0) {
      // 遍历所有修订，找到时间最新的
      let latestDate: string | null = null;
      for (let i = 1; i <= count; i++) {
        const revision = await revisions?.Item(i);
        const currentDate = await revision.Date;
        if (!latestDate || currentDate > latestDate) {
          latestDate = currentDate;
        }
      }
      return latestDate || '';
    }
  } catch (error) {
    console.error('获取修订日期失败:', error);
  }
  return '';
};

/**
 * 替换原文内容
 */
const replaceOriginalContent = async (
  app: ISubscriptionsConf,
  origin: string = '',
  replace: string = '',
  pos: number,
  len: number,
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

  // console.log(origin.split('\n')?.[0]?.trim(), 'bookmarks', pos, len);
  // await bookmarks.Item(name).Select();
  const isReplaceSuccess = await bookmarks.ReplaceBookmark([
    {
      name: name,
      type: 'text',
      value: replace,
    },
  ]);

  const date = await getLatestRevisionDate(app);
  return { success: isReplaceSuccess, modifyDate: date };
};


/**
 * 收集修订信息
 */
const collectRevisionInfos = async (revisions: any, count: number) => {
  const revisionInfos: RevisionInfo[] = [];
  for (let i = 1; i <= count; i++) {
    const revision = await revisions?.Item(i);
    const range = await revision.Range;
    const start = await range.Start;
    const text = await range.Text;
    const date = await revision.Date;
    revisionInfos.push({ index: i, text, date, revision, start });
  }
  return revisionInfos;
};
/**
 * 根据日期获取修订信息
 */
const getRevisionByDate = async (app: ISubscriptionsConf, date?: string) => {
  if (!date) {
    console.warn('没有日期，无法获取修订信息');
    return [];
  }
  const revisions = await app?.ActiveDocument?.Revisions;
  const count = await revisions?.Count;
  const revisionInfos = await collectRevisionInfos(revisions, count);
  const currentRevisions = revisionInfos
    .filter(info => info.date === date)
    .sort((a, b) => b.index - a.index);
  return currentRevisions;
};
/**
 * 拒绝匹配的修订
 */
const delay = (ms: number): Promise<void> =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
const handleMatchingRevisions = async (revisions: RevisionInfo[], type?: 'reject' | 'accept') => {

  for (const info of revisions) {
    try {
      if (type === 'reject') {
        await info.revision.Reject();
      } else {
        await info.revision.Accept();
      }
      await delay(300);
    } catch (rejectError) {
      console.error('拒绝修订失败:', info.index, rejectError);
    }
  }
};

/**
 * 处理修订内容
 */
const handleRevisionContent = async (
  app: ISubscriptionsConf,
  date: string,
  isReject = false,
) => {
  try {
    const revisionsToReject = await getRevisionByDate(app, date);
    if (isReject) {
      await handleMatchingRevisions(revisionsToReject, 'reject');
    } else {
      // 高亮已修订内容
      const textFilter = revisionsToReject.filter(item =>
        item.text.trim(),
      )?.[0];
      if (!textFilter) {
        // message.warning({
        //   content: '匹配原文失败，请手动定位修订',
        // });
        console.warn('匹配原文失败，请手动定位修订');

        return;
      }
      highlightByRange(app, textFilter.start, textFilter.text.length);
    }
  } catch (error) {
    console.error('处理修订时出错:', error);
  }
};

const getDocLength = async (app: any) => {
  // 获取选中区域
  const DocumentRange = await app.ActiveDocument.GetDocumentRange()

  // 获取末尾
  const End = await DocumentRange.End
  // 去0下标
  return End - 1;
};

const formatDocumentFont = async (app: any, font: string) => {
  const length = await getDocLength(app);
  const range = app?.ActiveDocument?.Range(0, length);
  range.Font.Name = font;
  await delay(300);
  const now = new Date().getTime();
  const date = await getLatestRevisionDate(app);
  // 如果时间差距小于3000ms，接收修订
  if (now - new Date(date).getTime() > 2000) return;
  const revisions = await getRevisionByDate(app, date);
  await handleMatchingRevisions(revisions, 'accept');
};

/**
 * 文档保存
 */
const saveDocument = async (wps: ISubscriptionsConf) => {
  if (wps) {
    await wps.save();
  }
};

/**
 * 获取WPS应用程序实例
 */
const getWPSApplication = async (wps: ISubscriptionsConf) => {
  if (wps) {
    return (await wps?.Application) as any;
  }
  return null;
};

/**
 * 设置文档只读状态
 */
const setDocumentReadOnly = async (app: ISubscriptionsConf, isReadOnly: boolean) => {
  if (app) {
    app.ActiveDocument?.SetReadOnly(isReadOnly);
  }
};

// 统一导出所有WPS公共方法
export {
  clearHitHighlight,
  collectRevisionInfos,
  getDocLength,
  generateRandomString,
  getLatestRevisionDate,
  getRevisionByDate,
  getWPSApplication,
  handleRevisionContent,
  highlightByRange,
  highlightText,
  initWPS,
  insertTextAtCursor,
  handleMatchingRevisions,
  replaceOriginalContent,
  saveDocument,
  searchAndLocateText,
  setDocumentReadOnly,
  formatDocumentFont
};
