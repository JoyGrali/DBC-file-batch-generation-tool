# DBC编辑器启动脚本 (PowerShell版本)
# 支持Windows PowerShell和PowerShell Core

param(
    [int]$Port = 8080,
    [switch]$NoAutoOpen
)

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "DBC文件编辑器 v2.0"

# 颜色定义
$ColorSuccess = "Green"
$ColorError = "Red" 
$ColorInfo = "Cyan"
$ColorWarning = "Yellow"

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Show-Banner {
    Clear-Host
    Write-ColorText "================================================================" $ColorInfo
    Write-ColorText "                     DBC文件编辑器 v2.0                        " $ColorInfo
    Write-ColorText "================================================================" $ColorInfo
    Write-Host ""
    Write-ColorText "🚀 多通道CAN报文批量生成工具" $ColorSuccess
    Write-ColorText "🔧 支持可配置字段系统" $ColorSuccess
    Write-ColorText "📊 图形化位图显示" $ColorSuccess
    Write-Host ""
}

function Test-Port {
    param([int]$TestPort)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $TestPort)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

function Find-FreePort {
    param([int]$StartPort = 8080)
    
    for ($i = $StartPort; $i -lt ($StartPort + 100); $i++) {
        if (Test-Port $i) {
            return $i
        }
    }
    return $null
}

function Start-DBCEditor {
    Show-Banner
    
    # 切换到脚本目录
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $ScriptDir
    Write-ColorText "📁 工作目录: $ScriptDir" $ColorInfo
    
    # 检查必要文件
    $RequiredFiles = @("index.html", "styles.css", "script.js")
    $MissingFiles = @()
    
    foreach ($file in $RequiredFiles) {
        if (-not (Test-Path $file)) {
            $MissingFiles += $file
        }
    }
    
    if ($MissingFiles.Count -gt 0) {
        Write-ColorText "❌ 错误：缺少必要文件: $($MissingFiles -join ', ')" $ColorError
        Read-Host "按回车键退出"
        return
    }
    
    # 检查Python
    try {
        $PythonVersion = python --version 2>$null
        Write-ColorText "🐍 Python版本: $PythonVersion" $ColorSuccess
    }
    catch {
        Write-ColorText "❌ 错误：未找到Python，请先安装Python 3.x" $ColorError
        Write-ColorText "📥 下载地址：https://www.python.org/downloads/" $ColorWarning
        Read-Host "按回车键退出"
        return
    }
    
    # 查找可用端口
    Write-ColorText "🔍 正在查找可用端口..." $ColorInfo
    $FreePort = Find-FreePort $Port
    
    if ($null -eq $FreePort) {
        Write-ColorText "❌ 错误：无法找到可用端口" $ColorError
        Read-Host "按回车键退出"
        return
    }
    
    Write-ColorText "✅ 使用端口: $FreePort" $ColorSuccess
    
    # 启动HTTP服务器
    Write-ColorText "🌐 正在启动HTTP服务器..." $ColorInfo
    
    try {
        $ServerJob = Start-Job -ScriptBlock {
            param($Port, $Directory)
            Set-Location $Directory
            python -m http.server $Port
        } -ArgumentList $FreePort, $ScriptDir
        
        # 等待服务器启动
        Start-Sleep -Seconds 2
        
        $ServerUrl = "http://localhost:$FreePort"
        
        # 打开浏览器
        if (-not $NoAutoOpen) {
            Write-ColorText "🌍 正在打开浏览器..." $ColorInfo
            Start-Process $ServerUrl
        }
        
        Write-Host ""
        Write-ColorText "================================================================" $ColorSuccess
        Write-ColorText "✅ DBC编辑器启动成功！" $ColorSuccess
        Write-ColorText "🌐 访问地址: $ServerUrl" $ColorInfo
        Write-Host ""
        Write-ColorText "📖 使用说明:" $ColorWarning
        Write-ColorText "   1. 🔧 字段配置管理 - 自定义报文ID字段结构" 
        Write-ColorText "   2. 📊 位图可视化 - 实时显示字段分布和冲突"
        Write-ColorText "   3. 🎯 报文编辑 - 添加信号定义"
        Write-ColorText "   4. 🚀 批量生成 - 一键生成多通道报文"
        Write-ColorText "   5. 📁 DBC导出 - 标准DBC文件输出"
        Write-Host ""
        Write-ColorText "================================================================" $ColorSuccess
        Write-Host ""
        Write-ColorText "⏹️  按 Ctrl+C 或关闭此窗口停止服务器" $ColorWarning
        Write-Host ""
        
        # 等待用户中断
        try {
            Wait-Job $ServerJob
        }
        catch [System.Management.Automation.PipelineStoppedException] {
            Write-ColorText "🛑 正在关闭服务器..." $ColorWarning
        }
        
    }
    catch {
        Write-ColorText "❌ 启动服务器失败: $($_.Exception.Message)" $ColorError
        Read-Host "按回车键退出"
        return
    }
    finally {
        # 清理
        if ($ServerJob) {
            Stop-Job $ServerJob -ErrorAction SilentlyContinue
            Remove-Job $ServerJob -ErrorAction SilentlyContinue
        }
        Write-ColorText "✅ 服务器已关闭" $ColorSuccess
    }
}

# 主程序入口
Start-DBCEditor