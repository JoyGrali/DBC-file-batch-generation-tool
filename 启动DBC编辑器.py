#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DBC文件编辑器启动脚本
支持Windows、macOS和Linux
"""

import os
import sys
import time
import socket
import webbrowser
import subprocess
from pathlib import Path

def find_free_port(start_port=8080):
    """查找可用端口"""
    port = start_port
    while port < start_port + 100:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            port += 1
    return None

def start_server(port):
    """启动HTTP服务器"""
    try:
        if sys.platform.startswith('win'):
            # Windows
            return subprocess.Popen([
                sys.executable, '-m', 'http.server', str(port)
            ], creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            # macOS/Linux
            return subprocess.Popen([
                sys.executable, '-m', 'http.server', str(port)
            ])
    except Exception as e:
        print(f"启动服务器失败: {e}")
        return None

def main():
    print("=" * 60)
    print("                 DBC文件编辑器 v2.0")
    print("=" * 60)
    print()
    
    # 切换到脚本所在目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    print(f"工作目录: {script_dir}")
    
    # 检查必要文件
    required_files = ['index.html', 'styles.css', 'script.js']
    missing_files = [f for f in required_files if not (script_dir / f).exists()]
    
    if missing_files:
        print(f"错误：缺少必要文件: {', '.join(missing_files)}")
        input("按回车键退出...")
        return
    
    # 查找可用端口
    print("正在查找可用端口...")
    port = find_free_port()
    if not port:
        print("错误：无法找到可用端口")
        input("按回车键退出...")
        return
    
    print(f"使用端口: {port}")
    
    # 启动服务器
    print("正在启动HTTP服务器...")
    server_process = start_server(port)
    
    if not server_process:
        print("错误：无法启动服务器")
        input("按回车键退出...")
        return
    
    # 等待服务器启动
    print("等待服务器启动...")
    time.sleep(2)
    
    # 打开浏览器
    url = f"http://localhost:{port}"
    print(f"正在打开浏览器: {url}")
    
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"无法自动打开浏览器: {e}")
        print(f"请手动在浏览器中打开: {url}")
    
    print()
    print("=" * 60)
    print("DBC编辑器已启动！")
    print(f"访问地址: {url}")
    print()
    print("功能说明:")
    print("1. 🔧 字段配置管理 - 自定义报文ID字段结构")
    print("2. 📊 位图可视化 - 实时显示字段分布和冲突")
    print("3. 🎯 报文编辑 - 添加信号定义")
    print("4. 🚀 批量生成 - 一键生成多通道报文")
    print("5. 📁 DBC导出 - 标准DBC文件输出")
    print()
    print("=" * 60)
    print()
    
    try:
        input("按回车键关闭服务器...")
    except KeyboardInterrupt:
        print("\n正在关闭...")
    
    # 关闭服务器
    print("正在关闭服务器...")
    server_process.terminate()
    
    try:
        server_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        server_process.kill()
    
    print("服务器已关闭。")

if __name__ == "__main__":
    main()