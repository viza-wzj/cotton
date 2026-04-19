#!/bin/bash
set -e

SERVER="root@8.130.38.145"
REMOTE_DIR="/opt/cotton"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "===== Cotton 更新部署 ====="

# ---- 1. 本地构建 ----
echo "[1/3] 构建前端 & 后端..."
cd "$PROJECT_DIR"
pnpm build:editor
pnpm build:backend

# ---- 2. 上传 ----
echo "[2/3] 上传到服务器..."

# 上传前端静态文件
scp -r apps/editor/dist/* "$SERVER:/usr/share/nginx/cotton/"

# 上传后端 dist
ssh "$SERVER" "mkdir -p $REMOTE_DIR/backend/dist"
scp -r apps/backend/dist/* "$SERVER:$REMOTE_DIR/backend/dist/"

# ---- 3. 重启 ----
echo "[3/3] 重启服务..."
ssh "$SERVER" << 'EOF'
systemctl restart cotton-backend
nginx -s reload
EOF

echo ""
echo "===== 更新完成 ====="
echo "访问: http://8.130.38.145/cotton"
