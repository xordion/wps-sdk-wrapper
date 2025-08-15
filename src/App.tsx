import React, { useEffect, useRef, useState } from 'react';
import  {
  clearHitHighlight,
  searchAndLocateText,
  insertTextAtCursor,
  saveDocument,
  getWPSApplication,
  setDocumentReadOnly,
  initWPS,
  formatDocumentFont
} from 'wps-sdk-wrapper';
import './App.css';

function App() {
  const [fileId, setFileId] = useState('92');
  const [appId, setAppId] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('模拟文档');
  const [insertText, setInsertText] = useState('这是插入的文本');
  const [selectedFont, setSelectedFont] = useState('楷体');
  const [logs, setLogs] = useState<string[]>([]);

  const wpsRef = useRef<any>(null);
  const appRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleFormatDocumentFont = async () => {
    if (!appRef.current) {
      addLog('WPS 未初始化，无法更新字体');
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
    wpsRef.current = wps;
    appRef.current = app;
    addLog('WPS 组件初始化成功');
  };

  const handleError = (error: any) => {
    addLog(`WPS 初始化失败: ${error.message || error}`);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
    addLog(isLoading ? '正在加载 WPS...' : '加载完成');
  };

  // 工具方法示例
  const handleSearch = async () => {
    if (!appRef.current) {
      addLog('WPS 未初始化，无法执行搜索');
      return;
    }

    try {
      const result = await searchAndLocateText(appRef.current, searchText, true);
      if (result) {
        addLog(`搜索成功: 找到文本 "${searchText}"，位置: ${result.pos}`);
      } else {
        addLog(`搜索失败: 未找到文本 "${searchText}"`);
      }
    } catch (error: any) {
      addLog(`搜索出错: ${error.message}`);
    }
  };

  const handleInsert = async () => {
    if (!appRef.current) {
      addLog('WPS 未初始化，无法插入文本');
      return;
    }

    try {
      const success = await insertTextAtCursor(appRef.current, insertText);
      if (success) {
        addLog(`成功插入文本: "${insertText}"`);
      } else {
        addLog('插入文本失败');
      }
    } catch (error: any) {
      addLog(`插入文本出错: ${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!wpsRef.current) {
      addLog('WPS 未初始化，无法保存文档');
      return;
    }

    try {
      await saveDocument(wpsRef.current);
      addLog('文档保存成功');
    } catch (error: any) {
      addLog(`保存文档出错: ${error.message}`);
    }
  };

  const handleClearHighlight = async () => {
    if (!appRef.current) {
      addLog('WPS 未初始化，无法清除高亮');
      return;
    }

    try {
      clearHitHighlight(appRef.current);
      addLog('清除高亮成功');
    } catch (error: any) {
      addLog(`清除高亮出错: ${error.message}`);
    }
  };

  const handleToggleReadOnly = async () => {
    if (!appRef.current) {
      addLog('WPS 未初始化，无法切换只读模式');
      return;
    }

    try {
      const newReadOnly = !isReadOnly;
      await setDocumentReadOnly(appRef.current, newReadOnly);
      setIsReadOnly(newReadOnly);
      addLog(`文档${newReadOnly ? '设置为只读' : '设置为可编辑'}模式`);
    } catch (error: any) {
      addLog(`切换只读模式出错: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };
  
  const resetWPS = (container: HTMLElement) => {
    if (container) {
      container.innerHTML = '';
    }
    // 清理 WPS 引用
    wpsRef.current = null;
    appRef.current = null;
  };
  
  const openWps = async () => {
    // 使用initWPS工具方法替换重复逻辑
    try {
      await initWPS({
        fileId,
        appId,
        containerSelector: ".wps-container",
        onReady: handleReady,
        isReadOnly,
        simple: true,
        customArgs: {
          hidecmb: true,
          sdkId: 1,
          _w_tokentype: 1,
          _w_appid: appId,
        }
      });
    } catch (error) {
      handleError(error);
      console.error("WPS初始化失败:", error);
    }
  };

  // 配置保存处理函数
  const handleConfigSave = async () => {
    try {
      addLog('开始重新配置WPS...');
      
      // 1. 重置当前WPS实例
      const container = document.querySelector(".wps-container") as HTMLElement;
      resetWPS(container);
      
      // 2. 重新初始化WPS
      await openWps();
      
      addLog('配置保存成功，WPS已重新初始化');
    } catch (error: any) {
      addLog(`配置保存失败: ${error.message}`);
      console.error("配置保存失败:", error);
    }
  };
  useEffect(() => {
    // 清理容器中的所有内容，避免重复插入
    const container = document.querySelector(".wps-container");
    if (container) {
      container.innerHTML = '';
    }
    
    openWps();

    // 清理函数，在组件卸载或重新挂载时执行
    return () => {
      resetWPS(container as HTMLElement);
    };
  }, []);
  return (
    <div className="app">
      <div className="header">
        <h1>🖊️ WPS 组件调试示例</h1>
        <p className="subtitle">基于 Vite + React 的 WPS 组件调用示例</p>
      </div>

      <div className="content">
        <div className="left-panel">
          <div className="config-section">
            <h3>⚙️ WPS 配置</h3>
            <div className="config-form">
              <div className="form-group">
                <label>文件 ID:</label>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder="请输入文件ID"
                />
              </div>
              <div className="form-group">
                <label>应用 ID:</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="请输入应用ID"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={(e) => setIsReadOnly(e.target.checked)}
                  />
                  <span className="checkbox-text">只读模式</span>
                </label>
              </div>
              <div className="form-actions">
                <button 
                  className="save-config-btn"
                  onClick={handleConfigSave}
                  disabled={loading}
                >
                  💾 保存配置并重新加载
                </button>
              </div>
              <div className="form-group status-group">
                <span className={`status ${loading ? 'loading' : 'ready'}`}>
                  {loading ? '🔄 加载中...' : '✅ 就绪'}
                </span>
              </div>
            </div>
          </div>

          <div className="tools-section">
            <h3>🛠️ 工具方法测试</h3>

            <div className="tool-group">
              <h4>文本搜索</h4>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="输入要搜索的文本"
              />
              <button onClick={handleSearch}>搜索文本</button>
              {/* <button onClick={handleClearHighlight}>清除高亮</button> */}
            </div>

            <div className="tool-group">
              <h4>文本插入</h4>
              <input
                type="text"
                value={insertText}
                onChange={(e) => setInsertText(e.target.value)}
                placeholder="输入要插入的文本"
              />
              <button onClick={handleInsert}>插入文本</button>
            </div>

            <div className="tool-group">
              <h4>字体设置</h4>
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
              <button onClick={handleFormatDocumentFont}>🎨 更新字体</button>
            </div>


            <div className="tool-group">
              <h4>文档操作</h4>
              <button onClick={handleSave}>💾 保存文档</button>
              <button onClick={handleToggleReadOnly}>
                🔄 切换为{isReadOnly ? '可编辑' : '只读'}模式
              </button>
            </div>
          </div>

          <div className="logs-section">
            <div className="logs-header">
              <h3>📋 操作日志</h3>
              <button onClick={clearLogs} className="clear-btn">清除</button>
            </div>
            <div className="logs">
              {logs.length === 0 ? (
                <div className="empty-logs">暂无操作日志</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-item">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="wps-section">
            <h3>📄 WPS 预览区域</h3>
            <div className="wps-container">

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
