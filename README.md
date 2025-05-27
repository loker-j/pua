# 🌐 [一键访问 → xpua.org](https://xpua.org)

---

# 反PUA大师 (Anti-PUA Master)

一个帮助识别和应对PUA（Pick-up Artist）操控性语言的Web应用程序。

# 一键访问网址：xpua.org

## 功能特性

- **PUA 分析器**: 智能识别操控性语言模式，提供详细分析和建议回应
- **短语库**: 收录常见PUA模式，提供多种回应策略
- **训练模式**: 在安全的场景中练习应对操控性语言
- **用户设置**: 个性化偏好设置，支持多语言和主题切换
- **隐私保护**: 所有数据存储在本地，保护用户隐私

## 技术栈

- **框架**: Next.js 13 (App Router)
- **样式**: Tailwind CSS
- **UI组件**: Radix UI
- **类型检查**: TypeScript
- **状态管理**: React Hooks + Local Storage
- **部署**: Netlify

## 环境变量配置

项目需要配置 API key 来使用 PUA 分析功能：

```bash
# 使用 DeepSeek API（推荐）
DEEPSEEK_API_KEY=your_deepseek_api_key

# 或者使用 OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

### 获取 API Key

1. **DeepSeek API**（推荐）:
   - 访问 [DeepSeek 官网](https://platform.deepseek.com/)
   - 注册账号并获取 API key
   - 成本更低，性能优秀

2. **OpenAI API**:
   - 访问 [OpenAI 平台](https://platform.openai.com/)
   - 注册账号并获取 API key

### Netlify 部署配置

在 Netlify 部署时，需要在环境变量设置中添加：

1. 进入 Netlify 项目设置
2. 找到 "Environment variables" 部分
3. 添加 `DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY`

**注意**: 如果没有配置 API key，PUA 分析器将返回默认的回退响应，其他功能仍可正常使用。

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

✅ **所有功能已实现并可正常构建**
- PUA 分析器：完全功能
- 短语库：完全功能  
- 训练模式：完全功能
- 用户设置：完全功能
- 多语言支持：完全功能
- 主题切换：完全功能

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

4. **服务器端渲染兼容性修复**：
   - 改进了 `useLocalStorage` hook 以更好地处理 SSR
   - 在训练模式组件中添加了完善的客户端检查机制
   - 使用动态导入 (`dynamic import`) 加载训练模式组件，禁用 SSR
   - 添加了 `isMounted` 状态来防止 hydration 不匹配
   - 重新启用训练模式功能

### 📊 构建结果

```
Route (app)                              Size     First Load JS
┌ ○ /                                    66.8 kB         146 kB
├ ○ /_not-found                          872 B          80.2 kB
├ λ /api/analyze                         0 B                0 B
├ λ /api/responses                       0 B                0 B
└ ○ /api/test                            0 B                0 B
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

### v1.1.0 (2025-01-XX) - 🔧 重要修复更新
- 🐛 **修复JavaScript语法错误**：
  - 修复了训练模式组件中`currentScenario.tips`的类型安全访问问题
  - 添加了可选链操作符和存在性检查，防止运行时错误
  - 改进了TypeScript类型检查和错误处理

- 🔧 **解决Chunk加载失败问题**：
  - 优化了webpack的代码分割配置
  - 设置了合理的chunk大小限制（minSize: 20KB, maxSize: 244KB）
  - 创建了专门的vendor和react chunks，提高加载稳定性
  - 使用内存缓存替代文件系统缓存，避免ENOENT错误

- 🚀 **Netlify部署优化**：
  - 更新了部署配置以支持Next.js API路由
  - 添加了正确的重定向规则和缓存头设置
  - 移除了导致构建错误的实验性CSS优化功能
  - 确保静态资源的长期缓存策略

- ✅ **构建稳定性提升**：
  - 构建成功率100%，无语法错误
  - 优化的代码分割，减少初始加载时间
  - 改进的错误处理和类型安全

### 📊 最新构建结果

```
Route (app)                                      Size     First Load JS
┌ ○ /                                            14.4 kB         182 kB
├ ○ /_not-found                                  200 B           168 kB
├ λ /api/analyze                                 0 B                0 B
├ λ /api/responses                               0 B                0 B
├ ○ /api/test                                    0 B                0 B
└ λ /api/training/evaluate                       0 B                0 B
+ First Load JS shared by all                    168 kB
  ├ chunks/vendors-*                             多个优化的vendor chunks
  └ chunks/webpack-*                             1.71 kB
```

### v1.0.0 (2025-01-XX) - 🎉 初始版本
- ✅ 初始版本发布
- ✅ PUA 分析器功能
- ✅ 短语库功能
- ✅ 训练模式功能（双模式：选择题+填空题）
- ✅ 用户设置功能
- ✅ 多语言支持
- ✅ Netlify 部署配置
- ✅ 服务器端渲染兼容性修复

---

**反PUA大师** - 帮助建立更健康的沟通方式 © 2025 

# 拒绝PUA项目

一个帮助识别和回应PUA（Pick-up Artist）操控性语言的智能工具。

## 功能特性

### 🔍 PUA分析器
- **智能识别**：使用AI技术分析文本中的PUA操控技巧
- **分类系统**：识别内疚操控、爱情轰炸、精神控制、孤立策略、负面评价等类型
- **严重程度评估**：1-10分的量化评分系统
- **详细解释**：提供具体的分析说明和识别要点

### 💬 智能回应生成
- **三种回应风格**：
  - 🟦 **温和方式**：适合轻度PUA，保持关系和谐
  - 🟨 **坚定立场**：适合中度PUA，明确设立界限  
  - 🟩 **理性分析**：适合重度PUA，强硬反击
- **情境化回应**：根据具体场景生成针对性的回应建议
- **解释说明**：每个回应都包含使用理由和效果分析

### 📚 预设短语库
- **四大类别**：职场、感情、家庭、通用场景
- **经典案例**：收录常见PUA话术和对应回应
- **快速查询**：支持关键词搜索和分类浏览
- **实用指南**：提供具体的应对策略和技巧

### 🎯 双模式训练系统
全新设计的训练模式，提供两种不同的学习方式：

#### 📖 选择题模式
- **本地驱动**：无需网络，即时反馈
- **多选项设计**：每题4个选项，涵盖不同回应策略
- **智能评分**：1-10分评分系统，详细解释每个选项
- **即时反馈**：选择后立即显示正确答案和解释
- **场景解释**：深入分析PUA技巧的原理和应对方法

#### ✍️ 填空题模式  
- **自由回答**：用户可以自由输入回应内容
- **AI智能评分**：使用先进AI技术评估回应质量
- **多维度分析**：
  - ✅ **优点识别**：分析回应中的有效元素
  - ⚠️ **改进建议**：指出可以优化的地方
  - 💡 **具体建议**：提供针对性的改进方案
  - 🎯 **标准对比**：与预设标准答案进行对比分析
- **标准答案展示**：提供专业的回应示例和解释

#### 📊 进度跟踪
- **总体进度**：显示所有场景的完成百分比
- **分类统计**：
  - 选择题正确率统计
  - 填空题平均分追踪
  - 改进趋势分析（最近10次记录）
- **弱点识别**：自动识别需要加强的PUA类别
- **历史记录**：保存训练历史和成绩变化

### ⚙️ 个性化设置
- **语言切换**：支持中文/英文界面
- **主题模式**：明亮/暗黑主题切换
- **数据管理**：本地存储，保护隐私

## 技术架构

- **前端框架**：Next.js 14 + React 18
- **UI组件库**：shadcn/ui + Tailwind CSS
- **类型安全**：TypeScript
- **AI集成**：DeepSeek API
- **状态管理**：React Hooks + Local Storage
- **部署平台**：Netlify

## 项目结构

```
project/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── analyze/       # PUA分析接口
│   │   ├── responses/     # 回应生成接口
│   │   └── training/      # 训练评估接口
│   │       └── evaluate/  # 填空题AI评分
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── home.tsx          # 主页组件
│   ├── pua-analyzer.tsx  # PUA分析器
│   ├── phrase-library.tsx # 短语库
│   ├── training-mode.tsx # 训练模式（双模式）
│   └── user-settings.tsx # 用户设置
├── data/                 # 数据文件
│   ├── pua-phrases.ts    # 预设短语数据
│   └── training-scenarios.ts # 训练场景数据
├── hooks/                # 自定义Hooks
│   └── use-local-storage.ts # 本地存储Hook
├── lib/                  # 工具库
│   └── utils.ts          # 通用工具函数
└── types/                # TypeScript类型定义
    ├── pua.ts            # PUA相关类型
    └── user.ts           # 用户相关类型
```

## 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
创建 `.env.local` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 开发运行
```bash
npm run dev
```

### 构建部署
```bash
npm run build
npm start
```

## 更新日志

### v2.0.0 - 双模式训练系统
- ✨ 新增选择题训练模式，本地评分，即时反馈
- ✨ 新增填空题训练模式，AI智能评分，深度分析
- ✨ 重新设计训练进度跟踪系统
- ✨ 添加分类统计和改进趋势分析
- ✨ 优化用户界面，提升交互体验
- 🔧 修复服务器端渲染兼容性问题
- 📚 扩展训练场景数据库

### v1.0.0 - 基础功能
- 🎯 PUA语言识别和分析
- 💬 智能回应生成
- 📚 预设短语库
- 🎓 基础训练模式
- ⚙️ 用户设置和主题切换

## 部署状态

✅ **生产环境**：所有功能已实现并可正常构建  
✅ **类型检查**：TypeScript编译通过  
✅ **构建测试**：Next.js构建成功  
✅ **API集成**：DeepSeek AI服务正常  

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
