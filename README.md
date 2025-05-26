# 反PUA大师 (Anti-PUA Master)

一个帮助识别和应对PUA（Pick-up Artist）操控性语言的Web应用程序。

## 功能特性

- **PUA分析器**: 分析文本中的操控性语言模式
- **短语库**: 浏览常见的PUA模式和建议的回应方式
- **训练模式**: 在安全的场景中练习应对操控性语言（暂时禁用）
- **用户设置**: 自定义语言、主题和偏好设置
- **多语言支持**: 支持中文和英文
- **响应式设计**: 适配桌面和移动设备

## 技术栈

- **框架**: Next.js 13 (App Router)
- **样式**: Tailwind CSS
- **UI组件**: Radix UI
- **类型检查**: TypeScript
- **状态管理**: React Hooks + Local Storage
- **部署**: Netlify

## 项目结构

```
project/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   ├── home.tsx        # 主页组件
│   ├── pua-analyzer.tsx # PUA 分析器
│   ├── phrase-library.tsx # 短语库
│   ├── training-mode.tsx # 训练模式
│   └── user-settings.tsx # 用户设置
├── data/               # 数据文件
│   ├── pua-database.ts # PUA 模式数据库
│   └── training-scenarios.ts # 训练场景
├── hooks/              # 自定义 Hooks
│   └── use-local-storage.ts # 本地存储 Hook
├── types/              # TypeScript 类型定义
│   ├── pua.ts          # PUA 相关类型
│   └── user.ts         # 用户相关类型
├── netlify.toml        # Netlify 配置
└── README.md           # 项目说明
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npx tsc --noEmit
```

## 部署状态

✅ **主要功能已实现并可正常构建**
- PUA 分析器：完全功能
- 短语库：完全功能  
- 用户设置：完全功能
- 多语言支持：完全功能
- 主题切换：完全功能

⚠️ **训练模式功能暂时禁用**
- 原因：服务器端渲染兼容性问题
- 状态：正在修复中
- 影响：不影响核心功能使用

## 修复记录

### 🔧 Netlify 部署问题修复

1. **TypeScript 类型错误修复**：
   - 更新了 `PUACategory` 类型定义
   - 添加了具体的 PUA 技巧类别：`"Guilt-tripping" | "Love bombing" | "Gaslighting" | "Isolation tactics" | "Negging"`
   - 修复了 `training-scenarios.ts` 中的类型不匹配问题

2. **组件标签函数更新**：
   - 更新了 `user-settings.tsx` 和 `phrase-library.tsx` 中的 `getCategoryLabel` 函数
   - 添加了新 PUA 技巧类别的中英文标签映射

3. **依赖问题修复**：
   - 安装了缺失的 `encoding` 包以解决 node-fetch 依赖问题
   - 更新了 browserslist 数据库

4. **服务器端渲染问题处理**：
   - 在训练模式组件中添加了客户端检查
   - 暂时禁用训练模式以确保构建成功

### 📊 构建结果

```
Route (app)                              Size     First Load JS
┌ ○ /                                    65.5 kB         145 kB
├ ○ /_not-found                          872 B          80.1 kB
└ λ /api/analyze                         0 B                0 B
+ First Load JS shared by all            79.3 kB
```

## 特性说明

### PUA 分析器
- 智能识别操控性语言模式
- 提供详细的分析结果和建议
- 支持多种 PUA 技巧检测

### 短语库
- 收录常见的 PUA 模式
- 提供三种回应风格：温和、坚定、理性分析
- 支持收藏和分类浏览

### 用户设置
- 语言切换（中文/英文）
- 主题切换（浅色/深色/跟随系统）
- 个性化偏好设置
- 历史记录管理

## 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器支持

## 部署配置

项目已配置 Netlify 自动部署：

```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 注意事项

- 本应用仅供教育目的使用
- 如遇严重情况，请寻求专业帮助
- 所有数据存储在本地，保护用户隐私
- 建议在安全环境下使用

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-01-XX)
- ✅ 初始版本发布
- ✅ PUA 分析器功能
- ✅ 短语库功能
- ✅ 用户设置功能
- ✅ 多语言支持
- ✅ Netlify 部署配置
- ⚠️ 训练模式暂时禁用

---

**反PUA大师** - 帮助建立更健康的沟通方式 © 2025 