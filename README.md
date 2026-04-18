# Cotton Low-Code

一个面向 C 端移动页面搭建的低代码平台，采用前后端分离的 monorepo 架构：

- 前端：React + TypeScript + Vite（可视化编辑器）
- 后端：NestJS + LowDB（页面/模板管理 API）

## 项目结构

```text
cotton/
├── apps/
│   ├── editor/    # 前端编辑器（当前主编辑器：移动端业务组件版）
│   └── backend/   # 后端 API 服务
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 核心能力

- 拖拽/点击添加业务组件到画布
- 移动端设备尺寸切换（iPhone/Android/iPad）
- 组件属性实时编辑
- 编辑区 + 预览区并排实时渲染
- 页面与模板的创建、查询、更新、删除（CRUD）

## 技术栈

### Frontend (`apps/editor`)

- React 18
- TypeScript 5
- Vite 5
- Zustand（编辑器状态管理）
- dnd-kit（拖拽）
- Tailwind CSS（界面样式）

### Backend (`apps/backend`)

- NestJS 10
- class-validator / class-transformer
- Swagger（API 文档）
- LowDB（JSON 文件持久化）

## 架构说明（简版）

1. 前端编辑器维护页面 Schema（组件树、属性、样式、元数据）  
2. 用户在画布上操作组件，状态写入 Zustand Store  
3. 前端通过 `apps/editor/src/services/api.ts` 调用后端 `/pages` 和 `/templates`  
4. 后端通过 `DatabaseService` 将数据持久化到 `apps/backend/data/cotton-db.json`

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp apps/editor/.env.example apps/editor/.env
cp apps/backend/.env.example apps/backend/.env
```

默认配置：

- `apps/editor/.env`: `VITE_API_BASE_URL=/api`
- `apps/backend/.env`: `PORT=3001`
- `apps/backend/.env`: `CORS_ORIGIN=http://localhost:3000,http://localhost:5173`

### 3. 启动开发环境（前后端同时）

```bash
pnpm dev
```

启动后默认地址：

- Editor: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## 常用脚本

```bash
# 同时启动全部应用
pnpm dev

# 仅启动前端
pnpm dev:editor

# 仅启动后端
pnpm dev:backend

# 构建全部应用
pnpm build

# 仅构建前端
pnpm build:editor

# 仅构建后端
pnpm build:backend
```

## API 概览

### 页面管理 `/pages`

- `POST /pages` 创建页面
- `GET /pages` 获取页面列表
- `GET /pages/:id` 获取页面详情
- `PUT /pages/:id` 更新页面
- `DELETE /pages/:id` 删除页面

说明：`POST /pages` 由后端生成页面 `id`，请求体无需传 `id`。

### 模板管理 `/templates`

- `POST /templates` 创建模板
- `GET /templates` 获取模板列表
- `GET /templates/:id` 获取模板详情
- `PUT /templates/:id` 更新模板
- `DELETE /templates/:id` 删除模板

说明：`POST /templates` 由后端生成模板 `id`，请求体无需传 `id`。

### 错误返回格式

后端统一返回：

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Template xxx not found",
    "details": [],
    "statusCode": 404,
    "timestamp": "2026-04-16T13:00:00.000Z",
    "path": "/templates/xxx"
  }
}
```

## 数据与配置

- 后端数据文件：`apps/backend/data/cotton-db.json`
- 后端默认端口：`3001`（可通过环境变量 `PORT` 覆盖）
- 后端 CORS 白名单：`CORS_ORIGIN`（逗号分隔）
- 前端 API 基础地址：`VITE_API_BASE_URL`（默认 `/api`，由 Vite 代理到后端）
- 页面/模板 `content` 包含 `schemaVersion`，后端会对历史数据自动补默认值（当前 `1.0.0`）

## 说明

- 当前编辑器主路径为移动端业务组件编辑器：`apps/editor/src/pages/Editor/MobileEditorLayout.tsx`
- 若你需要扩展业务组件，优先从 `apps/editor/src/constants/business-components.ts` 和 `apps/editor/src/components/EditorCanvas/BusinessComponentRender.tsx` 入手
