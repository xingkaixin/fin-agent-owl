# FinAgent Owl

FinAgent Owl 是一个内部使用的 Chrome 插件。

它会在当前 FinAgent 会话页面中：

- 从 URL 解析 `channelId`
- 在页面上下文读取 `FinAgentDB`
- 在 `conversations` store 中找到对应会话
- 提取 `sessionId`
- 生成可复制命令，并支持多种 launcher 选择

```bash
agent-dump claude://<sessionId> -output . -format json,markdown,raw
```

也支持在 popup 中切换并复制这些形式：

```bash
npx agent-dump claude://<sessionId> -output . -format json,markdown,raw
bunx agent-dump claude://<sessionId> -output . -format json,markdown,raw
uvx agent-dump claude://<sessionId> -output . -format json,markdown,raw
pipx run agent-dump claude://<sessionId> -output . -format json,markdown,raw
```

## 技术栈

- Bun
- React
- WXT
- Vite
- Tailwind CSS
- shadcn/ui
- oxlint
- oxfmt

## 开发命令

```bash
bun install
bun run dev
bun run build
bun run typecheck
bun run lint
bun run lint:fix
bun run lint:format
bun run checkall
bun run icons
bun run zip
```

## 图标生成

插件图标源文件为：

- `public/logo.svg`

执行下面的命令会生成扩展所需 PNG 图标：

```bash
bun run icons
```

输出文件：

- `public/icons/icon-16.png`
- `public/icons/icon-32.png`
- `public/icons/icon-48.png`
- `public/icons/icon-128.png`

## 打包分发

执行：

```bash
bun run zip
```

会自动完成：

1. 基于 WXT 构建插件到 `dist/chrome-mv3/`
2. 使用 WXT 输出 zip 分发包

未压缩构建产物目录：

- `dist/chrome-mv3/`

zip 分发包默认输出到：

- `dist/fin-agent-owl-{version}-chrome.zip`

zip 分发包由 `wxt zip` 生成，不再使用自定义 `package` 脚本或 `release/` 目录。

如果修改了 `public/logo.svg`，先手动执行一次 `bun run icons` 再构建。

## 格式化与 Lint

仓库使用：

- `oxlint`：静态检查
- `oxfmt`：代码格式化

当前先保留最小配置，后续如果需要控制行宽、缩进或迁移规则，可以在这个文件里扩展。

## 目录结构

```text
.
├─ public/
├─ scripts/
├─ src/
├─ wxt.config.ts
├─ .oxfmtrc.json
├─ .oxlintrc.json
├─ LICENSE
├─ CHANGELOG.md
└─ README.md
```

## License

MIT
