#!/bin/bash
set -e

echo "===== Cotton Lowcode 部署脚本 ====="

# 进入项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "[1/3] 构建镜像..."
docker compose -f docker/docker-compose.yml build

echo "[2/3] 启动服务..."
docker compose -f docker/docker-compose.yml up -d

echo "[3/3] 等待服务就绪..."
sleep 3

echo ""
echo "===== 部署完成 ====="
echo "前端访问地址: http://8.130.38.145/cotton"
echo "后端 API:     http://8.130.38.145/cotton/api/pages"
echo "Swagger 文档: http://8.130.38.145:3001/api/docs"
echo ""
echo "常用命令:"
echo "  查看日志: docker compose -f docker/docker-compose.yml logs -f"
echo "  停止服务: docker compose -f docker/docker-compose.yml down"
echo "  重启服务: docker compose -f docker/docker-compose.yml restart"
