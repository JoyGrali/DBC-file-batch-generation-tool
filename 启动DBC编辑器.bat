@echo off
chcp 65001 >nul
title DBC文件编辑器 - 启动中...

echo ================================================================
echo                     DBC文件编辑器 v2.0
echo ================================================================
echo.
echo 正在启动本地服务器...

cd /d "%~dp0"

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误：未找到Python，请先安装Python 3.x
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

:: 查找可用端口
set PORT=8080
:check_port
netstat -an | findstr ":%PORT%" >nul 2>&1
if not errorlevel 1 (
    set /a PORT+=1
    goto check_port
)

echo 使用端口: %PORT%
echo 启动HTTP服务器...

:: 启动Python HTTP服务器
start /min python -m http.server %PORT%

:: 等待服务器启动
timeout /t 2 /nobreak >nul

:: 打开浏览器
echo 正在打开浏览器...
start http://localhost:%PORT%

echo.
echo ================================================================
echo DBC编辑器已启动，浏览器将自动打开
echo 服务器地址: http://localhost:%PORT%
echo 
echo 使用说明:
echo 1. 在"字段配置管理"中设置报文ID结构
echo 2. 在"报文ID数值配置"中设置字段值
echo 3. 添加信号定义
echo 4. 批量生成多通道报文
echo 5. 导出DBC文件
echo.
echo 关闭此窗口将停止服务器
echo ================================================================
echo.

:: 保持窗口打开，按任意键关闭服务器
echo 按任意键关闭服务器并退出...
pause >nul

:: 关闭服务器进程
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%PORT%"') do (
    taskkill /PID %%i /F >nul 2>&1
)

echo 服务器已关闭。
timeout /t 1 /nobreak >nul