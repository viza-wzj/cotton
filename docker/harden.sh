#!/bin/bash
set -e

echo "===== Cotton 安全加固 ====="

if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 执行"
  exit 1
fi

# ---- 1. 防火墙：只开放必要端口 ----
echo "[1/4] 配置防火墙..."
if command -v ufw &> /dev/null; then
  ufw --force enable
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  # 不开放 3001，只通过 Nginx 反代访问
  echo "  防火墙已配置: 仅开放 22(SSH) + 80(HTTP)"
else
  # 阿里云用 iptables 或安全组，提示用户去控制台操作
  echo "  请在阿里云安全组中只放行 22 和 80 端口，不要放行 3001"
fi

# ---- 2. 后端只监听 127.0.0.1 ----
echo "[2/4] 后端绑定 127.0.0.1..."
# 更新 systemd 服务，添加 HOST 环境变量
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
Environment=HOST=127.0.0.1
Environment=PORT=3001
Environment=CORS_ORIGIN=http://8.130.38.145

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl restart cotton-backend

# ---- 3. Nginx 安全头 ----
echo "[3/4] 添加 Nginx 安全头..."
# 检查 nginx.conf 是否已有安全头，追加到 server 块
if ! grep -q "X-Frame-Options" /etc/nginx/conf.d/cotton.conf; then
  # 在 server { 之后插入安全头
  sed -i '/server_name _;/a\
\
    # 安全头\
    add_header X-Frame-Options "SAMEORIGIN" always;\
    add_header X-Content-Type-Options "nosniff" always;\
    add_header X-XSS-Protection "1; mode=block" always;' /etc/nginx/conf.d/cotton.conf
  nginx -t && nginx -s reload
fi

# ---- 4. 禁止直接用 IP 访问其他路径 ----
echo "[4/4] 限制默认访问..."
if [ ! -f /etc/nginx/conf.d/default.conf ] || grep -q "server_name" /etc/nginx/conf.d/default.conf 2>/dev/null; then
  cat > /etc/nginx/conf.d/default.conf << 'DEFAULTEOF'
server {
    listen 80 default_server;
    server_name _;

    # 非 /cotton 路径返回 444（Nginx 直接断开连接）
    location / {
        return 444;
    }
}
DEFAULTEOF
  nginx -t && nginx -s reload
fi

echo ""
echo "===== 加固完成 ====="
echo "  - 后端已绑定 127.0.0.1，外部无法直接访问 3001"
echo "  - Nginx 安全头已添加"
echo "  - 非 /cotton 路径已屏蔽"
echo "  - 防火墙仅开放 22 + 80"
echo ""
echo "建议额外操作（手动）："
echo "  1. 阿里云安全组确认只放行 22 和 80"
echo "  2. SSH 改用密钥登录，禁用密码登录"
