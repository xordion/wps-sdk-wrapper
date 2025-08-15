/**
 * WPS WebOffice SDK 的 Mock 版本
 * 用于在开发环境中模拟 WPS SDK 的行为，便于调试组件
 */

// Mock 的 WPS 实例
class MockWPSInstance {
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      // 模拟异步初始化
      setTimeout(resolve, 1000);
    });
  }

  async ready() {
    return this.readyPromise;
  }

  get Application() {
    return Promise.resolve(new MockApplication());
  }

  async save() {
    console.log('Mock: 文档保存');
    return true;
  }

  executeCommandBar(command: string) {
    console.log(`Mock: 执行命令 ${command}`);
  }
}

// Mock 的应用实例
class MockApplication {
  get ActiveDocument() {
    return new MockDocument();
  }
}

// Mock 的文档实例
class MockDocument {
  private trackRevisions = false;

  get TrackRevisions() {
    return this.trackRevisions;
  }

  async SetReadOnly(readOnly: boolean) {
    console.log(`Mock: 设置只读模式 ${readOnly}`);
  }

  get Find() {
    return new MockFind();
  }

  get Range() {
    return new MockRange();
  }

  get Revisions() {
    return new MockRevisions();
  }

  get ActiveWindow() {
    return new MockActiveWindow();
  }

  get Bookmarks() {
    return new MockBookmarks();
  }
}

// Mock 的查找功能
class MockFind {
  async Execute(text: string, caseSensitive: boolean = false) {
    console.log(`Mock: 查找文本 "${text}"`);
    // 模拟找到文本的情况
    return [{ pos: 100, len: text.length }];
  }

  ClearHitHighlight() {
    console.log('Mock: 清除高亮');
  }
}

// Mock 的范围对象
class MockRange {
  SetRange(start: number, end: number) {
    console.log(`Mock: 设置范围 ${start}-${end}`);
    return new MockRangeInstance(start, end);
  }
}

class MockRangeInstance {
  constructor(private start: number, private end: number) {}

  get Start() {
    return this.start;
  }

  get Text() {
    return '模拟文本内容';
  }
}

// Mock 的修订功能
class MockRevisions {
  get Count() {
    return 3; // 模拟3个修订
  }

  Item(index: number) {
    return new MockRevision(index);
  }
}

class MockRevision {
  constructor(private index: number) {}

  get Date() {
    return new Date().toISOString();
  }

  get Range() {
    return Promise.resolve(new MockRangeInstance(this.index * 10, this.index * 10 + 5));
  }

  async Reject() {
    console.log(`Mock: 拒绝修订 ${this.index}`);
  }
}

// Mock 的活动窗口
class MockActiveWindow {
  get Selection() {
    return new MockSelection();
  }

  async ScrollIntoView(range: any) {
    console.log('Mock: 滚动到视图');
  }
}

class MockSelection {
  async InsertAfter(text: string) {
    console.log(`Mock: 插入文本 "${text}"`);
  }
}

// Mock 的书签功能
class MockBookmarks {
  async Add(options: { Name: string; Range: { Start: number; End: number } }) {
    console.log(`Mock: 添加书签 ${options.Name}`);
  }

  Item(name: string) {
    return {
      Select: () => console.log(`Mock: 选择书签 ${name}`),
    };
  }

  async ReplaceBookmark(bookmarks: Array<{ name: string; type: string; value: string }>) {
    console.log('Mock: 替换书签内容');
    return true;
  }
}

// Mock 的 WebOffice SDK
const MockWebOfficeSDK = {
  OfficeType: {
    Writer: 'writer',
    Spreadsheet: 'spreadsheet',
    Presentation: 'presentation',
  },

  init(options: any) {
    console.log('Mock: 初始化 WPS SDK', options);
    
    if (!options.mount) {
      throw new Error('Mock: 未提供挂载容器');
    }

    // 在容器中添加模拟的 iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#f5f5f5';
    iframe.srcdoc = `
      <html>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #1976d2;">🖊️ WPS 组件 Mock 预览</h3>
            <p><strong>文件ID:</strong> ${options.fileId || 'demo-file-id'}</p>
            <p><strong>应用ID:</strong> ${options.appId || 'default-app-id'}</p>
            <p><strong>类型:</strong> ${options.officeType || 'writer'}</p>
            <hr style="margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
              <h4 style="margin-top: 0;">📝 模拟文档内容</h4>
              <p>这是一个模拟的 WPS 文档预览。在实际环境中，这里会显示真实的 WPS Office 界面。</p>
              <p>当前模式: <span style="color: ${options.readOnly ? 'red' : 'green'};">${options.readOnly ? '只读' : '可编辑'}</span></p>
            </div>
          </div>
        </body>
      </html>
    `;

    options.mount.appendChild(iframe);

    return new MockWPSInstance();
  },
};

export default MockWebOfficeSDK;
