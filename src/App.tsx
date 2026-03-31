import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  clearHitHighlight,
  saveDocument,
  handleInsertText,
  getSelectionState,
  navigateTopMatch,
  selectMatchRange,
  type SearchMatchRange,
  getWPSApplication,
  setDocumentReadOnly,
  initWPS,
  formatDocumentFont,
  clearAllText,
  coloredOnChange,
  toggleRevisionHandler,
  collectRevisionInfos,
  collectNewRevisionDatesAfter,
  cancelRevisions,
  getLatestRevisionDate,
  formatSearchTextForDocMatch,
  // }from 'wps-sdk-wrapper';
} from "wps-component";
import "./App.css";

function App() {
  const { t, i18n: i18nInstance } = useTranslation();
  const initData = JSON.parse(localStorage.getItem("recentInitData") || "{}");

  const [fileId, setFileId] = useState(initData.fileId || "");
  const [appId, setAppId] = useState(initData.appId || "");
  const [token, setToken] = useState(initData.token || "");
  const [fileName, setFileName] = useState("可测试-销售合同.doc");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("模拟文档");
  const [insertText, setInsertText] = useState("这是插入的文本");
  const [selectedFont, setSelectedFont] = useState("楷体");
  const [logs, setLogs] = useState<string[]>([]);
  const [showToken, setShowToken] = useState(false);
  const [inputColorEnabled, setInputColorEnabled] = useState(false);
  const [currentInputColor, setCurrentInputColor] = useState("#ff0000");
  const [revisionButtonsVisible, setRevisionButtonsVisible] = useState(true);
  const [searchMatches, setSearchMatches] = useState<SearchMatchRange[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const revisionDatesToCancel = useRef<string[]>([]);
  const clearWpsListener = useRef<any>(null);

  // 语言切换处理函数
  const handleLanguageChange = (lang: string) => {
    i18nInstance.changeLanguage(lang);
    // 更新默认文本内容
    if (lang === 'zh') {
      setSearchText("模拟文档");
      setInsertText("这是插入的文本");
    } else if (lang === 'en') {
      setSearchText("Sample Document");
      setInsertText("This is inserted text");
    } else if (lang === 'ja') {
      setSearchText("サンプル文書");
      setInsertText("これは挿入されたテキストです");
    }
  };

  const wpsRef = useRef<any>(null);
  const appRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleFormatDocumentFont = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法更新字体");
      return;
    }

    try {
      await formatDocumentFont(appRef.current, selectedFont);
      addLog(`字体已更新为: ${selectedFont}`);
    } catch (error: any) {
      addLog(`更新字体失败: ${error.message}`);
    }
  };
  const handleReady = (wps: any, app: any) => {
    // 先清理旧的资源
    resetWPS();

    // 设置新的引用和监听器
    wpsRef.current = wps;
    appRef.current = app;

    try {
      // 根据开关状态决定是否启用颜色监听
      if (inputColorEnabled) {
        clearWpsListener.current = coloredOnChange(wps, currentInputColor);
        addLog(`WPS 组件初始化成功，已启用输入着色 (${currentInputColor})`);
      } else {
        addLog("WPS 组件初始化成功，输入着色已禁用");
      }

      // 根据开关状态设置修订按钮显示状态
      toggleRevisionHandler(app, revisionButtonsVisible);
    } catch (error: any) {
      addLog(`设置监听器失败: ${error.message}`);
    }
  };

  const handleError = (error: any) => {
    addLog(`WPS 初始化失败: ${error.message || error}`);
  };

  // 处理输入颜色开关切换
  const handleInputColorToggle = async (enabled: boolean) => {
    setInputColorEnabled(enabled);

    if (!appRef.current) {
      addLog(
        enabled ? "输入着色已启用，将在WPS初始化后生效" : "输入着色已禁用"
      );
      return;
    }

    try {
      if (enabled) {
        // 启用着色：重新创建监听器
        if (clearWpsListener.current) {
          clearWpsListener.current();
        }
        clearWpsListener.current = coloredOnChange(
          wpsRef.current,
          currentInputColor
        );
        addLog(`输入着色已启用 (${currentInputColor})`);
      } else {
        // 禁用着色：清除监听器并重置输入颜色
        if (clearWpsListener.current) {
          clearWpsListener.current();
          clearWpsListener.current = null;
        }
        addLog("输入着色已禁用，输入颜色已重置为黑色");
      }
    } catch (error: any) {
      addLog(`切换输入着色失败: ${error.message}`);
    }
  };

  // 处理颜色变更
  const handleInputColorChange = async (color: string) => {
    setCurrentInputColor(color);

    if (!inputColorEnabled || !appRef.current) {
      addLog(`输入颜色已更新为 ${color}，将在启用着色后生效`);
      return;
    }

    try {
      // 重新创建监听器以应用新颜色
      if (clearWpsListener.current) {
        clearWpsListener.current();
      }
      clearWpsListener.current = coloredOnChange(wpsRef.current, color);
      addLog(`输入颜色已更新为 ${color}`);
    } catch (error: any) {
      addLog(`更新输入颜色失败: ${error.message}`);
    }
  };

  // 处理修订按钮显示开关
  const handleRevisionButtonsToggle = async (visible: boolean) => {
    setRevisionButtonsVisible(visible);

    if (!appRef.current) {
      addLog(
        visible
          ? "修订按钮显示已启用，将在WPS初始化后生效"
          : "修订按钮显示已禁用"
      );
      return;
    }

    try {
      await toggleRevisionHandler(appRef.current, visible);
      addLog(visible ? "修订按钮显示已启用" : "修订按钮显示已禁用");
    } catch (error: any) {
      addLog(`切换修订按钮显示失败: ${error.message}`);
    }
  };

  const handleNavigateMatch = async (
    direction: "prev" | "next",
    options?: { forceSelectFirst?: boolean; silentWhenFirst?: boolean }
  ): Promise<boolean> => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法切换匹配项");
      return false;
    }
    const keyword = formatSearchTextForDocMatch(searchText);
    if (!keyword) {
      addLog("搜索词为空，无法切换匹配项");
      return false;
    }

    const result = await navigateTopMatch({
      app: appRef.current,
      keyword,
      direction,
      currentMatchIndex,
      previousMatchesLength: searchMatches.length,
      precision: 80,
      forceSelectFirst: options?.forceSelectFirst,
    });

    if (!result.matches.length) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      addLog(`未找到可切换的 topMatches: "${keyword}"`);
      return false;
    }

    setSearchMatches(result.matches);
    setCurrentMatchIndex(result.nextIndex);
    if (!(options?.silentWhenFirst && result.nextIndex === 0 && options?.forceSelectFirst)) {
      addLog(`已定位 topMatches: ${result.nextIndex + 1}/${result.matches.length}`);
    }
    return true;
  };

  // 工具方法示例
  const handleSearch = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法执行搜索");
      return;
    }

    try {
      await handleNavigateMatch("next", { forceSelectFirst: true, silentWhenFirst: true });
    } catch (error: any) {
      addLog(`搜索出错: ${error.message}`);
    }
  };

  const handleInsert = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法插入文本");
      return;
    }

    try {
      const { hasSelection } = await getSelectionState(appRef.current);
      if (!hasSelection && formatSearchTextForDocMatch(searchText)) {
        // 有搜索结果时，选中当前 currentMatchIndex 对应的项（用户可能已通过上/下一个切到第三项）
        // 避免 forceSelectFirst 导致始终选中第一项
        if (searchMatches.length > 0 && currentMatchIndex >= 0 && currentMatchIndex < searchMatches.length) {
          await selectMatchRange(appRef.current, searchMatches[currentMatchIndex]);
        } else {
          const selected = await handleNavigateMatch("next", {
            forceSelectFirst: true,
            silentWhenFirst: true,
          });
          if (!selected) {
            return;
          }
        }
      }
      const latestBefore = await getLatestRevisionDate(appRef.current);
      const normalizedInsertText = formatSearchTextForDocMatch(insertText);
      await handleInsertText(appRef.current, {
        text: undefined, // searchText为输入的原文，没有则 undefined
        insert: normalizedInsertText,
      });

      addLog(`成功插入文本: "${normalizedInsertText}"`);
      setTimeout(async () => {
        revisionDatesToCancel.current = await collectNewRevisionDatesAfter(
          appRef.current!,
          latestBefore
        );
      }, 3000);
    } catch (error: any) {
      addLog(`插入文本出错: ${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!wpsRef.current) {
      addLog("WPS 未初始化，无法保存文档");
      return;
    }

    try {
      await saveDocument(wpsRef.current);
      addLog("文档保存成功");
    } catch (error: any) {
      addLog(`保存文档出错: ${error.message}`);
    }
  };

  const handleClearAllText = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法清空文档");
      return;
    }

    try {
      await clearAllText(appRef.current);
      addLog("文档内容已清空");
    } catch (error: any) {
      addLog(`清空文档出错: ${error.message}`);
    }
  };

  const handleClearHighlight = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法清除高亮");
      return;
    }

    try {
      clearHitHighlight(appRef.current);
      addLog("清除高亮成功");
    } catch (error: any) {
      addLog(`清除高亮出错: ${error.message}`);
    }
  };

  const handleToggleReadOnly = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法切换只读模式");
      return;
    }

    try {
      const newReadOnly = !isReadOnly;
      await setDocumentReadOnly(appRef.current, newReadOnly);
      setIsReadOnly(newReadOnly);
      addLog(`文档${newReadOnly ? "设置为只读" : "设置为可编辑"}模式`);
    } catch (error: any) {
      addLog(`切换只读模式出错: ${error.message}`);
    }
  };

  const handleRevision = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法获取修订信息");
      return;
    }
    const revisions = await appRef.current.ActiveDocument.Revisions;
    const infos = await collectRevisionInfos(revisions);
    const revisionJson = await revisions.Json();
    console.log(revisionJson);
    console.log(infos);
  };

  const handleCancelRevision = async () => {
    if (!appRef.current) {
      addLog("WPS 未初始化，无法取消修订");
      return;
    }
    try {
      const ok = await cancelRevisions(
        appRef.current,
        revisionDatesToCancel.current
      );
      if (ok) revisionDatesToCancel.current = [];
      addLog(ok ? "修订已成功取消" : "未找到修订记录");
    } catch (error: any) {
      addLog(`取消修订失败: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetWPS = async (container?: HTMLElement | null) => {
    try {
      // 清除事件监听器
      if (
        clearWpsListener.current &&
        typeof clearWpsListener.current === "function"
      ) {
        clearWpsListener.current();
        clearWpsListener.current = null;
      }

      // 先销毁 WPS 实例（如果存在），避免在清空容器时出现 removeChild 错误
      if (wpsRef.current && typeof wpsRef.current.destroy === "function") {
        try {
          await wpsRef.current.destroy();
        } catch (error) {
          console.warn("销毁 WPS 实例时出错:", error);
        }
      }

      // 清理容器DOM（在销毁实例后清空）
      if (container) {
        container.innerHTML = "";
      }

      // 清理 WPS 引用
      wpsRef.current = null;
      appRef.current = null;
    } catch (error) {
      console.warn("重置WPS时出错:", error);
    }
  };

  const openWps = async () => {
    // 使用initWPS工具方法替换重复逻辑
    try {
      await initWPS({
        // version: "v1",
        fileId,
        appId,
        fileName,
        containerSelector: ".wps-container",
        onReady: handleReady,
        isReadOnly,
        simple: false,
        token,
        // timeout: 5 * 1000,
        // refreshToken: () => new Promise((resolve) => {
        //   console.log('refreshToken');
        //   resolve({ token: '<mock-jwt-token>', timeout: 2 * 1000 } as WpsToken);
        // }),
        commandBars: [
          {
            cmbId: 'TabInsertTab', // 组件 ID
            attributes: {
              visible: false, // 隐藏组件，
              enable: false // 禁用组件， 组件显示但不响应点击事件
            }
          },
          {
            cmbId: 'TabPageTab', // 组件 ID
            attributes: {
              visible: false, // 隐藏组件，
              enable: false // 禁用组件， 组件显示但不响应点击事件
            }
          },
          {
            cmbId: 'TabViewWord', // 组件 ID
            attributes: {
              visible: false, // 隐藏组件，
              enable: false // 禁用组件， 组件显示但不响应点击事件
            }
          },
          {
            cmbId: 'TabToolsTab', // 组件 ID
            attributes: {
              visible: false, // 隐藏组件，
              enable: false // 禁用组件， 组件显示但不响应点击事件
            }
          }
        ],
      });
    } catch (error) {
      handleError(error);
      console.error("WPS初始化失败:", error);
    }
  };

  // 配置保存处理函数
  const handleConfigSave = async () => {
    try {
      addLog("开始重新配置WPS...");

      // 1. 重置当前WPS实例（等待销毁完成）
      await resetWPS(document.querySelector(".wps-container") as HTMLElement);

      // 2. 重新初始化WPS
      await openWps();

      localStorage.setItem("recentInitData", JSON.stringify({ token, fileId, appId }));
      addLog("配置保存成功，WPS已重新初始化");
    } catch (error: any) {
      addLog(`配置保存失败: ${error.message}`);
      console.error("配置保存失败:", error);
    }
  };
  useEffect(() => {
    // 清理容器中的所有内容，避免重复插入
    const container = document.querySelector(".wps-container");
    if (container) {
      container.innerHTML = "";
    }

    openWps();

    // 清理函数，在组件卸载或重新挂载时执行
    return () => {
      resetWPS(container as HTMLElement).catch((error) => {
        console.warn("清理 WPS 时出错:", error);
      });
    };
  }, []);
  return (
    <div className="app">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>{t('appTitle')}</h1>
            <p className="subtitle">{t('subtitle')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>🌐 Language:</label>
            <select
              value={i18nInstance.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                minWidth: '100px'
              }}
            >
              <option value="zh">🇨🇳 中文</option>
              <option value="en">🇺🇸 English</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="left-panel">
          <div className="config-section">
            <h3>{t('wpsConfig')}</h3>
            <div className="config-form">
              <div className="form-group">
                <label>{t('fileId')}</label>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder={t('fileIdPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('appId')}</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder={t('appIdPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('token')}</label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => {
                      localStorage.setItem("token", e.target.value);
                      setToken(e.target.value);
                    }}
                    placeholder={t('tokenPlaceholder')}
                    style={{ paddingRight: "40px", flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#666",
                    }}
                    title={showToken ? t('hideToken') : t('showToken')}
                  >
                    {showToken ? "🙈" : "👁️"}
                  </button>
                </div>
                <small
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {t('tokenTip')}
                </small>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={(e) => setIsReadOnly(e.target.checked)}
                  />
                  <span className="checkbox-text">{t('readOnlyMode')}</span>
                </label>
              </div>
              <div className="form-actions">
                <button
                  className="save-config-btn"
                  onClick={handleConfigSave}
                  disabled={loading}
                >
                  {t('saveConfig')}
                </button>
              </div>
              <div className="form-group status-group">
                <span className={`status ${loading ? "loading" : "ready"}`}>
                  {loading ? t('loading') : t('ready')}
                </span>
              </div>
            </div>
          </div>

          <div className="tools-section">
            <h3>{t('toolsTest')}</h3>

            <div className="tool-group">
              <h4>{t('textSearch')}</h4>
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSearchMatches([]);
                  setCurrentMatchIndex(0);
                }}
                placeholder={t('searchPlaceholder')}
              />
              <button onClick={handleSearch}>{t('searchButton')}</button>
              {/* <button onClick={handleClearHighlight}>清除高亮</button> */}
            </div>

            <div className="tool-group">
              <h4>{t('textInsert')}</h4>
              <input
                type="text"
                value={insertText}
                onChange={(e) => setInsertText(e.target.value)}
                placeholder={t('insertPlaceholder')}
              />
              <div className="insert-actions">
                <button onClick={handleInsert}>{t('insertButton')}</button>
                <button
                  onClick={() => handleNavigateMatch("prev")}
                  disabled={!formatSearchTextForDocMatch(searchText)}
                  title={t('prevMatch')}
                >
                  ↑
                </button>
                <button
                  onClick={() => handleNavigateMatch("next")}
                  disabled={!formatSearchTextForDocMatch(searchText)}
                  title={t('nextMatch')}
                >
                  ↓
                </button>
                <span className="match-counter">
                  {searchMatches.length
                    ? `${currentMatchIndex + 1}/${searchMatches.length}`
                    : "0/0"}
                </span>
              </div>
            </div>


            <div className="tool-group">
              <h4>{t('fontSettings')}</h4>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="font-select"
              >
                <option value="宋体">宋体</option>
                <option value="黑体">黑体</option>
                <option value="楷体">楷体</option>
                <option value="仿宋">仿宋</option>
                <option value="微软雅黑">微软雅黑</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
              <button onClick={handleFormatDocumentFont}>{t('updateFont')}</button>
            </div>

            <div className="tool-group">
              <h4>{t('revisionOps')}</h4>
              <button onClick={handleRevision}>{t('printRevision')}</button>
              <button onClick={handleCancelRevision}>{t('cancelRevision')}</button>
            </div>

            <div className="tool-group">
              <h4>{t('docOps')}</h4>
              <button onClick={handleSave}>{t('saveDoc')}</button>
              <button onClick={handleClearAllText}>{t('clearDoc')}</button>
              <button onClick={handleToggleReadOnly}>
                {t('toggleReadOnly')} {isReadOnly ? t('editable') : t('readonly')}模式
              </button>
            </div>

            <div className="tool-group">
              <h4>{t('revisionControl')}</h4>

              <div className="control-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={inputColorEnabled}
                    onChange={(e) => handleInputColorToggle(e.target.checked)}
                  />
                  <span className="checkbox-text">{t('enableColoring')}</span>
                </label>
              </div>

              <div className="control-item" style={{ marginTop: "8px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {t('inputColor')}:
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="color"
                    value={currentInputColor}
                    onChange={(e) => handleInputColorChange(e.target.value)}
                    disabled={!inputColorEnabled}
                    style={{
                      width: "40px",
                      height: "32px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: inputColorEnabled ? "pointer" : "not-allowed",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: inputColorEnabled ? "#333" : "#999",
                      fontFamily: "monospace",
                    }}
                  >
                    {currentInputColor}
                  </span>
                </div>
              </div>

              <div className="control-item" style={{ marginTop: "12px" }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={revisionButtonsVisible}
                    onChange={(e) =>
                      handleRevisionButtonsToggle(e.target.checked)
                    }
                  />
                  <span className="checkbox-text">{t('showRevisionButtons')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="logs-section">
            <div className="logs-header">
              <h3>{t('operationLog')}</h3>
              <button onClick={clearLogs} className="clear-btn">
                {t('clear')}
              </button>
            </div>
            <div className="logs">
              {logs.length === 0 ? (
                <div className="empty-logs">{t('noLogs')}</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-item">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="wps-container-wrapper">
            <h3>{t('wpsPreview')}</h3>
            <div className="wps-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
