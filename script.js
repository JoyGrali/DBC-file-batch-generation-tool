// DBC编辑器 - 支持多报文的增强版本
class DBCEditor {
    constructor() {
        this.fields = [];
        this.messages = []; // 多报文数组
        this.generatedMessages = [];
        this.frameFormat = 'extended'; // 'standard' 或 'extended'
        this.maxBits = 29; // CAN扩展ID最大位数
        this.messageIdCounter = 1; // 报文ID计数器
        this.templates = {
            'default': [
                { 
                    name: '板卡类型', 
                    bits: 4, 
                    segments: [{position: 20, bits: 4}], 
                    description: '设备板卡类型',
                    usedForBatch: false
                },
                { 
                    name: '通道编号', 
                    bits: 8, 
                    segments: [{position: 12, bits: 8}], 
                    description: '通道编号',
                    usedForBatch: true,
                    batchRange: {min: 0, max: 15}
                },
                { 
                    name: '功能码', 
                    bits: 4, 
                    segments: [{position: 8, bits: 4}], 
                    description: '报文功能代码',
                    usedForBatch: false
                },
                { 
                    name: '板子编号', 
                    bits: 5, 
                    segments: [{position: 3, bits: 5}], 
                    description: '硬件板卡编号',
                    usedForBatch: false
                },
                { 
                    name: 'Box编号', 
                    bits: 3, 
                    segments: [{position: 0, bits: 3}], 
                    description: '设备盒编号',
                    usedForBatch: false
                }
            ],
            'simple': [
                { 
                    name: '通道编号', 
                    bits: 8, 
                    segments: [{position: 16, bits: 8}], 
                    description: '通道编号',
                    usedForBatch: true,
                    batchRange: {min: 0, max: 31}
                },
                { 
                    name: '功能码', 
                    bits: 8, 
                    segments: [{position: 8, bits: 8}], 
                    description: '功能代码',
                    usedForBatch: false
                },
                { 
                    name: '设备ID', 
                    bits: 8, 
                    segments: [{position: 0, bits: 8}], 
                    description: '设备标识',
                    usedForBatch: false
                }
            ],
            'split_channel': [
                { 
                    name: '板卡类型', 
                    bits: 4, 
                    segments: [{position: 26, bits: 4}], 
                    description: '设备板卡类型',
                    usedForBatch: false
                },
                { 
                    name: '通道编号', 
                    bits: 8, 
                    segments: [{position: 23, bits: 3}, {position: 5, bits: 5}], 
                    description: '通道编号(分段配置示例)',
                    usedForBatch: true,
                    batchRange: {min: 1, max: 50}
                },
                { 
                    name: '功能码', 
                    bits: 6, 
                    segments: [{position: 16, bits: 4}, {position: 10, bits: 2}], 
                    description: '功能代码(分段配置)',
                    usedForBatch: false
                },
                { 
                    name: '设备ID', 
                    bits: 5, 
                    segments: [{position: 0, bits: 5}], 
                    description: '设备标识',
                    usedForBatch: false
                }
            ],
            'standard_simple': [
                { 
                    name: '通道编号', 
                    bits: 6, 
                    segments: [{position: 5, bits: 6}], 
                    description: '通道编号(标准帧)',
                    usedForBatch: true,
                    batchRange: {min: 0, max: 63}
                },
                { 
                    name: '功能码', 
                    bits: 3, 
                    segments: [{position: 2, bits: 3}], 
                    description: '功能代码',
                    usedForBatch: false
                },
                { 
                    name: '设备ID', 
                    bits: 2, 
                    segments: [{position: 0, bits: 2}], 
                    description: '设备标识',
                    usedForBatch: false
                }
            ],
            'standard_detailed': [
                { 
                    name: '板卡类型', 
                    bits: 2, 
                    segments: [{position: 9, bits: 2}], 
                    description: '设备板卡类型',
                    usedForBatch: false
                },
                { 
                    name: '通道编号', 
                    bits: 5, 
                    segments: [{position: 4, bits: 5}], 
                    description: '通道编号(标准帧)',
                    usedForBatch: true,
                    batchRange: {min: 0, max: 31}
                },
                { 
                    name: '功能码', 
                    bits: 3, 
                    segments: [{position: 1, bits: 3}], 
                    description: '报文功能代码',
                    usedForBatch: false
                },
                { 
                    name: 'Box编号', 
                    bits: 1, 
                    segments: [{position: 0, bits: 1}], 
                    description: '设备盒编号',
                    usedForBatch: false
                }
            ]
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTemplate('default');
        this.addDefaultMessage(); // 添加默认报文
        this.renderBatchFieldsConfig(); // 渲染批量字段配置
        this.updateDisplay();
    }

    bindEvents() {
        console.log('绑定事件监听器...');
        
        // 帧格式切换事件
        const frameFormat = document.getElementById('frameFormat');
        if (frameFormat) {
            frameFormat.addEventListener('change', () => {
                this.switchFrameFormat();
            });
        } else {
            console.warn('frameFormat 元素未找到');
        }
        
        // 字段管理事件
        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => {
                this.addField();
            });
        } else {
            console.warn('addFieldBtn 元素未找到');
        }

        const autoArrangeBtn = document.getElementById('autoArrangeBtn');
        if (autoArrangeBtn) {
            autoArrangeBtn.addEventListener('click', () => {
                this.autoArrangeFields();
            });
        } else {
            console.warn('autoArrangeBtn 元素未找到');
        }

        const loadTemplateBtn = document.getElementById('loadTemplateBtn');
        if (loadTemplateBtn) {
            loadTemplateBtn.addEventListener('click', () => {
                const configTemplate = document.getElementById('configTemplate');
                if (configTemplate) {
                    this.loadTemplate(configTemplate.value);
                } else {
                    console.warn('configTemplate 元素未找到');
                }
            });
        } else {
            console.warn('loadTemplateBtn 元素未找到');
        }

        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                this.saveCurrentAsTemplate();
            });
        } else {
            console.warn('saveTemplateBtn 元素未找到');
        }

        // 报文管理事件
        const addMessageBtn = document.getElementById('addMessageBtn');
        if (addMessageBtn) {
            addMessageBtn.addEventListener('click', () => {
                this.addMessage();
            });
        } else {
            console.warn('addMessageBtn 元素未找到');
        }

        // 原有事件
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateBatchMessages();
            });
        } else {
            console.warn('generateBtn 元素未找到');
        }

        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewDBC();
            });
        } else {
            console.warn('previewBtn 元素未找到');
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDBC();
            });
        } else {
            console.warn('exportBtn 元素未找到');
        }

        
        console.log('事件监听器绑定完成');
        
        // 延迟绑定事件委托，确保 DOM 元素已经渲染
        setTimeout(() => {
            this.bindEventDelegation();
        }, 100);
    }
    
    // 单独的事件委托绑定方法
    bindEventDelegation() {
        // 防止重复绑定
        if (this.eventsDelegated) {
            return;
        }
        
        console.log('绑定事件委托...');
        
        // 为字段容器添加事件委托，处理删除按钮
        const fieldsContainer = document.getElementById('fieldsContainer');
        if (fieldsContainer) {
            console.log('找到字段容器，绑定事件委托');
            fieldsContainer.addEventListener('click', (e) => {
                console.log('字段容器点击事件:', e.target);
                
                // 处理字段删除按钮
                if (e.target.classList.contains('btn-remove-field')) {
                    const fieldIndex = parseInt(e.target.getAttribute('data-field-index'));
                    console.log(`点击删除字段按钮, fieldIndex=${fieldIndex}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeField(fieldIndex);
                }
                
                // 处理段删除按钮  
                else if (e.target.classList.contains('btn-remove-segment')) {
                    const fieldIndex = parseInt(e.target.getAttribute('data-field-index'));
                    const segmentIndex = parseInt(e.target.getAttribute('data-segment-index'));
                    console.log(`点击删除段按钮, fieldIndex=${fieldIndex}, segmentIndex=${segmentIndex}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeSegment(fieldIndex, segmentIndex);
                }
                
                // 处理添加段按钮
                else if (e.target.classList.contains('btn-add-segment')) {
                    const fieldIndex = parseInt(e.target.getAttribute('data-field-index'));
                    console.log(`点击添加段按钮, fieldIndex=${fieldIndex}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.addSegment(fieldIndex);
                }
            });
        } else {
            console.error('未找到字段容器');
        }
        
        // 为报文容器添加事件委托，处理报文和信号相关按钮
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            console.log('找到报文容器，绑定事件委托');
            messagesContainer.addEventListener('click', (e) => {
                console.log('报文容器点击事件:', e.target);
                
                // 处理删除报文按钮
                if (e.target.classList.contains('btn-remove-message')) {
                    const messageId = e.target.getAttribute('data-message-id');
                    console.log(`点击删除报文按钮, messageId=${messageId}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeMessage(messageId);
                }
                
                // 处理添加信号按钮
                else if (e.target.classList.contains('btn-add-signal')) {
                    const messageId = e.target.getAttribute('data-message-id');
                    console.log(`点击添加信号按钮, messageId=${messageId}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.addSignalToMessage(messageId);
                }
                
                // 处理删除信号按钮
                else if (e.target.classList.contains('btn-remove-signal')) {
                    const messageId = e.target.getAttribute('data-message-id');
                    const signalIndex = parseInt(e.target.getAttribute('data-signal-index'));
                    console.log(`点击删除信号按钮, messageId=${messageId}, signalIndex=${signalIndex}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeSignalFromMessage(messageId, signalIndex);
                }
            });
        } else {
            console.error('未找到报文容器');
        }
        
        this.eventsDelegated = true;
        console.log('事件委托绑定完成');
    }

    // 加载配置模板
    loadTemplate(templateName) {
        if (this.templates[templateName]) {
            this.fields = JSON.parse(JSON.stringify(this.templates[templateName]));
            this.renderFields();
            this.renderIdConfig();
            this.updateDisplay();
        }
    }

    // 保存当前配置为模板
    saveCurrentAsTemplate() {
        const name = prompt('请输入模板名称:');
        if (name && name.trim()) {
            this.templates[name.trim()] = JSON.parse(JSON.stringify(this.fields));
            this.updateTemplateSelect();
            alert(`模板 "${name.trim()}" 已保存`);
        }
    }

    // 帧格式切换
    switchFrameFormat() {
        const frameFormat = document.getElementById('frameFormat').value;
        this.frameFormat = frameFormat;
        
        if (frameFormat === 'standard') {
            this.maxBits = 11;
            this.updateFrameInfo('ID范围: 0x000 - 0x7FF');
            this.updateTemplateOptionsForStandard();
        } else {
            this.maxBits = 29;
            this.updateFrameInfo('ID范围: 0x00000000 - 0x1FFFFFFF');
            this.updateTemplateOptionsForExtended();
        }
        
        // 更新显示
        this.updateMaxBitsDisplay();
        this.renderFields();
        this.renderIdConfig();
        this.updateDisplay();
        
        // 自动选择适合的模板
        this.autoSelectTemplate();
    }
    
    // 更新帧信息显示
    updateFrameInfo(info) {
        const frameInfo = document.getElementById('frameInfo');
        if (frameInfo) {
            frameInfo.textContent = info;
        }
    }
    
    // 更新最大位数显示
    updateMaxBitsDisplay() {
        const maxBitsDisplay = document.getElementById('maxBitsDisplay');
        if (maxBitsDisplay) {
            maxBitsDisplay.textContent = this.maxBits;
        }
    }
    
    // 更新模板选项为扩展帧
    updateTemplateOptionsForExtended() {
        const select = document.getElementById('configTemplate');
        select.innerHTML = `
            <option value="default">默认配置(扩展帧)</option>
            <option value="simple">简单配置(扩展帧)</option>
            <option value="split_channel">分段示例(扩展帧)</option>
        `;
    }
    
    // 更新模板选项为标准帧
    updateTemplateOptionsForStandard() {
        const select = document.getElementById('configTemplate');
        select.innerHTML = `
            <option value="standard_simple">简单配置(标准帧)</option>
            <option value="standard_detailed">详细配置(标准帧)</option>
        `;
    }
    
    // 自动选择模板
    autoSelectTemplate() {
        const select = document.getElementById('configTemplate');
        if (this.frameFormat === 'standard') {
            this.loadTemplate('standard_simple');
            select.value = 'standard_simple';
        } else {
            this.loadTemplate('default');
            select.value = 'default';
        }
    }
    updateTemplateSelect() {
        const select = document.getElementById('configTemplate');
        select.innerHTML = '';
        const templateNames = {
            'default': '默认配置',
            'simple': '简单配置',
            'split_channel': '分段示例'
        };
        Object.keys(this.templates).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = templateNames[name] || name;
            select.appendChild(option);
        });
    }

    // 添加新字段
    addField() {
        const newField = {
            name: '新字段',
            bits: 4,
            segments: [{position: this.findNextAvailablePosition(), bits: 4}],
            description: '',
            usedForBatch: false,
            batchRange: {min: 0, max: 15}
        };
        
        this.fields.push(newField);
        this.renderFields();
        this.renderIdConfig();
        this.updateDisplay();
    }

    // 查找下一个可用位置
    findNextAvailablePosition() {
        const usedBits = new Array(this.maxBits).fill(false);
        
        this.fields.forEach(field => {
            field.segments.forEach(segment => {
                for (let i = segment.position; i < segment.position + segment.bits && i < this.maxBits; i++) {
                    usedBits[i] = true;
                }
            });
        });
        
        // 从高位开始查找连续的空位
        for (let i = this.maxBits - 4; i >= 0; i--) {
            let canPlace = true;
            for (let j = i; j < i + 4 && j < this.maxBits; j++) {
                if (usedBits[j]) {
                    canPlace = false;
                    break;
                }
            }
            if (canPlace) return i;
        }
        
        return 0;
    }

    // 自动排列字段
    autoArrangeFields() {
        // 按位数从大到小排序，然后从高位开始排列
        this.fields.sort((a, b) => b.bits - a.bits);
        
        let currentPos = this.maxBits;
        this.fields.forEach(field => {
            currentPos -= field.bits;
            const startPos = Math.max(0, currentPos);
            // 重置为单个连续段
            field.segments = [{position: startPos, bits: field.bits}];
        });
        
        this.renderFields();
        this.renderIdConfig();
        this.updateDisplay();
    }

    // 渲染字段列表
    renderFields() {
        const container = document.getElementById('fieldsContainer');
        container.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            const fieldElement = this.createFieldElement(field, index);
            container.appendChild(fieldElement);
        });
    }

    // 创建字段元素
    createFieldElement(field, index) {
        const div = document.createElement('div');
        div.className = field.usedForBatch ? 'field-item batch-enabled' : 'field-item';
        div.setAttribute('data-field-index', index); // 添加数据属性
        
        // 计算位置范围显示
        const positionRanges = field.segments.map(seg => 
            seg.bits === 1 ? `${seg.position}` : `${seg.position}-${seg.position + seg.bits - 1}`
        ).join(', ');
        
        // 生成分段配置 HTML
        const segmentsHtml = field.segments.map((segment, segIndex) => `
            <div class="segment-config" data-segment-index="${segIndex}">
                <label>段${segIndex + 1}:</label>
                <input type="number" value="${segment.position}" min="0" max="${this.maxBits - 1}" 
                       placeholder="起始位" style="width: 60px;"
                       onchange="dbcEditor.updateSegment(${index}, ${segIndex}, 'position', parseInt(this.value))">
                <span>位, 长度:</span>
                <input type="number" value="${segment.bits}" min="1" max="${this.maxBits}" 
                       placeholder="位数" style="width: 50px;"
                       onchange="dbcEditor.updateSegment(${index}, ${segIndex}, 'bits', parseInt(this.value))">
                <span>位</span>
                <button type="button" class="btn-danger btn-remove-segment" style="padding: 2px 6px; font-size: 12px;" 
                        data-field-index="${index}" data-segment-index="${segIndex}">删除</button>
            </div>
        `).join('');
        
        
        div.innerHTML = `
            <div class="field-header">
                <h4>字段 ${index + 1}: ${field.name}</h4>
                <button type="button" class="btn-danger btn-remove-field" data-field-index="${index}">删除</button>
            </div>
            <div class="field-details">
                <div class="field-detail">
                    <label>字段名称:</label>
                    <input type="text" value="${field.name}" onchange="dbcEditor.updateField(${index}, 'name', this.value)">
                </div>
                <div class="field-detail">
                    <label>总位数:</label>
                    <input type="number" value="${field.bits}" min="1" max="${this.maxBits}" 
                           onchange="dbcEditor.updateField(${index}, 'bits', parseInt(this.value))">
                </div>
                <div class="field-detail">
                    <label>描述:</label>
                    <input type="text" value="${field.description}" 
                           onchange="dbcEditor.updateField(${index}, 'description', this.value)">
                </div>
                <div class="field-detail">
                    <label>位置分布:</label>
                    <span style="color: #666;">${positionRanges}</span>
                </div>
            </div>
            <div class="segments-config">
                <h5>位段配置 <button type="button" class="btn-primary btn-add-segment" style="padding: 2px 8px; font-size: 12px;" data-field-index="${index}">添加段</button></h5>
                <div class="segments-list">
                    ${segmentsHtml}
                </div>
            </div>
        `;
        
        return div;
    }

    // 更新字段
    updateField(index, property, value) {
        if (index >= 0 && index < this.fields.length) {
            console.log(`更新字段 ${index}: ${property} = ${value}`);
            
            // 对于位数更新，需要额外验证
            if (property === 'bits') {
                if (isNaN(value) || value < 1 || value > this.maxBits) {
                    alert(`位数必须在 1-${this.maxBits} 范围内`);
                    this.renderFields(); // 恢复原值
                    return;
                }
                
                // 检查分段配置是否会超出限制
                const field = this.fields[index];
                const maxPosition = Math.max(...field.segments.map(seg => seg.position + seg.bits));
                if (maxPosition > this.maxBits) {
                    alert(`当前分段配置最大位置为${maxPosition}，超出${this.maxBits}位限制`);
                    this.renderFields(); // 恢复原值
                    return;
                }
            }
            
            // 验证字段名称
            if (property === 'name' && (!value || value.trim() === '')) {
                alert('字段名称不能为空');
                this.renderFields(); // 恢复原值
                return;
            }
            
            this.fields[index][property] = value;
            
            // 如果更新了位数，需要同步更新段信息
            if (property === 'bits') {
                this.adjustSegmentsTotalBits(index);
            }
            
            console.log('字段更新成功，刷新显示');
            this.renderFields();
            this.renderIdConfig();
            this.updateDisplay();
        }
    }
    
    // 更新字段批量范围
    updateFieldBatchRange(fieldIndex, property, value) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            if (!field.batchRange) {
                field.batchRange = {min: 0, max: 255};
            }
            
            // 验证输入值
            if (isNaN(value) || value < 0) {
                alert('范围值必须是非负数');
                this.renderFields(); // 恢复原值
                return;
            }
            
            field.batchRange[property] = value;
            
            // 确保最小值不大于最大值
            if (property === 'min' && field.batchRange.min > field.batchRange.max) {
                field.batchRange.max = field.batchRange.min;
            } else if (property === 'max' && field.batchRange.max < field.batchRange.min) {
                field.batchRange.min = field.batchRange.max;
            }
            
            console.log('批量范围更新，刷新显示');
            this.renderFields();
            this.renderIdConfig();
            this.updateDisplay();
        }
    }
    
    // 更新批量字段启用状态
    updateBatchFieldEnabled(fieldIndex, enabled) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            field.usedForBatch = enabled;
            
            // 初始化批量范围
            if (enabled && !field.batchRange) {
                const maxValue = Math.pow(2, field.bits) - 1;
                field.batchRange = {min: 0, max: maxValue};
            }
            
            console.log(`字段 "${field.name}" 批量状态更新为: ${enabled}`);
            this.renderFields();
            this.renderBatchFieldsConfig();
        }
    }
    
    // 更新批量字段范围(用于批量配置区域)
    updateBatchFieldRange(fieldIndex, property, value) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            const maxValue = Math.pow(2, field.bits) - 1;
            
            // 验证输入值
            if (isNaN(value) || value < 0) {
                alert('范围值必须是非负数');
                this.renderBatchFieldsConfig(); // 恢复原值
                return;
            }
            
            // 验证范围不超出字段位数限制
            if (value > maxValue) {
                alert(`范围值不能超过字段最大值 ${maxValue}（${field.bits}位字段）`);
                this.renderBatchFieldsConfig(); // 恢复原值
                return;
            }
            
            if (!field.batchRange) {
                field.batchRange = {min: 0, max: maxValue};
            }
            
            field.batchRange[property] = value;
            
            // 确保最小值不大于最大值
            if (property === 'min' && field.batchRange.min > field.batchRange.max) {
                field.batchRange.max = field.batchRange.min;
            } else if (property === 'max' && field.batchRange.max < field.batchRange.min) {
                field.batchRange.min = field.batchRange.max;
            }
            
            console.log(`批量范围更新: ${field.name} [${field.batchRange.min}, ${field.batchRange.max}]`);
            this.renderBatchFieldsConfig();
        }
    }
    
    // 调整段的总位数
    adjustSegmentsTotalBits(fieldIndex) {
        const field = this.fields[fieldIndex];
        const currentTotal = field.segments.reduce((sum, seg) => sum + seg.bits, 0);
        
        if (currentTotal !== field.bits) {
            if (field.segments.length === 1) {
                // 只有一个段，直接调整
                field.segments[0].bits = field.bits;
            } else {
                // 多个段，调整最后一个段
                const diff = field.bits - currentTotal;
                const lastSegment = field.segments[field.segments.length - 1];
                lastSegment.bits = Math.max(1, lastSegment.bits + diff);
            }
        }
    }
    
    // 更新段配置
    updateSegment(fieldIndex, segmentIndex, property, value) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            if (segmentIndex >= 0 && segmentIndex < field.segments.length) {
                const segment = field.segments[segmentIndex];
                
                // 验证输入值
                if (isNaN(value) || value === null || value === undefined) {
                    alert('请输入有效的数值');
                    this.renderFields(); // 恢复原值
                    return;
                }
                
                if (property === 'position') {
                    if (value < 0 || value >= this.maxBits) {
                        alert(`位置必须在 0-${this.maxBits - 1} 范围内`);
                        this.renderFields(); // 恢复原值
                        return;
                    }
                }
                
                if (property === 'bits') {
                    if (value < 1 || value > this.maxBits) {
                        alert(`位数必须在 1-${this.maxBits} 范围内`);
                        this.renderFields(); // 恢复原值
                        return;
                    }
                }
                
                // 检查位置+位数是否超出限制
                const position = property === 'position' ? value : segment.position;
                const bits = property === 'bits' ? value : segment.bits;
                
                if (position + bits > this.maxBits) {
                    alert(`段配置超出${this.maxBits}位限制：位置${position} + 位数${bits} = ${position + bits}`);
                    this.renderFields(); // 恢复原值
                    return;
                }
                
                // 检查与其他段的重叠（同一字段内的段不应重叠）
                for (let i = 0; i < field.segments.length; i++) {
                    if (i !== segmentIndex) {
                        const otherSeg = field.segments[i];
                        const otherStart = otherSeg.position;
                        const otherEnd = otherSeg.position + otherSeg.bits - 1;
                        const thisStart = position;
                        const thisEnd = position + bits - 1;
                        
                        if ((thisStart <= otherEnd && thisEnd >= otherStart)) {
                            alert(`段配置与段${i + 1}重叠：位置${thisStart}-${thisEnd} 与 ${otherStart}-${otherEnd}`);
                            this.renderFields(); // 恢复原值
                            return;
                        }
                    }
                }
                
                // 更新值
                field.segments[segmentIndex][property] = value;
                
                // 重新计算总位数
                field.bits = field.segments.reduce((sum, seg) => sum + seg.bits, 0);
                
                // 立即更新显示
                this.renderFields();
                this.renderIdConfig();
                this.updateDisplay();
            }
        }
    }
    
    // 添加段
    addSegment(fieldIndex) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            
            // 找到下一个可用位置
            const usedBits = new Array(this.maxBits).fill(false);
            
            // 标记当前字段已使用的位
            field.segments.forEach(segment => {
                for (let i = segment.position; i < segment.position + segment.bits && i < this.maxBits; i++) {
                    usedBits[i] = true;
                }
            });
            
            // 找到第一个未使用的位置
            let newPosition = -1;
            for (let i = 0; i < this.maxBits; i++) {
                if (!usedBits[i]) {
                    newPosition = i;
                    break;
                }
            }
            
            if (newPosition === -1) {
                alert('没有可用的位置来添加新段');
                return;
            }
            
            field.segments.push({position: newPosition, bits: 1});
            field.bits = field.segments.reduce((sum, seg) => sum + seg.bits, 0);
            
            console.log(`添加新段在位置 ${newPosition}`);
            this.renderFields();
            this.renderIdConfig();
            this.updateDisplay();
        }
    }
    
    // 删除段
    removeSegment(fieldIndex, segmentIndex) {
        console.log(`删除段: fieldIndex=${fieldIndex}, segmentIndex=${segmentIndex}`);
        
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            console.log(`字段段数: ${field.segments.length}`);
            
            if (field.segments.length > 1 && segmentIndex >= 0 && segmentIndex < field.segments.length) {
                // 确认删除
                if (confirm(`确定要删除段${segmentIndex + 1}吗？`)) {
                    field.segments.splice(segmentIndex, 1);
                    field.bits = field.segments.reduce((sum, seg) => sum + seg.bits, 0);
                    
                    console.log('段删除成功，更新显示');
                    this.renderFields();
                    this.renderIdConfig();
                    this.updateDisplay();
                }
            } else {
                alert('至少需要保留一个段');
            }
        } else {
            console.error('字段索引无效');
        }
    }


    // 删除字段
    removeField(index) {
        console.log(`删除字段: index=${index}`);
        
        if (index >= 0 && index < this.fields.length) {
            const fieldName = this.fields[index].name;
            
            // 确认删除
            if (confirm(`确定要删除字段 "${fieldName}" 吗？`)) {
                this.fields.splice(index, 1);
                
                console.log('字段删除成功，更新显示');
                this.renderFields();
                this.renderIdConfig();
                this.updateDisplay();
            }
        } else {
            console.error('字段索引无效');
        }
    }

    // 渲染ID配置区域
    renderIdConfig() {
        const container = document.getElementById('idConfigContainer');
        container.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            const maxValue = Math.pow(2, field.bits) - 1;
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'dynamic-field';
            fieldDiv.innerHTML = `
                <label>${field.name}:</label>
                <input type="number" id="field_${index}" value="0" min="0" max="${maxValue}" 
                       onchange="dbcEditor.updateMessageIdPreview()">
                <span class="field-info">${field.bits}bit (0-${maxValue})</span>
            `;
            container.appendChild(fieldDiv);
        });
    }

    // 渲染批量字段配置区域
    renderBatchFieldsConfig() {
        const container = document.getElementById('batchFieldsContainer');
        if (!container) {
            console.warn('batchFieldsContainer 元素未找到');
            return;
        }
        
        container.innerHTML = '';
        
        if (this.fields.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">请先添加字段后再配置批量生成。</p>';
            return;
        }
        
        this.fields.forEach((field, index) => {
            const maxValue = Math.pow(2, field.bits) - 1;
            const fieldDiv = document.createElement('div');
            fieldDiv.className = field.usedForBatch ? 'batch-field-item enabled' : 'batch-field-item';
            
            fieldDiv.innerHTML = `
                <div class="batch-field-checkbox">
                    <input type="checkbox" id="batch_field_${index}" 
                           ${field.usedForBatch ? 'checked' : ''}
                           onchange="dbcEditor.updateBatchFieldEnabled(${index}, this.checked)">
                    <label for="batch_field_${index}">${field.name}</label>
                </div>
                <div class="batch-field-range">
                    <span>范围:</span>
                    <input type="number" value="${field.batchRange ? field.batchRange.min : 0}" 
                           min="0" max="${maxValue}" 
                           onchange="dbcEditor.updateBatchFieldRange(${index}, 'min', parseInt(this.value))"
                           ${!field.usedForBatch ? 'disabled' : ''}>
                    <span>至</span>
                    <input type="number" value="${field.batchRange ? field.batchRange.max : maxValue}" 
                           min="0" max="${maxValue}" 
                           onchange="dbcEditor.updateBatchFieldRange(${index}, 'max', parseInt(this.value))"
                           ${!field.usedForBatch ? 'disabled' : ''}>
                </div>
                <div class="batch-field-info">
                    字段位数: ${field.bits}bit，最大值: ${maxValue}，当前配置: ${field.usedForBatch ? '已启用' : '未启用'}
                </div>
            `;
            
            container.appendChild(fieldDiv);
        });
    }

    // 更新显示
    updateDisplay() {
        console.log('更新显示: 开始刷新位图和相关显示');
        
        try {
            this.updateBitmap();
            this.updateTotalBits();
            this.updateMessageIdPreview();
            this.checkFieldConflicts();
            this.renderBatchFieldsConfig(); // 更新批量字段配置
            
            console.log('显示更新完成');
        } catch (error) {
            console.error('更新显示时出错:', error);
        }
    }

    // 更新位图显示
    updateBitmap() {
        console.log('更新位图显示');
        
        const container = document.getElementById('bitDisplay');
        const scaleContainer = container.parentElement.querySelector('.bit-scale');
        const labelsContainer = container.parentElement.querySelector('.bit-labels');
        
        if (!container || !scaleContainer || !labelsContainer) {
            console.error('位图容器未找到');
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        scaleContainer.innerHTML = '';
        labelsContainer.innerHTML = '';
        
        // 创建位图
        const bitUsage = new Array(this.maxBits).fill(null);
        const conflicts = new Set();
        
        // 标记已使用的位
        this.fields.forEach((field, fieldIndex) => {
            field.segments.forEach(segment => {
                for (let i = segment.position; i < segment.position + segment.bits && i < this.maxBits; i++) {
                    if (bitUsage[i] !== null) {
                        conflicts.add(i);
                    }
                    bitUsage[i] = fieldIndex;
                }
            });
        });
        
        // 从高位到低位显示
        for (let i = this.maxBits - 1; i >= 0; i--) {
            // 位标尺
            const scaleSpan = document.createElement('span');
            scaleSpan.textContent = i;
            scaleContainer.appendChild(scaleSpan);
            
            // 位单元格
            const bitCell = document.createElement('div');
            bitCell.className = 'bit-cell';
            bitCell.textContent = i;
            
            if (conflicts.has(i)) {
                bitCell.classList.add('conflict');
                bitCell.title = '位冲突！';
            } else if (bitUsage[i] !== null) {
                bitCell.classList.add('used');
                const field = this.fields[bitUsage[i]];
                
                // 找到该位属于哪个段
                const segment = field.segments.find(seg => 
                    i >= seg.position && i < seg.position + seg.bits
                );
                
                if (segment) {
                    const segmentIndex = field.segments.indexOf(segment);
                    bitCell.title = `${field.name} (段${segmentIndex + 1}: ${segment.bits}bit)`;
                    bitCell.style.backgroundColor = this.getFieldColor(bitUsage[i]);
                    
                    // 为分段字段添加特殊标记
                    if (field.segments.length > 1) {
                        bitCell.style.border = '2px dashed #fff';
                    }
                }
            } else {
                bitCell.classList.add('unused');
                bitCell.title = '未使用';
            }
            
            container.appendChild(bitCell);
            
            // 位标签
            const labelSpan = document.createElement('span');
            if (bitUsage[i] !== null && !conflicts.has(i)) {
                const field = this.fields[bitUsage[i]];
                const segment = field.segments.find(seg => 
                    i >= seg.position && i < seg.position + seg.bits
                );
                if (segment && i === segment.position + segment.bits - 1) {
                    const segmentIndex = field.segments.indexOf(segment);
                    const displayName = field.segments.length > 1 ? 
                        `${field.name}${segmentIndex + 1}` : field.name;
                    labelSpan.textContent = displayName;
                    labelSpan.title = `${field.name} (${segment.bits}bit)`;
                    // 根据字段名称长度调整样式
                    if (displayName.length > 4) {
                        labelSpan.style.fontSize = '0.7em';
                        labelSpan.style.transform = 'rotate(-45deg)';
                        labelSpan.style.transformOrigin = 'center';
                        labelSpan.style.whiteSpace = 'nowrap';
                        labelSpan.style.overflow = 'visible';
                    }
                }
            }
            labelsContainer.appendChild(labelSpan);
        }
        
        // 更新字段颜色图例
        this.updateFieldColorLegend();
        
        console.log('位图显示更新完成');
    }

    // 获取字段颜色
    getFieldColor(fieldIndex) {
        const colors = [
            '#3498db',  // 蓝色 - 板卡类型
            '#2ecc71',  // 绿色 - 通道编号  
            '#f39c12',  // 橙色 - 功能码
            '#9b59b6',  // 紫色 - 板子编号
            '#1abc9c',  // 青色 - Box编号
            '#34495e',  // 深灰 - 附加字段
            '#e67e22',  // 深橙 - 附加字段
            '#95a5a6',  // 灰色 - 附加字段
            '#d35400',  // 深红橙 - 附加字段
            '#8e44ad'   // 深紫 - 附加字段
        ];
        return colors[fieldIndex % colors.length];
    }
    
    // 更新字段颜色图例
    updateFieldColorLegend() {
        const legendContainer = document.getElementById('fieldColorLegend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            const legendItem = document.createElement('span');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('span');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = this.getFieldColor(index);
            
            const label = document.createElement('span');
            label.textContent = field.name;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
    }

    // 更新总位数显示
    updateTotalBits() {
        const totalUsed = this.fields.reduce((sum, field) => sum + field.bits, 0);
        const display = document.getElementById('totalBitsDisplay');
        display.textContent = totalUsed;
        display.style.color = totalUsed > this.maxBits ? '#e74c3c' : '#2c3e50';
    }

    // 检查字段冲突
    checkFieldConflicts() {
        const bitUsage = new Array(this.maxBits).fill(false);
        const fieldElements = document.querySelectorAll('.field-item');
        
        this.fields.forEach((field, index) => {
            const element = fieldElements[index];
            if (!element) return;
            
            let hasConflict = false;
            let exceedsLimit = false;
            
            // 检查每个段
            field.segments.forEach(segment => {
                // 检查是否超出限制
                if (segment.position + segment.bits > this.maxBits) {
                    exceedsLimit = true;
                }
                
                // 检查位冲突
                for (let i = segment.position; i < segment.position + segment.bits && i < this.maxBits; i++) {
                    if (bitUsage[i]) {
                        hasConflict = true;
                        break;
                    }
                    bitUsage[i] = true;
                }
            });
            
            // 更新样式
            element.classList.remove('error', 'conflict');
            const errorDiv = element.querySelector('.field-error');
            if (errorDiv) errorDiv.remove();
            
            if (exceedsLimit || hasConflict) {
                element.classList.add(exceedsLimit ? 'error' : 'conflict');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'field-error';
                errorMsg.textContent = exceedsLimit ? 
                    `字段超出${this.maxBits}位限制` : '字段位置与其他字段冲突';
                element.appendChild(errorMsg);
            }
        });
    }

    // 更新报文ID预览
    updateMessageIdPreview() {
        let messageId = 0;
        
        this.fields.forEach((field, index) => {
            const input = document.getElementById(`field_${index}`);
            if (input) {
                const value = parseInt(input.value) || 0;
                const maxValue = Math.pow(2, field.bits) - 1;
                const clampedValue = Math.min(Math.max(0, value), maxValue);
                
                // 将值分配到各个段
                this.distributeValueToSegments(field, clampedValue, (position, bitValue) => {
                    messageId |= (bitValue << position);
                });
            }
        });
        
        // 根据帧格式调整显示
        const hexFormat = this.frameFormat === 'standard' ? 3 : 8;
        const maxValue = this.frameFormat === 'standard' ? 0x7FF : 0x1FFFFFFF;
        
        // 限制ID值在合法范围内
        messageId = messageId & maxValue;
        
        document.getElementById('messageIdPreview').textContent = 
            `0x${messageId.toString(16).toUpperCase().padStart(hexFormat, '0')}`;
        document.getElementById('binaryPreview').textContent = 
            `(二进制: ${messageId.toString(2).padStart(this.maxBits, '0')})`;
        
        return messageId;
    }
    
    // 将值分配到各个段
    distributeValueToSegments(field, value, callback) {
        let remainingValue = value;
        
        // 从低位段开始分配（按position排序）
        const sortedSegments = [...field.segments].sort((a, b) => a.position - b.position);
        
        sortedSegments.forEach(segment => {
            const segmentMask = Math.pow(2, segment.bits) - 1;
            const segmentValue = remainingValue & segmentMask;
            callback(segment.position, segmentValue);
            remainingValue = remainingValue >> segment.bits;
        });
    }

    // ===================
    // 多报文管理方法
    // ===================
    
    // 添加默认报文
    addDefaultMessage() {
        this.addMessage('Channel_Data', 8, 'ECU1', '数据采集报文');
    }
    
    // 添加报文
    addMessage(name = '', length = 8, node = 'ECU1', description = '') {
        const messageId = `message_${this.messageIdCounter++}`;
        const message = {
            id: messageId,
            name: name || `Message_${this.messages.length + 1}`,
            length: length,
            node: node,
            description: description,
            signals: [],
            functionCode: 0 // 默认功能码
        };
        
        // 添加默认信号
        message.signals.push({
            name: 'Data1',
            startBit: 0,
            length: 8,
            type: 'unsigned',
            factor: 1,
            offset: 0,
            min: 0,
            max: 255,
            unit: '',
            description: 'Raw data'
        });
        
        this.messages.push(message);
        this.renderMessages();
        this.updateMessageCount();
    }
    
    // 渲染报文列表
    renderMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const messageElement = this.createMessageElement(message, index);
            container.appendChild(messageElement);
        });
    }
    
    // 创建报文元素
    createMessageElement(message, index) {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.setAttribute('data-message-id', message.id);
        
        // 生成信号HTML
        const signalsHtml = message.signals.map((signal, sigIndex) => `
            <div class="signal-item" data-signal-index="${sigIndex}">
                <div class="signal-header">
                    <h6>信号 ${sigIndex + 1}: ${signal.name}</h6>
                    <button type="button" class="btn-danger btn-remove-signal" style="padding: 4px 8px; font-size: 12px;" 
                            data-message-id="${message.id}" data-signal-index="${sigIndex}">删除</button>
                </div>
                <div class="signal-fields">
                    <div class="field-group">
                        <label>信号名称:</label>
                        <input type="text" value="${signal.name}" data-field="name" 
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'name', this.value)">
                    </div>
                    <div class="field-group">
                        <label>起始位:</label>
                        <input type="number" value="${signal.startBit}" data-field="startBit" min="0" max="63"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'startBit', parseInt(this.value))">
                    </div>
                    <div class="field-group">
                        <label>长度(bit):</label>
                        <input type="number" value="${signal.length}" data-field="length" min="1" max="64"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'length', parseInt(this.value))">
                    </div>
                    <div class="field-group">
                        <label>数据类型:</label>
                        <select data-field="type" onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'type', this.value)">
                            <option value="unsigned" ${signal.type === 'unsigned' ? 'selected' : ''}>无符号</option>
                            <option value="signed" ${signal.type === 'signed' ? 'selected' : ''}>有符号</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label>比例因子:</label>
                        <input type="number" value="${signal.factor}" data-field="factor" step="0.001"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'factor', parseFloat(this.value))">
                    </div>
                    <div class="field-group">
                        <label>偏移量:</label>
                        <input type="number" value="${signal.offset}" data-field="offset" step="0.001"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'offset', parseFloat(this.value))">
                    </div>
                    <div class="field-group">
                        <label>最小值:</label>
                        <input type="number" value="${signal.min}" data-field="min" step="0.001"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'min', parseFloat(this.value))">
                    </div>
                    <div class="field-group">
                        <label>最大值:</label>
                        <input type="number" value="${signal.max}" data-field="max" step="0.001"
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'max', parseFloat(this.value))">
                    </div>
                    <div class="field-group">
                        <label>单位:</label>
                        <input type="text" value="${signal.unit}" data-field="unit" 
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'unit', this.value)">
                    </div>
                    <div class="field-group">
                        <label>描述:</label>
                        <input type="text" value="${signal.description}" data-field="description" 
                               onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'description', this.value)">
                    </div>
                </div>
            </div>
        `).join('');
        
        div.innerHTML = `
            <div class="message-header">
                <h4>报文 ${index + 1}: ${message.name}</h4>
                <button type="button" class="btn-danger btn-remove-message" data-message-id="${message.id}">删除报文</button>
            </div>
            <div class="message-editor">
                <div class="field-group">
                    <label>报文名称:</label>
                    <input type="text" value="${message.name}" 
                           onchange="dbcEditor.updateMessage('${message.id}', 'name', this.value)">
                </div>
                <div class="field-group">
                    <label>报文长度 (bytes):</label>
                    <select onchange="dbcEditor.updateMessage('${message.id}', 'length', parseInt(this.value))">
                        ${[1,2,3,4,5,6,7,8].map(len => 
                            `<option value="${len}" ${message.length === len ? 'selected' : ''}>${len}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="field-group">
                    <label>发送节点:</label>
                    <input type="text" value="${message.node}" 
                           onchange="dbcEditor.updateMessage('${message.id}', 'node', this.value)">
                </div>
                <div class="field-group">
                    <label>功能码:</label>
                    <input type="number" value="${message.functionCode}" min="0" max="15" 
                           onchange="dbcEditor.updateMessage('${message.id}', 'functionCode', parseInt(this.value))">
                </div>
                <div class="field-group">
                    <label>描述:</label>
                    <input type="text" value="${message.description}" 
                           onchange="dbcEditor.updateMessage('${message.id}', 'description', this.value)">
                </div>
            </div>
            <div class="signals-section">
                <h5>信号定义 <button type="button" class="btn-primary btn-add-signal" style="padding: 4px 12px; font-size: 12px;" 
                        data-message-id="${message.id}">添加信号</button></h5>
                <div class="signals-container">
                    ${signalsHtml}
                </div>
            </div>
        `;
        
        return div;
    }
    
    // 更新报文
    updateMessage(messageId, property, value) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message[property] = value;
            this.renderMessages();
            this.updateMessageIdPreview();
        }
    }
    
    // 删除报文
    removeMessage(messageId) {
        console.log(`删除报文: messageId=${messageId}`);
        
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            const messageName = this.messages[index].name;
            
            // 确认删除
            if (confirm(`确定要删除报文 "${messageName}" 吗？`)) {
                this.messages.splice(index, 1);
                
                console.log('报文删除成功，更新显示');
                this.renderMessages();
                this.updateMessageCount();
            }
        } else {
            console.error('报文未找到');
        }
    }
    
    // 为报文添加信号
    addSignalToMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            const newSignal = {
                name: `Signal${message.signals.length + 1}`,
                startBit: 0,
                length: 8,
                type: 'unsigned',
                factor: 1,
                offset: 0,
                min: 0,
                max: 255,
                unit: '',
                description: ''
            };
            message.signals.push(newSignal);
            this.renderMessages();
        }
    }
    
    // 从报文中删除信号
    removeSignalFromMessage(messageId, signalIndex) {
        console.log(`删除信号: messageId=${messageId}, signalIndex=${signalIndex}`);
        
        const message = this.messages.find(m => m.id === messageId);
        if (message && signalIndex >= 0 && signalIndex < message.signals.length) {
            if (message.signals.length > 1) {
                const signalName = message.signals[signalIndex].name;
                
                // 确认删除
                if (confirm(`确定要删除信号 "${signalName}" 吗？`)) {
                    message.signals.splice(signalIndex, 1);
                    
                    console.log('信号删除成功，更新显示');
                    this.renderMessages();
                }
            } else {
                alert('报文至少需要保留一个信号');
            }
        } else {
            console.error('信号未找到');
        }
    }
    
    // 更新报文中的信号
    updateSignalInMessage(messageId, signalIndex, property, value) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && message.signals[signalIndex]) {
            message.signals[signalIndex][property] = value;
            // 不重新渲染，只更新数据
        }
    }
    
    // 更新报文数量显示
    updateMessageCount() {
        const display = document.getElementById('messageCountDisplay');
        if (display) {
            display.textContent = this.messages.length;
        }
    }

    // 添加信号
    addSignal(name = '', startBit = 0, length = 8, type = 'unsigned', factor = 1, offset = 0, min = 0, max = 255, unit = '', description = '') {
        const signalId = `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const signalHtml = `
            <div class="signal-item" data-signal-id="${signalId}">
                <div class="signal-header">
                    <h4>信号 ${this.signals.length + 1}</h4>
                    <button type="button" class="btn-danger" onclick="dbcEditor.removeSignal('${signalId}')">删除</button>
                </div>
                <div class="signal-fields">
                    <div class="field-group">
                        <label>信号名称:</label>
                        <input type="text" value="${name}" data-field="name" placeholder="例如: Speed">
                    </div>
                    <div class="field-group">
                        <label>起始位:</label>
                        <input type="number" value="${startBit}" data-field="startBit" min="0" max="63">
                    </div>
                    <div class="field-group">
                        <label>长度(bit):</label>
                        <input type="number" value="${length}" data-field="length" min="1" max="64">
                    </div>
                    <div class="field-group">
                        <label>数据类型:</label>
                        <select data-field="type">
                            <option value="unsigned" ${type === 'unsigned' ? 'selected' : ''}>无符号</option>
                            <option value="signed" ${type === 'signed' ? 'selected' : ''}>有符号</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label>比例因子:</label>
                        <input type="number" value="${factor}" data-field="factor" step="0.001">
                    </div>
                    <div class="field-group">
                        <label>偏移量:</label>
                        <input type="number" value="${offset}" data-field="offset" step="0.001">
                    </div>
                    <div class="field-group">
                        <label>最小值:</label>
                        <input type="number" value="${min}" data-field="min" step="0.001">
                    </div>
                    <div class="field-group">
                        <label>最大值:</label>
                        <input type="number" value="${max}" data-field="max" step="0.001">
                    </div>
                    <div class="field-group">
                        <label>单位:</label>
                        <input type="text" value="${unit}" data-field="unit" placeholder="例如: km/h">
                    </div>
                    <div class="field-group">
                        <label>描述:</label>
                        <input type="text" value="${description}" data-field="description" placeholder="信号描述">
                    </div>
                </div>
            </div>
        `;

        document.getElementById('signalsContainer').insertAdjacentHTML('beforeend', signalHtml);
        this.updateSignalValidation();
    }

    // 删除信号
    removeSignal(signalId) {
        const signalElement = document.querySelector(`[data-signal-id="${signalId}"]`);
        if (signalElement) {
            signalElement.remove();
        }
        this.updateSignalValidation();
    }

    // 获取当前信号数据
    getCurrentSignals() {
        const signals = [];
        const signalElements = document.querySelectorAll('.signal-item');
        
        signalElements.forEach((element, index) => {
            const signalData = {
                name: element.querySelector('[data-field="name"]').value || `Signal${index + 1}`,
                startBit: parseInt(element.querySelector('[data-field="startBit"]').value) || 0,
                length: parseInt(element.querySelector('[data-field="length"]').value) || 8,
                type: element.querySelector('[data-field="type"]').value || 'unsigned',
                factor: parseFloat(element.querySelector('[data-field="factor"]').value) || 1,
                offset: parseFloat(element.querySelector('[data-field="offset"]').value) || 0,
                min: parseFloat(element.querySelector('[data-field="min"]').value) || 0,
                max: parseFloat(element.querySelector('[data-field="max"]').value) || 255,
                unit: element.querySelector('[data-field="unit"]').value || '',
                description: element.querySelector('[data-field="description"]').value || ''
            };
            signals.push(signalData);
        });
        
        return signals;
    }

    // 验证信号配置
    updateSignalValidation() {
        const messageLength = parseInt(document.getElementById('messageLength').value) * 8;
        const signals = this.getCurrentSignals();
        
        let hasError = false;
        const usedBits = new Array(messageLength).fill(false);
        
        signals.forEach((signal, index) => {
            const signalElement = document.querySelectorAll('.signal-item')[index];
            if (!signalElement) return;
            
            const endBit = signal.startBit + signal.length - 1;
            
            if (endBit >= messageLength) {
                this.showSignalError(signalElement, `信号超出消息长度范围 (${messageLength}位)`);
                hasError = true;
                return;
            }
            
            for (let bit = signal.startBit; bit <= endBit; bit++) {
                if (usedBits[bit]) {
                    this.showSignalError(signalElement, `位 ${bit} 与其他信号重叠`);
                    hasError = true;
                    return;
                }
                usedBits[bit] = true;
            }
            
            this.clearSignalError(signalElement);
        });
        
        return !hasError;
    }

    // 显示信号错误
    showSignalError(signalElement, message) {
        signalElement.style.borderLeft = '4px solid #e74c3c';
        let errorElement = signalElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = '#e74c3c';
            errorElement.style.fontSize = '0.9em';
            errorElement.style.marginTop = '10px';
            signalElement.appendChild(errorElement);
        }
        errorElement.textContent = `错误: ${message}`;
    }

    // 清除信号错误
    clearSignalError(signalElement) {
        signalElement.style.borderLeft = '';
        const errorElement = signalElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // 生成批量报文
    generateBatchMessages() {
        // 验证字段配置
        const hasFieldErrors = document.querySelectorAll('.field-item.error, .field-item.conflict').length > 0;
        if (hasFieldErrors) {
            alert('字段配置有错误，请先修正后再生成');
            return;
        }

        // 验证报文配置
        if (this.messages.length === 0) {
            alert('请先配置至少一个报文');
            return;
        }

        const startChannel = parseInt(document.getElementById('channelRangeStart').value);
        const endChannel = parseInt(document.getElementById('channelRangeEnd').value);
        const namingPattern = document.getElementById('namingPattern').value;

        if (startChannel > endChannel) {
            alert('起始通道编号不能大于结束通道编号');
            return;
        }

        // 检查是否有可用于批量生成的字段
        const batchFields = this.fields.filter(field => field.usedForBatch);
        if (batchFields.length === 0) {
            alert('没有设置可用于批量生成的字段，请至少选择一个字段作为批量字段。');
            return;
        }

        console.log(`将使用以下字段进行批量生成: ${batchFields.map(f => f.name).join(', ')}`);

        this.generatedMessages = [];
        let totalMessageCount = 0;

        // 为每个通道生成所有配置的报文
        for (let channel = startChannel; channel <= endChannel; channel++) {
            this.messages.forEach((messageTemplate, msgIndex) => {
                // 计算报文ID（根据功能码调整）
                const messageId = this.calculateMessageIdForChannel(channel, messageTemplate.functionCode);
                const messageName = messageTemplate.name.replace('{num}', channel);

                // 生成报文
                const generatedMessage = {
                    id: messageId,
                    name: messageName,
                    length: messageTemplate.length,
                    node: messageTemplate.node,
                    description: messageTemplate.description,
                    signals: messageTemplate.signals.map(signal => ({
                        ...signal,
                        name: signal.name.includes('{num}') ? signal.name.replace('{num}', channel) : signal.name
                    }))
                };

                this.generatedMessages.push(generatedMessage);
                totalMessageCount++;
            });
        }

        alert(`成功生成 ${endChannel - startChannel + 1} 个通道的 ${this.messages.length} 类报文，共 ${totalMessageCount} 个报文`);
        this.previewDBC();
    }

    // 为指定通道和功能码计算报文ID
    calculateMessageIdForChannel(channelNumber, functionCode = 0) {
        let messageId = 0;
        
        this.fields.forEach((field, index) => {
            let value;
            
            if (field.usedForBatch) {
                // 可配置的批量字段，使用自定义范围映射
                if (field.batchRange) {
                    const range = field.batchRange.max - field.batchRange.min + 1;
                    const offset = channelNumber % range;
                    value = field.batchRange.min + offset;
                } else {
                    value = channelNumber;
                }
            } else if (field.name === '功能码') {
                // 功能码字段使用传入的功能码值
                value = functionCode;
            } else {
                // 固定字段使用配置值
                const input = document.getElementById(`field_${index}`);
                value = input ? parseInt(input.value) || 0 : 0;
            }
            
            const maxValue = Math.pow(2, field.bits) - 1;
            const clampedValue = Math.min(Math.max(0, value), maxValue);
            
            // 将值分配到各个段
            this.distributeValueToSegments(field, clampedValue, (position, bitValue) => {
                messageId |= (bitValue << position);
            });
        });
        
        return messageId;
    }

    // 计算指定通道的报文ID
    calculateMessageId(channelNumber) {
        let messageId = 0;
        
        this.fields.forEach((field, index) => {
            let value;
            
            if (field.usedForBatch) {
                // 可配置的批量字段，使用自定义范围映射
                if (field.batchRange) {
                    const range = field.batchRange.max - field.batchRange.min + 1;
                    const offset = channelNumber % range;
                    value = field.batchRange.min + offset;
                } else {
                    value = channelNumber;
                }
            } else {
                // 固定字段使用配置值
                const input = document.getElementById(`field_${index}`);
                value = input ? parseInt(input.value) || 0 : 0;
            }
            
            const maxValue = Math.pow(2, field.bits) - 1;
            const clampedValue = Math.min(Math.max(0, value), maxValue);
            
            // 将值分配到各个段
            this.distributeValueToSegments(field, clampedValue, (position, bitValue) => {
                messageId |= (bitValue << position);
            });
        });
        
        return messageId;
    }

    // 预览DBC内容
    previewDBC() {
        const dbcContent = this.generateDBCContent();
        document.getElementById('dbcPreview').value = dbcContent;
    }

    // 生成DBC文件内容
    generateDBCContent() {
        let dbcContent = `VERSION ""


NS_ : 
	NS_DESC_
	CM_
	BA_DEF_
	BA_
	VAL_
	CAT_DEF_
	CAT_
	FILTER
	BA_DEF_DEF_
	EV_DATA_
	ENVVAR_DATA_
	SGTYPE_
	SGTYPE_VAL_
	BA_DEF_SGTYPE_
	SIG_VALTYPE_
	BA_SGTYPE_
	SIG_GROUP_
	SIGTYPE_VALTYPE_
	BO_TX_BU_
	BA_DEF_REL_
	BA_REL_
	BA_DEF_DEF_REL_
	BU_SG_REL_
	BU_EV_REL_
	BU_BO_REL_
	SG_MUL_VAL_

BS_:

BU_:

`;

        const messages = this.generatedMessages.length > 0 ? this.generatedMessages : this.getAllCurrentMessages();

        messages.forEach(message => {
            dbcContent += `BO_ ${message.id} ${message.name}: ${message.length} ${message.node}\n`;
            
            message.signals.forEach(signal => {
                const byteOrder = '1';
                const valueType = signal.type === 'signed' ? '-' : '+';
                
                dbcContent += ` SG_ ${signal.name} : ${signal.startBit}|${signal.length}@${byteOrder}${valueType} (${signal.factor},${signal.offset}) [${signal.min}|${signal.max}] "${signal.unit}" ${message.node}\n`;
            });
            
            dbcContent += '\n';
        });

        messages.forEach(message => {
            message.signals.forEach(signal => {
                if (signal.description) {
                    dbcContent += `CM_ SG_ ${message.id} ${signal.name} "${signal.description}";\n`;
                }
            });
        });

        return dbcContent;
    }

    // 获取所有当前报文信息
    getAllCurrentMessages() {
        return this.messages.map((message, index) => {
            const messageId = this.calculateMessageIdForChannel(0, message.functionCode); // 使用默认通道号
            return {
                id: messageId,
                name: message.name,
                length: message.length,
                node: message.node,
                description: message.description,
                signals: message.signals
            };
        });
    }

    // 导出DBC文件
    exportDBC() {
        const dbcContent = this.generateDBCContent();
        
        if (!dbcContent.trim()) {
            alert('没有可导出的内容');
            return;
        }

        const blob = new Blob([dbcContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        link.download = `generated_${timestamp}.dbc`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        
        alert('DBC文件已成功导出');
    }
}

// 初始化编辑器
let dbcEditor;
document.addEventListener('DOMContentLoaded', () => {
    dbcEditor = new DBCEditor();
});