# Link Sidebar 用户脚本

## 版本：0.5

## 描述

**Link Sidebar** 是一个基于 Tampermonkey 的脚本，用于创建一个侧边栏以存储链接。

## 匹配网站

适用于所有网站。

## 授权

- GM_addStyle
- GM_setValue
- GM_getValue

## 常量

- **SIDEBAR_WIDTH**：侧边栏宽度，单位像素（默认为 200px）。
- **SIDEBAR_COLOR**：侧边栏背景颜色（默认为 '#f0f0f0'）。
- **SIDEBAR_FONT**：侧边栏字体（默认为 'Arial, sans-serif'）。
- **SIDEBAR_TOGGLE**：切换按钮文本（默认为 '<<'）。
- **SIDEBAR_ADD**：添加按钮文本（默认为 '+'）。
- **SIDEBAR_REMOVE**：移除按钮文本（默认为 '-'）。
- **SIDEBAR_EDIT**：编辑按钮文本（默认为 '✎'）。
- **SIDEBAR_STORAGE**：链接列表存储键（默认为 'link_sidebar'）。

## 函数

- **createElement(tag, attrs, styles)**：创建带有指定属性和样式的元素。
- **getLinkList()**：从存储中获取链接列表。
- **setLinkList(linkList)**：将链接列表设置到存储中。
- **updateSidebar()**：使用链接列表更新侧边栏。
- **getWebsiteName(url)**：从链接 URL 中获取网站名称。
- **getWebpageTitle(url)**：从链接 URL 中异步获取网页标题。

## 使用说明

1. **安装脚本**：使用 Tampermonkey 安装此脚本。
2. **打开侧边栏**：点击页面左侧的按钮或使用切换按钮（<<）来显示侧边栏。
3. **添加链接**：点击添加按钮（+），输入链接 URL，自动获取链接名称。
4. **编辑链接**：在侧边栏中点击编辑按钮（✎），输入新的链接名称。
5. **移除链接**：在侧边栏中点击移除按钮（-）来删除链接。
6. **排序链接**：通过拖拽调整链接的顺序。
7. **关闭侧边栏**：再次点击切换按钮（<<）或点击页面右侧的按钮。

**注意**：在输入 URL 时，请确保包含协议（例如，https://）。

## 注意事项

- 请确保链接 URL 有效，否则可能无法获取正确的链接名称。
- 编辑链接时，输入新名称并确认。如果留空或取消，不会进行任何更改。
- 链接列表的顺序将保存，并在下次打开时保持不变。

感谢使用 Link Sidebar 脚本！如有问题或建议，请随时反馈。
