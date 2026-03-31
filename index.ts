
// 统一导出所有WPS公共方法
export {
  clearHitHighlight,
  clearAllText,
  collectRevisionDates,
  collectRevisionInfos,
  getDocLength,
  generateRandomString,
  getLatestRevisionDate,
  getRevisionCount,
  getRevisionByDate,
  getRevisionsAfterDate,
  getWPSApplication,
  handleRevisionContent,
  collectNewRevisionDatesAfter,
  cancelRevisions,
  highlightByRange,
  highlightText,
  initWPS,
  insertTextAtCursor,
  handleMatchingRevisions,
  replaceOriginalContent,
  handleInsertText,
  textPosToWpsPos,
  selectMatchRange,
  queryTopMatches,
  getSelectionState,
  computeNextMatchIndex,
  navigateTopMatch,
  saveDocument,
  searchAndLocateText,
  setDocumentReadOnly,
  formatDocumentFont,
  coloredOnChange,
  toggleRevisionHandler,
  formatSearchTextForDocMatch
} from '@/components/WpsViewer/index';

// 导出所有TypeScript接口和类型定义
export type {
  Wps,
  WpsApplication,
  WpsToken,
  WpsOptions,
  WpsCommandBar,
  WpsInitParams
} from '@/interface';

export type { SearchMatchRange } from '@/components/WpsViewer/modules/match';
