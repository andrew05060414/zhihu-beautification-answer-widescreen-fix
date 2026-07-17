# 知乎美化：回答详情页宽屏修复

这是 [X.I.U 的知乎美化脚本](https://github.com/XIU2/UserScript) 的临时兼容修复版，用于恢复知乎“问题下的单个回答详情页”的宽屏显示。

原脚本的其他功能保持不变。本仓库不是原作者的官方发布渠道；修复已作为 [上游 PR #609](https://github.com/XIU2/UserScript/pull/609) 提交，若上游合并，请优先使用官方版本。

## 如何使用

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 等用户脚本管理器。
2. 打开 [脚本文件](./Zhihu-Beautification.user.js)，点击右上角的 **Raw**。
3. 将全部内容复制到 Tampermonkey 的原“知乎美化”脚本中，替换旧内容并保存。
4. 刷新知乎页面；在脚本菜单中确认“问题页 → 宽屏显示”已开启。

## 修复内容

知乎新版问题页将回答区域改为 `QuestionPage → ListShortcut → Question-mainColumn`。旧规则可以隐藏右栏，却无法覆盖新版回答列的固定宽度，导致回答详情页仍维持窄栏。本版为这一稳定结构补充了宽度规则，并保留小屏幕适配。

## 来源与许可

- 原脚本作者：[X.I.U](https://github.com/XIU2/UserScript)
- 原脚本许可：GPL-3.0
- 本仓库仅包含针对知乎页面改版的兼容修复。
