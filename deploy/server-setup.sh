#!/bin/bash
set -e

echo "===== Cotton Lowcode 服务器部署 ====="

# 检查是否 root
if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 执行此脚本"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ---- 1. 安装 Node.js（如果没有）----
if ! command -v node &> /dev/null; then
  echo "[1/4] 安装 Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
else
  echo "[1/4] Node.js 已安装: $(node -v)"
fi

# ---- 2. 安装后端生产依赖 ----
echo "[2/4] 安装后端生产依赖..."
cd "$SCRIPT_DIR/backend"
npm install --omit=dev

# ---- 3. 配置 Nginx ----
echo "[3/4] 配置 Nginx..."
if ! command -v nginx &> /dev/null; then
  apt-get update && apt-get install -y nginx
fi

# 复制前端静态文件到 Nginx 目录
rm -rf /usr/share/nginx/cotton
mkdir -p /usr/share/nginx/cotton
cp -r "$SCRIPT_DIR"/*.html "$SCRIPT_DIR"/assets /usr/share/nginx/cotton/

# 复制 Nginx 配置
cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/conf.d/cotton.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && nginx -s reload

echo "[4/4] 配置后端服务..."
# ---- 4. 用 systemd 托管后端进程 ----
cat > /etc/systemd/system/cotton-backend.service << 'EOF'
[Unit]
Description=Cotton Backend Service
After=network.target

[Service]
WorkingDirectory=/opt/cotton/backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=CORS_ORIGIN=http://8.130.38.145

[Install]
WantedBy=multi-user.target
EOF

# 把项目复制到 /opt
rm -rf /opt/cotton
cp -r "$SCRIPT_DIR" /opt/cotton

systemctl daemon-reload
systemctl enable cotton-backend
systemctl restart cotton-backend

echo ""
echo "===== 部署完成 ====="
echo "前端: http://8.130.38.145/cotton"
echo "API:  http://8.130.38.145/cotton/api/pages"
echo ""
echo "管理命令:"
echo "  查看后端日志: journalctl -u cotton-backend -f"
echo "  重启后端:     systemctl restart cotton-backend"
echo "  重启 Nginx:   systemctl restart nginx"
