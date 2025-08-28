Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' 检查批处理文件是否存在
strBatchFile = strScriptPath & "\启动DBC编辑器.bat"
If objFSO.FileExists(strBatchFile) Then
    ' 静默运行批处理文件
    objShell.Run """" & strBatchFile & """", 1, False
Else
    ' 如果批处理文件不存在，尝试运行Python脚本
    strPythonFile = strScriptPath & "\启动DBC编辑器.py"
    If objFSO.FileExists(strPythonFile) Then
        objShell.Run "python """ & strPythonFile & """", 1, False
    Else
        MsgBox "错误：未找到启动文件！", 16, "DBC编辑器"
    End If
End If