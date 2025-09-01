// DBC编辑器 - 支持多报文的增强版本
class DBCEditor {
    constructor() {
        this.fields = [];
        this.messages = []; // 多报文数组
        this.generatedMessages = [];
        this.frameFormat = 'extended'; // 'standard' 或 'extended'
        this.maxBits = 29; // CAN扩展ID最大位数
        this.messageIdCounter = 1; // 报文ID计数器
        // 字段类型常量
        this.FIELD_TYPES = {
            FIXED: 'FIXED',              // 固定字段
            BATCH: 'BATCH',              // 批量字段
            SYSTEM_MANAGED: 'SYSTEM_MANAGED'  // 系统管理字段
        };
        
        // 系统管理字段配置
        this.systemManagedFieldConfig = {
            functionCodeField: null  // 指定哪个字段作为功能码字段
        };
        
        this.templates = {
            'default': [
                { 
                    name: '板卡类型', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 4, 
                    segments: [{position: 20, bits: 4}], 
                    description: '设备板卡类型',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BT'
                },
                { 
                    name: '通道编号', 
                    type: this.FIELD_TYPES.BATCH,
                    bits: 8, 
                    segments: [{position: 12, bits: 8}], 
                    description: '通道编号',
                    defaultValue: 0,
                    usedForBatch: true,
                    isSystemManaged: false,
                    batchRange: {min: 0, max: 15},
                    abbreviation: 'CH'
                },
                { 
                    name: '功能码', 
                    type: this.FIELD_TYPES.SYSTEM_MANAGED,
                    bits: 4, 
                    segments: [{position: 8, bits: 4}], 
                    description: '报文功能代码',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: true,
                    systemManagedSource: 'functionCode',
                    abbreviation: 'FC'
                },
                { 
                    name: '板子编号', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 5, 
                    segments: [{position: 3, bits: 5}], 
                    description: '硬件板卡编号',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BN'
                },
                { 
                    name: 'Box编号', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 3, 
                    segments: [{position: 0, bits: 3}], 
                    description: '设备盒编号',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BOX'
                }
            ],
            'simple': [
                { 
                    name: '通道编号', 
                    type: this.FIELD_TYPES.BATCH,
                    bits: 8, 
                    segments: [{position: 16, bits: 8}], 
                    description: '通道编号',
                    defaultValue: 0,
                    usedForBatch: true,
                    isSystemManaged: false,
                    batchRange: {min: 0, max: 31},
                    abbreviation: 'CH'
                },
                { 
                    name: '功能码', 
                    type: this.FIELD_TYPES.SYSTEM_MANAGED,
                    bits: 8, 
                    segments: [{position: 8, bits: 8}], 
                    description: '功能代码',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: true,
                    systemManagedSource: 'functionCode',
                    abbreviation: 'FC'
                },
                { 
                    name: '设备ID', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 8, 
                    segments: [{position: 0, bits: 8}], 
                    description: '设备标识',
                    defaultValue: 1,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'DEV'
                }
            ],
            'split_channel': [
                { 
                    name: '板卡类型', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 4, 
                    segments: [{position: 26, bits: 4}], 
                    description: '设备板卡类型',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BT'
                },
                { 
                    name: '通道编号', 
                    type: this.FIELD_TYPES.BATCH,
                    bits: 8, 
                    segments: [{position: 23, bits: 3}, {position: 5, bits: 5}], 
                    description: '通道编号(分段配置示例)',
                    defaultValue: 1,
                    usedForBatch: true,
                    isSystemManaged: false,
                    batchRange: {min: 1, max: 50},
                    abbreviation: 'CH'
                },
                { 
                    name: '功能码', 
                    type: this.FIELD_TYPES.SYSTEM_MANAGED,
                    bits: 6, 
                    segments: [{position: 16, bits: 4}, {position: 10, bits: 2}], 
                    description: '功能代码(分段配置)',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: true,
                    systemManagedSource: 'functionCode',
                    abbreviation: 'FC'
                },
                { 
                    name: '设备ID', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 5, 
                    segments: [{position: 0, bits: 5}], 
                    description: '设备标识',
                    defaultValue: 1,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'DEV'
                }
            ],
            'standard_simple': [
                { 
                    name: '通道编号', 
                    type: this.FIELD_TYPES.BATCH,
                    bits: 6, 
                    segments: [{position: 5, bits: 6}], 
                    description: '通道编号(标准帧)',
                    defaultValue: 0,
                    usedForBatch: true,
                    isSystemManaged: false,
                    batchRange: {min: 0, max: 63},
                    abbreviation: 'CH'
                },
                { 
                    name: '功能码', 
                    type: this.FIELD_TYPES.SYSTEM_MANAGED,
                    bits: 3, 
                    segments: [{position: 2, bits: 3}], 
                    description: '功能代码',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: true,
                    systemManagedSource: 'functionCode',
                    abbreviation: 'FC'
                },
                { 
                    name: '设备ID', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 2, 
                    segments: [{position: 0, bits: 2}], 
                    description: '设备标识',
                    defaultValue: 1,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'DEV'
                }
            ],
            'standard_detailed': [
                { 
                    name: '板卡类型', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 2, 
                    segments: [{position: 9, bits: 2}], 
                    description: '设备板卡类型',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BT'
                },
                { 
                    name: '通道编号', 
                    type: this.FIELD_TYPES.BATCH,
                    bits: 5, 
                    segments: [{position: 4, bits: 5}], 
                    description: '通道编号(标准帧)',
                    defaultValue: 0,
                    usedForBatch: true,
                    isSystemManaged: false,
                    batchRange: {min: 0, max: 31},
                    abbreviation: 'CH'
                },
                { 
                    name: '功能码', 
                    type: this.FIELD_TYPES.SYSTEM_MANAGED,
                    bits: 3, 
                    segments: [{position: 1, bits: 3}], 
                    description: '报文功能代码',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: true,
                    systemManagedSource: 'functionCode',
                    abbreviation: 'FC'
                },
                { 
                    name: 'Box编号', 
                    type: this.FIELD_TYPES.FIXED,
                    bits: 1, 
                    segments: [{position: 0, bits: 1}], 
                    description: '设备盒编号',
                    defaultValue: 0,
                    usedForBatch: false,
                    isSystemManaged: false,
                    abbreviation: 'BOX'
                }
            ]
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTemplate('default');
        this.addDefaultMessage(); // 添加默认报文
        this.updateSystemManagedFieldConfig(); // 初始化系统管理字段配置
        this.renderBatchFieldsConfig(); // 渲染批量字段配置
        this.renderMessageNamingConfig(); // 渲染报文命名模式配置
        this.updateDisplay();
    }

    // 更新系统管理字段配置
    updateSystemManagedFieldConfig() {
        // 自动检测功能码字段
        const functionCodeField = this.fields.find(field => 
            field.isSystemManaged && field.systemManagedSource === 'functionCode'
        );
        
        if (functionCodeField) {
            this.systemManagedFieldConfig.functionCodeField = functionCodeField;
            console.log(`功能码字段已设置为: ${functionCodeField.name}`);
        } else {
            this.systemManagedFieldConfig.functionCodeField = null;
        }
    }
    
    /**
     * 统一的字段值获取方法
     * @param {Object} field - 字段对象
     * @param {number} fieldIndex - 字段索引
     * @param {Object} context - 上下文信息
     * @param {Map} context.batchFieldValues - 批量字段值映射
     * @param {number} context.functionCode - 功能码值
     * @returns {number} 字段值
     */
    getFieldValue(field, fieldIndex, context = {}) {
        const { batchFieldValues = new Map(), functionCode = 0 } = context;
        
        let value = 0;
        
        // 按照优先级获取字段值
        if (field.type === this.FIELD_TYPES.BATCH && field.usedForBatch) {
            // 批量字段：优先使用批量值
            if (batchFieldValues.has(field)) {
                value = batchFieldValues.get(field);
            } else {
                // 如果没有批量值，使用默认值
                value = field.defaultValue !== undefined ? field.defaultValue : 0;
            }
        } else if (field.type === this.FIELD_TYPES.SYSTEM_MANAGED && field.isSystemManaged) {
            // 系统管理字段：使用系统提供的值
            if (field.systemManagedSource === 'functionCode') {
                value = functionCode;
            } else {
                // 其他系统管理源，可以在这里扩展
                value = field.defaultValue !== undefined ? field.defaultValue : 0;
            }
        } else {
            // 固定字段：使用默认值
            value = field.defaultValue !== undefined ? field.defaultValue : 0;
        }
        
        // 限制值在字段允许范围内
        const maxValue = Math.pow(2, field.bits) - 1;
        const clampedValue = Math.min(Math.max(0, value), maxValue);
        
        return clampedValue;
    }

    /**
     * 获取功能码字段的最大值
     * @returns {number} 最大值
     */
    getFunctionCodeMaxValue() {
        const functionCodeField = this.systemManagedFieldConfig.functionCodeField;
        if (functionCodeField && functionCodeField.bits) {
            return Math.pow(2, functionCodeField.bits) - 1;
        }
        return 15; // 默认值
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

        // 命名模式实时验证
        const namingPattern = document.getElementById('namingPattern');
        if (namingPattern) {
            namingPattern.addEventListener('input', () => {
                this.updateNamingPatternHelp();
            });
            namingPattern.addEventListener('blur', () => {
                this.validateAndShowNamingPattern();
            });
        } else {
            console.warn('namingPattern 元素未找到');
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
                
                // 处理查看位图按钮
                else if (e.target.classList.contains('message-select-btn')) {
                    const messageId = e.target.getAttribute('data-message-id');
                    console.log(`点击查看位图按钮, messageId=${messageId}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.showMessageBitmap(messageId);
                }
            });
        } else {
            console.error('未找到报文容器');
        }
        
        this.eventsDelegated = true;
        console.log('事件委托绑定完成');
    }

    // 加载配置模板
    /**
     * 确保字段属性完整性（向后兼容）
     * @param {Object} field - 字段对象
     */
    ensureFieldProperties(field) {
        // 设置默认字段类型
        if (!field.type) {
            if (field.usedForBatch) {
                field.type = this.FIELD_TYPES.BATCH;
            } else if (field.name === '功能码') {
                field.type = this.FIELD_TYPES.SYSTEM_MANAGED;
                field.isSystemManaged = true;
                field.systemManagedSource = 'functionCode';
            } else {
                field.type = this.FIELD_TYPES.FIXED;
            }
        }
        
        // 设置默认值
        if (field.defaultValue === undefined) {
            field.defaultValue = 0;
        }
        
        // 设置系统管理属性
        if (field.isSystemManaged === undefined) {
            field.isSystemManaged = field.type === this.FIELD_TYPES.SYSTEM_MANAGED;
        }
        
        // 设置缩写
        if (!field.abbreviation) {
            field.abbreviation = field.name.substring(0, 3).toUpperCase();
        }
        
        return field;
    }

    loadTemplate(templateName) {
        if (this.templates[templateName]) {
            this.fields = JSON.parse(JSON.stringify(this.templates[templateName]));
            
            // 确保所有字段属性完整
            this.fields.forEach(field => this.ensureFieldProperties(field));
            
            this.updateSystemManagedFieldConfig(); // 更新系统管理字段配置
            this.renderFields();
            this.renderBatchFieldsConfig(); // 重新渲染批量字段配置
            this.renderMessageNamingConfig(); // 重新渲染报文命名模式配置
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
            type: this.FIELD_TYPES.FIXED,
            bits: 4,
            segments: [{position: this.findNextAvailablePosition(), bits: 4}],
            description: '',
            defaultValue: 0,
            usedForBatch: false,
            isSystemManaged: false,
            batchRange: {min: 0, max: 15},
            abbreviation: 'NEW'  // 添加默认缩写
        };
        
        this.fields.push(newField);
        this.renderFields();
        this.renderBatchFieldsConfig(); // 更新批量字段配置
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
                    <label>缩写名称:</label>
                    <input type="text" value="${field.abbreviation || ''}" placeholder="用于命名模式" 
                           onchange="dbcEditor.updateField(${index}, 'abbreviation', this.value)">
                    <span class="hint">在命名模式中使用 {${field.abbreviation || 'NEW'}} 作为占位符</span>
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
                    this.updateDisplay(); // 确保位图也恢复
                    return;
                }
                
                // 检查分段配置是否会超出限制
                const field = this.fields[index];
                const maxPosition = Math.max(...field.segments.map(seg => seg.position + seg.bits));
                if (maxPosition > this.maxBits) {
                    alert(`当前分段配置最大位置为${maxPosition}，超出${this.maxBits}位限制`);
                    this.renderFields(); // 恢复原值
                    this.updateDisplay(); // 确保位图也恢复
                    return;
                }
            }
            
            // 验证字段名称
            if (property === 'name' && (!value || value.trim() === '')) {
                alert('字段名称不能为空');
                this.renderFields(); // 恢复原值
                this.updateDisplay(); // 确保位图也恢复
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
    /**
     * 更新字段的默认值
     * @param {number} fieldIndex - 字段索引
     * @param {number} value - 新的默认值
     */
    updateFieldDefaultValue(fieldIndex, value) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            
            // 限制值在字段允许范围内
            const maxValue = Math.pow(2, field.bits) - 1;
            const clampedValue = Math.min(Math.max(0, value || 0), maxValue);
            
            field.defaultValue = clampedValue;
            
            console.log(`字段 "${field.name}" 默认值更新为: ${clampedValue}`);
            
            // 重新渲染批量字段配置以显示新值
            this.renderBatchFieldsConfig();
            
            // 更新报文ID预览
            this.updateMessageIdPreviewIfExists();
            
            // 更新批量预览
            this.updateBatchPreview();
            
            // 更新位图显示
            this.updateDisplay();
        }
    }
    
    /**
     * 如果存在报文ID预览元素，则更新它
     */
    updateMessageIdPreviewIfExists() {
        const previewElement = document.getElementById('messageIdPreview');
        if (previewElement) {
            this.updateMessageIdPreview();
        }
    }

    /**
     * 渲染报文命名模式配置区域
     */
    renderMessageNamingConfig() {
        const container = document.getElementById('messageNamingContainer');
        if (!container) {
            console.warn('messageNamingContainer 元素未找到');
            return;
        }
        
        container.innerHTML = '';
        
        if (this.messages.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">请先添加报文后再配置命名模式。</p>';
            return;
        }
        
        this.messages.forEach((message, index) => {
            const configDiv = document.createElement('div');
            configDiv.className = 'message-naming-item';
            configDiv.innerHTML = `
                <div class="message-naming-header">
                    <h5>报文 ${index + 1}: ${message.name}</h5>
                    <span class="message-info">长度: ${message.length} 字节 | 发送节点: ${message.node}</span>
                </div>
                <div class="naming-pattern-field">
                    <label>命名模式:</label>
                    <input type="text" 
                           value="${message.namingPattern || `${message.name}_{num}_Data`}" 
                           placeholder="例如: ${message.name}_{num}_Data" 
                           onchange="dbcEditor.updateMessageNamingPattern('${message.id}', this.value)">
                    <div class="pattern-preview" id="patternPreview_${message.id}">
                        <!-- 动态显示预览 -->
                    </div>
                </div>
            `;
            
            container.appendChild(configDiv);
            
            // 更新当前报文的命名模式预览
            this.updateMessageNamingPreview(message.id, message.namingPattern || `${message.name}_{num}_Data`);
        });
    }
    
    /**
     * 更新报文命名模式
     */
    updateMessageNamingPattern(messageId, pattern) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.namingPattern = pattern;
            this.updateMessageNamingPreview(messageId, pattern);
            this.updateBatchPreview(); // 更新批量预览
        }
    }
    
    /**
     * 更新报文命名模式预览
     */
    updateMessageNamingPreview(messageId, pattern) {
        const previewElement = document.getElementById(`patternPreview_${messageId}`);
        if (!previewElement) return;
        
        if (!pattern || pattern.trim() === '') {
            previewElement.innerHTML = '';
            return;
        }
        
        try {
            // 生成几个示例名称
            const example1 = this.processNamingPatternForCombination(pattern, [], 0, 0);
            const example2 = this.processNamingPatternForCombination(pattern, [], 1, 0);
            const example3 = this.processNamingPatternForCombination(pattern, [], 2, 0);
            
            previewElement.innerHTML = `
                <small style="color: #27ae60;">
                    <strong>预览:</strong> ${example1}, ${example2}, ${example3}...
                </small>
            `;
        } catch (error) {
            previewElement.innerHTML = `
                <small style="color: #e74c3c;">
                    <strong>错误:</strong> 命名模式格式不正确
                </small>
            `;
        }
    }

    updateBatchFieldEnabled(fieldIndex, enabled) {
        if (fieldIndex >= 0 && fieldIndex < this.fields.length) {
            const field = this.fields[fieldIndex];
            
            // 禁止系统管理字段设置为批量字段
            if (field.type === this.FIELD_TYPES.SYSTEM_MANAGED && field.isSystemManaged) {
                alert(`字段 "${field.name}" 是系统管理字段，不可设置为批量字段。`);
                // 重新渲染以恢复复选框状态
                this.renderBatchFieldsConfig();
                return;
            }
            
            field.usedForBatch = enabled;
            
            // 更新字段类型
            if (enabled) {
                field.type = this.FIELD_TYPES.BATCH;
                // 初始化批量范围
                if (!field.batchRange) {
                    const maxValue = Math.pow(2, field.bits) - 1;
                    field.batchRange = {min: 0, max: maxValue};
                }
            } else {
                field.type = this.FIELD_TYPES.FIXED;
            }
            
            console.log(`字段 "${field.name}" 批量状态更新为: ${enabled}`);
            this.renderFields();
            this.renderBatchFieldsConfig();
            this.updateBatchPreview(); // 更新批量预览
            this.updateDisplay();
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
            this.updateBatchPreview(); // 更新批量预览
            this.updateDisplay(); // 更新位图显示
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
                        this.updateDisplay(); // 确保位图也恢复
                        return;
                    }
                }
                
                if (property === 'bits') {
                    if (value < 1 || value > this.maxBits) {
                        alert(`位数必须在 1-${this.maxBits} 范围内`);
                        this.renderFields(); // 恢复原值
                        this.updateDisplay(); // 确保位图也恢复
                        return;
                    }
                }
                
                // 检查位置+位数是否超出限制
                const position = property === 'position' ? value : segment.position;
                const bits = property === 'bits' ? value : segment.bits;
                
                if (position + bits > this.maxBits) {
                    alert(`段配置超出${this.maxBits}位限制：位置${position} + 位数${bits} = ${position + bits}`);
                    this.renderFields(); // 恢复原值
                    this.updateDisplay(); // 确保位图也恢复
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
                            this.updateDisplay(); // 确保位图也恢复
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
            
            // 根据字段类型设置不同的样式
            if (field.type === this.FIELD_TYPES.SYSTEM_MANAGED && field.isSystemManaged) {
                // 系统管理字段：只读显示
                fieldDiv.className = 'dynamic-field system-managed';
                const currentValue = field.defaultValue || 0;
                fieldDiv.innerHTML = `
                    <label>${field.name}:</label>
                    <input type="number" id="field_${index}" value="${currentValue}" min="0" max="${maxValue}" 
                           readonly disabled title="由报文配置管理，不可手动修改">
                    <span class="field-info">${field.bits}bit (0-${maxValue}) - 系统管理</span>
                    <div class="field-description">此字段由系统自动管理，值来源：报文配置</div>
                `;
            } else if (field.type === this.FIELD_TYPES.BATCH && field.usedForBatch) {
                // 批量字段：显示但禁用输入
                fieldDiv.className = 'dynamic-field batch-field';
                const currentValue = field.defaultValue || 0;
                fieldDiv.innerHTML = `
                    <label>${field.name}:</label>
                    <input type="number" id="field_${index}" value="${currentValue}" min="0" max="${maxValue}" 
                           readonly title="此字段已设置为批量字段，在批量生成时会自动变化">
                    <span class="field-info">${field.bits}bit (0-${maxValue}) - 批量字段</span>
                    <div class="field-description">此字段已启用批量生成，值将在批量生成时自动变化</div>
                `;
            } else {
                // 固定字段：正常输入
                fieldDiv.className = 'dynamic-field fixed-field';
                const currentValue = field.defaultValue !== undefined ? field.defaultValue : 0;
                fieldDiv.innerHTML = `
                    <label>${field.name}:</label>
                    <input type="number" id="field_${index}" value="${currentValue}" min="0" max="${maxValue}" 
                           onchange="dbcEditor.updateMessageIdPreview()">
                    <span class="field-info">${field.bits}bit (0-${maxValue})</span>
                    <div class="field-description">${field.description || ''}</div>
                `;
            }
            
            container.appendChild(fieldDiv);
        });
    }

    // 渲染批量字段配置区域
    renderBatchFieldsConfig() {
        const container = document.getElementById('batchFieldsConfigContainer');
        container.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            if (field.usedForBatch) {
                const maxValue = Math.pow(2, field.bits) - 1;
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'batch-field-config';
                fieldDiv.innerHTML = `
                    <label>${field.name}:</label>
                    <input type="number" id="batchField_${index}" value="${field.defaultValue || 0}" min="0" max="${maxValue}" 
                           onchange="dbcEditor.updateFieldDefaultValue(${index}, parseInt(this.value))">
                    <span class="field-info">${field.bits}bit (0-${maxValue})</span>
                    <div class="field-description">此字段已启用批量生成，值将在批量生成时自动变化</div>
                    <div class="batch-range-config">
                        <label>范围:</label>
                        <input type="number" id="batchFieldMin_${index}" value="${field.batchRange ? field.batchRange.min : 0}" min="0" max="${maxValue}" 
                               onchange="dbcEditor.updateBatchFieldRange(${index}, 'min', parseInt(this.value))">
                        <span>到</span>
                        <input type="number" id="batchFieldMax_${index}" value="${field.batchRange ? field.batchRange.max : maxValue}" min="0" max="${maxValue}" 
                               onchange="dbcEditor.updateBatchFieldRange(${index}, 'max', parseInt(this.value))">
                    </div>
                `;
                container.appendChild(fieldDiv);
            }
        });
    }

    renderBatchFieldsConfig() {
        const container = document.getElementById('batchFieldsContainer');
        if (!container) {
            console.warn('batchFieldsContainer 元素未找到');
            return;
        }
        
        container.innerHTML = '';
        
        if (this.fields.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">请先添加字段后再配置。</p>';
            return;
        }
        
        this.fields.forEach((field, index) => {
            const maxValue = Math.pow(2, field.bits) - 1;
            const fieldDiv = document.createElement('div');
            
            // 根据字段类型设置不同的样式和行为
            if (field.type === this.FIELD_TYPES.SYSTEM_MANAGED && field.isSystemManaged) {
                // 系统管理字段：不允许设置为批量字段，显示当前值
                fieldDiv.className = 'batch-field-item system-managed disabled';
                fieldDiv.innerHTML = `
                    <div class="batch-field-header">
                        <div class="batch-field-checkbox">
                            <input type="checkbox" id="batch_field_${index}" disabled 
                                   title="系统管理字段不可设置为批量字段">
                            <label for="batch_field_${index}" class="disabled">${field.name}</label>
                            <span class="field-abbreviation" title="在命名模式中使用 {${field.abbreviation || 'N/A'}}">
                                (缩写: ${field.abbreviation || 'N/A'})
                            </span>
                            <span class="system-managed-label">系统管理</span>
                        </div>
                        <div class="current-value-display">
                            当前值: <span class="current-value">由报文配置决定</span>
                        </div>
                    </div>
                    <div class="batch-field-info system-managed">
                        字段位数: ${field.bits}bit，最大值: ${maxValue}，类型: 系统管理字段（值由报文配置提供）
                    </div>
                `;
            } else {
                // 普通字段：可以设置为批量字段或配置固定值
                const isEnabled = field.usedForBatch;
                fieldDiv.className = isEnabled ? 'batch-field-item enabled' : 'batch-field-item';
                
                fieldDiv.innerHTML = `
                    <div class="batch-field-header">
                        <div class="batch-field-checkbox">
                            <input type="checkbox" id="batch_field_${index}" 
                                   ${isEnabled ? 'checked' : ''}
                                   onchange="dbcEditor.updateBatchFieldEnabled(${index}, this.checked)">
                            <label for="batch_field_${index}">${field.name}</label>
                            <span class="field-abbreviation" title="在命名模式中使用 {${field.abbreviation || 'N/A'}}">
                                (缩写: ${field.abbreviation || 'N/A'})
                            </span>
                        </div>
                        <div class="mode-indicator">
                            <span class="mode-label">${isEnabled ? '批量模式' : '固定值模式'}</span>
                        </div>
                    </div>
                    
                    ${isEnabled ? `
                        <!-- 批量模式：范围配置 -->
                        <div class="batch-field-range">
                            <div class="range-config">
                                <label>批量范围:</label>
                                <input type="number" value="${field.batchRange ? field.batchRange.min : 0}" 
                                       min="0" max="${maxValue}" class="range-input"
                                       onchange="dbcEditor.updateBatchFieldRange(${index}, 'min', parseInt(this.value))">
                                <span>至</span>
                                <input type="number" value="${field.batchRange ? field.batchRange.max : maxValue}" 
                                       min="0" max="${maxValue}" class="range-input"
                                       onchange="dbcEditor.updateBatchFieldRange(${index}, 'max', parseInt(this.value))">
                                <span class="range-preview">将生成 ${field.batchRange ? (field.batchRange.max - field.batchRange.min + 1) : (maxValue + 1)} 个值</span>
                            </div>
                        </div>
                    ` : `
                        <!-- 固定值模式：直接编辑值 -->
                        <div class="fixed-value-config">
                            <div class="fixed-value-editor">
                                <label>固定值:</label>
                                <input type="number" value="${field.defaultValue || 0}" 
                                       min="0" max="${maxValue}" class="fixed-value-input"
                                       onchange="dbcEditor.updateFieldDefaultValue(${index}, parseInt(this.value))">
                                <span class="value-info">范围: 0-${maxValue}</span>
                                <span class="preview-value">当前使用值: ${field.defaultValue || 0}</span>
                            </div>
                        </div>
                    `}
                    
                    <div class="batch-field-info">
                        字段位数: ${field.bits}bit，最大值: ${maxValue}，当前模式: ${isEnabled ? '批量生成' : '固定值'}
                        ${!isEnabled ? '<br><small>ℹ️ 未勾选的字段在批量生成时使用上方设置的固定值</small>' : ''}
                    </div>
                `;
            }
            
            container.appendChild(fieldDiv);
        });
        
        // 更新报文ID预览（如果存在）
        this.updateMessageIdPreviewIfExists();
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
            this.renderMessageNamingConfig(); // 更新报文命名模式配置
            this.updateNamingPatternHelp(); // 更新命名模式帮助
            this.updateBatchPreview(); // 更新批量预览
            
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
        
        // 获取当前选中的报文的功能码
        const selectedMessage = this.messages.find(msg => {
            const element = document.querySelector(`[data-message-id="${msg.id}"]`);
            return element && element.classList.contains('selected');
        });
        const functionCode = selectedMessage ? selectedMessage.functionCode : 0;
        
        this.fields.forEach((field, index) => {
            // 使用统一的字段值获取方法
            const value = this.getFieldValue(field, index, { functionCode });
            
            // 将值分配到各个段
            this.distributeValueToSegments(field, value, (position, bitValue) => {
                messageId |= (bitValue << position);
            });
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

    // ==========================================
    // 增强的命名模式系统
    // ==========================================
    
    /**
     * 数字格式化方法
     * @param {number} value - 要格式化的数值
     * @param {string} format - 格式化字符串
     * @returns {string} 格式化后的字符串
     */
    formatNumber(value, format) {
        // 解析格式字符串 例如: "prefix_:03d:_suffix" 或 "05d" 或 "3d0"
        const parts = format.split(':');
        
        let prefix = '';
        let suffix = '';
        let numberFormat = format;
        
        if (parts.length === 3) {
            // 完整格式: "prefix:03d:suffix"
            prefix = parts[0];
            numberFormat = parts[1];
            suffix = parts[2];
        } else if (parts.length === 2) {
            // 部分格式: "prefix:03d" 或 "03d:suffix"
            if (parts[1].match(/^\d*[do]?$/)) {
                // "prefix:03d"
                prefix = parts[0];
                numberFormat = parts[1];
            } else {
                // "03d:suffix"
                numberFormat = parts[0];
                suffix = parts[1];
            }
        }
        
        // 解析数字格式 (例如: "03d", "5d0", "d")
        const formatMatch = numberFormat.match(/^(\d*)(d)(\d*)$/);
        if (!formatMatch) {
            // 如果格式不匹配，直接返回数值
            return prefix + value + suffix;
        }
        
        const leadingZeros = formatMatch[1] ? parseInt(formatMatch[1]) : 0;
        const trailingZeros = formatMatch[3] ? parseInt(formatMatch[3]) : 0;
        
        let formattedNumber = value.toString();
        
        // 添加前导零
        if (leadingZeros > 0) {
            formattedNumber = formattedNumber.padStart(leadingZeros, '0');
        }
        
        // 添加后导零
        if (trailingZeros > 0) {
            formattedNumber = formattedNumber.padEnd(formattedNumber.length + trailingZeros, '0');
        }
        
        return prefix + formattedNumber + suffix;
    }
    
    /**
     * 解析并处理扩展占位符
     * @param {string} placeholder - 占位符内容（不包括花括号）
     * @param {number} value - 要格式化的数值
     * @returns {string} 处理后的字符串
     */
    processExtendedPlaceholder(placeholder, value) {
        // 检查是否包含格式化信息
        const formatMatch = placeholder.match(/^([A-Z]+):(.+)$/);
        if (formatMatch) {
            const fieldAbbr = formatMatch[1];
            const format = formatMatch[2];
            return this.formatNumber(value, format);
        }
        
        // 如果没有格式化信息，直接返回数值
        return value.toString();
    }
    
    /**
     * 处理命名模式，支持字段占位符和传统的{num}占位符
     * @param {string} pattern - 命名模式，例如: "CH{CH}_FC{FC}_Data_{num}"
     * @param {number} channelNumber - 通道编号
     * @param {number} functionCode - 功能码（可选）
     * @returns {string} 处理后的名称
     */
    processNamingPattern(pattern, channelNumber, functionCode = 0) {
        if (!pattern || typeof pattern !== 'string') {
            return `Message_${channelNumber}`;
        }
        
        let result = pattern;
        
        // 处理传统的{num}占位符（保持向后兼容）
        // 支持格式化: {num:03d}, {num:prefix_:05d:_suffix}
        const numPlaceholderRegex = /\{num(?::([^}]+))?\}/g;
        result = result.replace(numPlaceholderRegex, (match, format) => {
            if (format) {
                return this.formatNumber(channelNumber, format);
            }
            return channelNumber.toString();
        });
        
        // 处理字段占位符 {abbreviation}
        this.fields.forEach((field, index) => {
            if (field.abbreviation) {
                // 支持两种格式:
                // 1. 简单格式: {CH}
                // 2. 扩展格式: {CH:03d}, {CH:prefix_:05d:_suffix}
                const simplePattern = `{${field.abbreviation}}`;
                const extendedPatternRegex = new RegExp(`\\{${field.abbreviation}:([^}]+)\\}`, 'g');
                
                // 计算字段值
                let fieldValue;
                if (field.usedForBatch) {
                    // 批量字段使用通道号计算值
                    if (field.batchRange) {
                        const range = field.batchRange.max - field.batchRange.min + 1;
                        const offset = channelNumber % range;
                        fieldValue = field.batchRange.min + offset;
                    } else {
                        fieldValue = channelNumber;
                    }
                } else if (field.name === '功能码') {
                    // 功能码字段使用传入的功能码值
                    fieldValue = functionCode;
                } else {
                    // 固定字段使用UI配置值
                    const input = document.getElementById(`field_${index}`);
                    fieldValue = input ? parseInt(input.value) || 0 : 0;
                }
                
                // 限制值在字段范围内
                const maxValue = Math.pow(2, field.bits) - 1;
                fieldValue = Math.min(Math.max(0, fieldValue), maxValue);
                
                // 处理扩展格式占位符
                result = result.replace(extendedPatternRegex, (match, format) => {
                    return this.formatNumber(fieldValue, format);
                });
                
                // 处理简单格式占位符
                const simpleRegex = new RegExp(simplePattern.replace(/[{}]/g, '\\$&'), 'g');
                result = result.replace(simpleRegex, fieldValue.toString());
            }
        });
        
        return result;
    }
    
    /**
     * 获取当前可用的占位符列表
     * @returns {Array} 占位符信息数组
     */
    getAvailablePlaceholders() {
        const placeholders = [
            {
                placeholder: '{num}',
                description: '通道编号',
                example: '0, 1, 2...'
            }
        ];
        
        this.fields.forEach(field => {
            if (field.abbreviation) {
                placeholders.push({
                    placeholder: `{${field.abbreviation}}`,
                    description: field.name,
                    example: field.usedForBatch ? 
                        `${field.batchRange?.min || 0}-${field.batchRange?.max || 0}` :
                        '固定值',
                    fieldType: field.usedForBatch ? '批量字段' : '固定字段'
                });
            }
        });
        
        return placeholders;
    }
    
    /**
     * 验证命名模式的有效性
     * @param {string} pattern - 命名模式
     * @returns {object} 验证结果
     */
    validateNamingPattern(pattern) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            usedPlaceholders: []
        };
        
        if (!pattern || typeof pattern !== 'string') {
            result.isValid = false;
            result.errors.push('命名模式不能为空');
            return result;
        }
        
        // 检查空白字符
        if (pattern.trim() !== pattern) {
            result.warnings.push('命名模式包含前导或尾随空格');
        }
        
        // 提取所有占位符（包括格式化占位符）
        const placeholderRegex = /\{([^}]+)\}/g;
        let match;
        const foundPlaceholders = [];
        
        while ((match = placeholderRegex.exec(pattern)) !== null) {
            const placeholderContent = match[1];
            
            // 分析占位符内容
            const parts = placeholderContent.split(':');
            const mainPlaceholder = parts[0]; // 主占位符名称
            
            foundPlaceholders.push(mainPlaceholder);
            
            // 如果有格式化信息，验证格式
            if (parts.length > 1) {
                const formatPart = parts.slice(1).join(':'); // 重新组合格式部分
                const formatValidation = this.validateNumberFormat(formatPart);
                if (!formatValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(`占位符 {${placeholderContent}} 的格式不正确: ${formatValidation.error}`);
                }
            }
        }
        
        // 验证占位符
        const validPlaceholders = ['num', ...this.fields.filter(f => f.abbreviation).map(f => f.abbreviation)];
        
        foundPlaceholders.forEach(placeholder => {
            if (validPlaceholders.includes(placeholder)) {
                result.usedPlaceholders.push(placeholder);
            } else {
                result.isValid = false;
                result.errors.push(`未知的占位符: {${placeholder}}`);
            }
        });
        
        // 检查是否包含至少一个有效占位符
        if (foundPlaceholders.length === 0) {
            result.warnings.push('命名模式没有使用任何占位符，所有生成的消息将具有相同的名称');
        }
        
        return result;
    }
    
    /**
     * 验证数字格式化字符串
     * @param {string} format - 格式字符串
     * @returns {object} 验证结果
     */
    validateNumberFormat(format) {
        const result = {
            isValid: true,
            error: ''
        };
        
        // 允许的格式示例:
        // "03d" - 3位前导零
        // "d0" - 1位后导零
        // "5d2" - 5位前导零 + 2位后导零
        // "prefix_:03d:_suffix" - 带前后缀的格式
        
        const parts = format.split(':');
        let numberFormatPart = format;
        
        if (parts.length === 1) {
            // 简单格式: "03d"
            numberFormatPart = parts[0];
        } else if (parts.length === 2) {
            // 两部分格式: "prefix:03d" 或 "03d:suffix"
            if (parts[1].match(/^\d*d\d*$/)) {
                numberFormatPart = parts[1];
            } else {
                numberFormatPart = parts[0];
            }
        } else if (parts.length === 3) {
            // 三部分格式: "prefix:03d:suffix"
            numberFormatPart = parts[1];
        }
        
        // 验证数字格式部分
        if (!numberFormatPart.match(/^\d*d\d*$/)) {
            result.isValid = false;
            result.error = `数字格式 "${numberFormatPart}" 不正确，应为类似 "03d", "d0", "5d2" 的格式`;
        }
        
        return result;
    }
    
    /**
     * 更新命名模式帮助信息
     */
    updateNamingPatternHelp() {
        const fieldPlaceholdersList = document.getElementById('fieldPlaceholdersList');
        if (!fieldPlaceholdersList) return;
        
        fieldPlaceholdersList.innerHTML = '';
        
        // 生成字段占位符列表
        this.fields.forEach(field => {
            if (field.abbreviation) {
                const li = document.createElement('li');
                const placeholder = `{${field.abbreviation}}`;
                const formattedPlaceholder = `{${field.abbreviation}:03d}`;
                const typeInfo = field.usedForBatch ? 
                    `批量字段 (${field.batchRange?.min || 0}-${field.batchRange?.max || 0})` :
                    '固定字段';
                
                li.innerHTML = `
                    <code>${placeholder}</code> 或 <code>${formattedPlaceholder}</code> - ${field.name} (${typeInfo})
                    <br><small style="color: #6c757d; margin-left: 20px;">
                        支持格式化: {${field.abbreviation}:03d}, {${field.abbreviation}:ID_:04d:_END}
                    </small>
                `;
                fieldPlaceholdersList.appendChild(li);
            }
        });
        
        if (this.fields.filter(f => f.abbreviation).length === 0) {
            const li = document.createElement('li');
            li.style.color = '#999';
            li.textContent = '暂无可用的字段占位符，请先配置字段缩写';
            fieldPlaceholdersList.appendChild(li);
        }
    }
    
    /**
     * 验证并显示命名模式验证结果
     */
    validateAndShowNamingPattern() {
        const namingPatternInput = document.getElementById('namingPattern');
        const validationDiv = document.getElementById('patternValidation');
        
        if (!namingPatternInput || !validationDiv) return;
        
        const pattern = namingPatternInput.value;
        const validation = this.validateNamingPattern(pattern);
        
        validationDiv.innerHTML = '';
        validationDiv.style.display = 'none';
        
        if (!validation.isValid || validation.warnings.length > 0) {
            validationDiv.style.display = 'block';
            
            if (!validation.isValid) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error';
                errorDiv.style.color = '#e74c3c';
                errorDiv.innerHTML = `<strong>错误:</strong> ${validation.errors.join(', ')}`;
                validationDiv.appendChild(errorDiv);
            }
            
            if (validation.warnings.length > 0) {
                const warningDiv = document.createElement('div');
                warningDiv.className = 'validation-warning';
                warningDiv.style.color = '#f39c12';
                warningDiv.innerHTML = `<strong>警告:</strong> ${validation.warnings.join(', ')}`;
                validationDiv.appendChild(warningDiv);
            }
        }
        
        // 显示预览示例
        if (validation.isValid) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'pattern-preview';
            previewDiv.style.color = '#27ae60';
            previewDiv.style.marginTop = '5px';
            
            const exampleName1 = this.processNamingPattern(pattern, 0, 1);
            const exampleName2 = this.processNamingPattern(pattern, 1, 2);
            
            previewDiv.innerHTML = `<strong>预览:</strong> ${exampleName1}, ${exampleName2}...`;
            validationDiv.appendChild(previewDiv);
            validationDiv.style.display = 'block';
        }
    }
    
    /**
     * 生成所有可能的字段组合
     * @param {Array} batchFields - 批量字段数组
     * @returns {Array} 字段组合数组
     */
    generateFieldCombinations(batchFields) {
        if (batchFields.length === 0) {
            return [];
        }
        
        // 生成每个字段的值范围
        const fieldRanges = batchFields.map(field => {
            const range = field.batchRange || {min: 0, max: Math.pow(2, field.bits) - 1};
            const values = [];
            for (let value = range.min; value <= range.max; value++) {
                values.push(value);
            }
            return {
                field: field,
                values: values
            };
        });
        
        // 使用笛卡尔积生成所有组合
        const combinations = [];
        
        function generateCombinations(currentCombination, remainingRanges) {
            if (remainingRanges.length === 0) {
                combinations.push([...currentCombination]);
                return;
            }
            
            const currentRange = remainingRanges[0];
            const restRanges = remainingRanges.slice(1);
            
            for (const value of currentRange.values) {
                currentCombination.push({
                    field: currentRange.field,
                    value: value
                });
                generateCombinations(currentCombination, restRanges);
                currentCombination.pop();
            }
        }
        
        generateCombinations([], fieldRanges);
        
        console.log(`生成了 ${combinations.length} 个字段组合`);
        return combinations;
    }
    
    /**
     * 根据字段组合计算报文ID
     * @param {Array} combination - 字段组合
     * @param {number} functionCode - 功能码
     * @returns {number} 报文ID
     */
    calculateMessageIdForCombination(combination, functionCode = 0) {
        let messageId = 0;
        
        // 创建批量字段值映射
        const batchFieldValues = new Map();
        combination.forEach(item => {
            batchFieldValues.set(item.field, item.value);
        });
        
        this.fields.forEach((field, index) => {
            // 使用统一的字段值获取方法
            const value = this.getFieldValue(field, index, { batchFieldValues, functionCode });
            
            // 将值分配到各个段
            this.distributeValueToSegments(field, value, (position, bitValue) => {
                messageId |= (bitValue << position);
            });
        });
        
        return messageId;
    }
    
    /**
     * 为字段组合处理命名模式
     * @param {string} pattern - 命名模式
     * @param {Array} combination - 字段组合
     * @param {number} messageIndex - 消息序号
     * @param {number} functionCode - 功能码
     * @returns {string} 处理后的名称
     */
    processNamingPatternForCombination(pattern, combination, messageIndex, functionCode = 0) {
        if (!pattern || typeof pattern !== 'string') {
            return `Message_${messageIndex}`;
        }
        
        let result = pattern;
        
        // 处理{num}占位符（现在代表消息序号）
        // 支持格式化: {num:03d}, {num:prefix_:05d:_suffix}
        const numPlaceholderRegex = /\{num(?::([^}]+))?\}/g;
        result = result.replace(numPlaceholderRegex, (match, format) => {
            if (format) {
                return this.formatNumber(messageIndex, format);
            }
            return messageIndex.toString();
        });
        
        // 创建字段值映射
        const fieldValueMap = new Map();
        combination.forEach(item => {
            fieldValueMap.set(item.field, item.value);
        });
        
        // 处理字段占位符（支持格式化）
        this.fields.forEach((field, index) => {
            if (field.abbreviation) {
                // 支持两种格式:
                // 1. 简单格式: {CH}
                // 2. 扩展格式: {CH:03d}, {CH:prefix_:05d:_suffix}
                const simplePattern = `{${field.abbreviation}}`;
                const extendedPatternRegex = new RegExp(`\\{${field.abbreviation}:([^}]+)\\}`, 'g');
                
                let fieldValue;
                if (field.usedForBatch && fieldValueMap.has(field)) {
                    // 批量字段使用组合中的值
                    fieldValue = fieldValueMap.get(field);
                } else if (field.name === '功能码') {
                    // 功能码字段
                    fieldValue = functionCode;
                } else {
                    // 固定字段使用UI配置值
                    const input = document.getElementById(`field_${index}`);
                    fieldValue = input ? parseInt(input.value) || 0 : 0;
                }
                
                // 限制值在字段范围内
                const maxValue = Math.pow(2, field.bits) - 1;
                fieldValue = Math.min(Math.max(0, fieldValue), maxValue);
                
                // 处理扩展格式占位符
                result = result.replace(extendedPatternRegex, (match, format) => {
                    return this.formatNumber(fieldValue, format);
                });
                
                // 处理简单格式占位符
                const simpleRegex = new RegExp(simplePattern.replace(/[{}]/g, '\\$&'), 'g');
                result = result.replace(simpleRegex, fieldValue.toString());
            }
        });
        
        return result;
    }
    
    /**
     * 更新批量预览信息
     */
    updateBatchPreview() {
        const previewElement = document.getElementById('batchPreviewText');
        if (!previewElement) return;
        
        const batchFields = this.fields.filter(field => field.usedForBatch);
        
        if (batchFields.length === 0) {
            previewElement.innerHTML = '请先配置批量字段以查看生成预览';
            return;
        }
        
        // 计算组合数
        let totalCombinations = 1;
        const fieldInfo = [];
        
        batchFields.forEach(field => {
            const range = field.batchRange || {min: 0, max: Math.pow(2, field.bits) - 1};
            const count = range.max - range.min + 1;
            totalCombinations *= count;
            fieldInfo.push(`${field.name}(${range.min}~${range.max}, ${count}个值)`);
        });
        
        const totalMessages = totalCombinations * this.messages.length;
        
        previewElement.innerHTML = `
            <div class="preview-stats">
                <div class="stat-item">
                    <span class="stat-label">批量字段:</span>
                    <span class="stat-value">${batchFields.length}个</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">字段组合:</span>
                    <span class="stat-value">${totalCombinations}个</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">报文模板:</span>
                    <span class="stat-value">${this.messages.length}个</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">总报文数:</span>
                    <span class="stat-value">${totalMessages}个</span>
                </div>
            </div>
            <p style="margin-top: 10px; color: #6c757d; font-size: 0.85em;">
                字段详情: ${fieldInfo.join(' × ')}
            </p>
        `;
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
            functionCode: 0, // 默认功能码
            namingPattern: `${name || `Message_${this.messages.length + 1}`}_{num}_Data` // 为每个报文添加独立的命名模式
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
        this.renderMessageNamingConfig(); // 更新报文命名模式配置
        this.updateMessageCount();
        this.updateBatchPreview(); // 更新批量预览
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
                        <label>字节序:</label>
                        <select data-field="byteOrder" onchange="dbcEditor.updateSignalInMessage('${message.id}', ${sigIndex}, 'byteOrder', this.value)">
                            <option value="lsb" ${(signal.byteOrder || 'lsb') === 'lsb' ? 'selected' : ''}>LSB优先(Intel)</option>
                            <option value="msb" ${signal.byteOrder === 'msb' ? 'selected' : ''}>MSB优先(Motorola)</option>
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
                <div class="message-header-buttons">
                    <button type="button" class="btn-secondary message-select-btn" data-message-id="${message.id}">查看位图</button>
                    <button type="button" class="btn-danger btn-remove-message" data-message-id="${message.id}">删除报文</button>
                </div>
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
                    <input type="number" value="${message.functionCode}" min="0" max="${this.getFunctionCodeMaxValue()}" 
                           onchange="dbcEditor.updateMessage('${message.id}', 'functionCode', parseInt(this.value))">
                    <span class="field-info">范围: 0-${this.getFunctionCodeMaxValue()}</span>
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
            // 如果更新的是报文名称，需要更新命名模式配置
            if (property === 'name') {
                this.renderMessageNamingConfig();
            }
            this.updateMessageIdPreview();
            this.updateBatchPreview(); // 更新批量预览
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
                this.renderMessageNamingConfig(); // 更新报文命名模式配置
                this.updateMessageCount();
                this.updateBatchPreview(); // 更新批量预览
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
            this.updateBatchPreview(); // 更新批量预览
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
                    this.updateBatchPreview(); // 更新批量预览
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
            
            // 如果当前报文被选中且位图可见，更新位图
            if (this.currentSelectedMessage && this.currentSelectedMessage.id === messageId) {
                const bitmapSection = document.getElementById('messageBitmapSection');
                if (bitmapSection && bitmapSection.style.display !== 'none') {
                    this.updateMessageBitmap(message);
                }
            }
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

        const namingPattern = document.getElementById('namingPattern').value;

        // 检查是否有可用于批量生成的字段
        const batchFields = this.fields.filter(field => field.usedForBatch);
        if (batchFields.length === 0) {
            alert('没有设置可用于批量生成的字段，请至少选择一个字段作为批量字段。');
            return;
        }

        console.log(`将使用以下字段进行批量生成: ${batchFields.map(f => f.name).join(', ')}`);

        // 验证命名模式
        const validation = this.validateNamingPattern(namingPattern);
        if (!validation.isValid) {
            alert(`命名模式错误:\n${validation.errors.join('\n')}`);
            return;
        }
        
        // 显示警告信息
        if (validation.warnings.length > 0) {
            const proceed = confirm(`检测到以下警告:\n${validation.warnings.join('\n')}\n\n是否继续生成？`);
            if (!proceed) {
                return;
            }
        }

        // 生成所有可能的字段组合
        const fieldCombinations = this.generateFieldCombinations(batchFields);
        const totalCombinations = fieldCombinations.length;
        
        if (totalCombinations === 0) {
            alert('没有可生成的字段组合，请检查批量字段配置。');
            return;
        }
        
        // 检查是否要生成大量报文（超过100条）
        const totalMessages = totalCombinations * this.messages.length;
        if (totalMessages > 100) {
            const proceed = confirm(`将生成 ${totalMessages} 条报文（${totalCombinations} 个字段组合 × ${this.messages.length} 个报文模板）。\n\n生成大量报文可能需要一些时间，是否继续？`);
            if (!proceed) {
                return;
            }
        }

        this.generatedMessages = [];
        let messageIndex = 0;

        // 为每个字段组合生成所有配置的报文
        fieldCombinations.forEach((combination, combinationIndex) => {
            this.messages.forEach((messageTemplate, msgIndex) => {
                // 计算报文ID（根据字段组合调整）
                const messageId = this.calculateMessageIdForCombination(combination, messageTemplate.functionCode);
                
                // 使用报文模板自己的命名模式，如果没有则使用全局模式
                const messageNamingPattern = messageTemplate.namingPattern || namingPattern;
                const messageName = this.processNamingPatternForCombination(messageNamingPattern, combination, messageIndex, messageTemplate.functionCode);

                // 生成报文
                const generatedMessage = {
                    id: messageId,
                    name: messageName,
                    length: messageTemplate.length,
                    node: messageTemplate.node,
                    description: messageTemplate.description,
                    signals: messageTemplate.signals.map(signal => ({
                        ...signal,
                        name: this.processNamingPatternForCombination(signal.name, combination, messageIndex, messageTemplate.functionCode)
                    }))
                };

                this.generatedMessages.push(generatedMessage);
                messageIndex++;
            });
        });

        alert(`成功生成 ${totalCombinations} 个字段组合的 ${this.messages.length} 类报文，共 ${totalMessages} 个报文`);
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
                // 非批量字段使用统一的值获取方法
                value = this.getFieldValue(field, index, { functionCode: 0 });
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

    // DBC标识符清理函数
    cleanDBCIdentifier(str) {
        if (!str) return 'DefaultName';
        // 移除非法字符，只保留字母、数字和下划线
        return str.toString().replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[^a-zA-Z_]/, '_');
    }
    
    // DBC字符串清理函数
    cleanDBCString(str) {
        if (!str) return '';
        // 转义双引号并移除控制字符
        return str.toString().replace(/"/g, '\\"').replace(/[\r\n\t]/g, ' ').trim();
    }
    
    // 数值验证函数
    validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseFloat(value);
        if (isNaN(num)) return min;
        return Math.max(min, Math.min(max, num));
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

BU_:`;

        const messages = this.generatedMessages.length > 0 ? this.generatedMessages : this.getAllCurrentMessages();
        
        // 收集所有用到的节点名称
        const nodeNames = new Set();
        messages.forEach(message => {
            if (message.node) {
                nodeNames.add(this.cleanDBCIdentifier(message.node));
            }
        });
        
        // 添加BU_节点定义（紧接在BU_:后面，不要多余空行）
        if (nodeNames.size > 0) {
            dbcContent += ' ' + Array.from(nodeNames).join(' ') + '\n\n';
        } else {
            dbcContent += '\n\n';
        }

        messages.forEach(message => {
            // 验证和清理报文数据
            let messageId = this.validateNumber(message.id, 0, 0x1FFFFFFF);
            
            // 扩展帧需要在ID上加上0x80000000标识
            if (this.frameFormat === 'extended') {
                messageId = messageId | 0x80000000;
            }
            
            const messageName = this.cleanDBCIdentifier(message.name);
            const messageLength = this.validateNumber(message.length, 1, 8);
            const messageNode = this.cleanDBCIdentifier(message.node);
            
            dbcContent += `BO_ ${messageId} ${messageName}: ${messageLength} ${messageNode}\n`;
            
            if (message.signals && message.signals.length > 0) {
                message.signals.forEach(signal => {
                    // 验证和清理信号数据
                    const signalName = this.cleanDBCIdentifier(signal.name);
                    const startBit = this.validateNumber(signal.startBit, 0, 63);
                    const length = this.validateNumber(signal.length, 1, 64);
                    const factor = this.validateNumber(signal.factor, -1e10, 1e10) || 1;
                    const offset = this.validateNumber(signal.offset, -1e10, 1e10) || 0;
                    const min = this.validateNumber(signal.min, -1e10, 1e10) || 0;
                    const max = this.validateNumber(signal.max, -1e10, 1e10) || 0;
                    const unit = this.cleanDBCString(signal.unit);
                    
                    // 字节序：1=小端(Intel)，0=大端(Motorola)
                    const byteOrder = (signal.byteOrder === 'msb') ? '0' : '1';
                    const valueType = (signal.type === 'signed') ? '-' : '+';
                    
                    dbcContent += ` SG_ ${signalName} : ${startBit}|${length}@${byteOrder}${valueType} (${factor},${offset}) [${min}|${max}] "${unit}" ${messageNode}\n`;
                });
            }
            
            dbcContent += '\n';
        });

        // 添加信号注释
        messages.forEach(message => {
            if (message.signals && message.signals.length > 0) {
                message.signals.forEach(signal => {
                    if (signal.description && signal.description.trim()) {
                        let messageId = this.validateNumber(message.id, 0, 0x1FFFFFFF);
                        
                        // 扩展帧需要在ID上加上0x80000000标识
                        if (this.frameFormat === 'extended') {
                            messageId = messageId | 0x80000000;
                        }
                        
                        const signalName = this.cleanDBCIdentifier(signal.name);
                        const description = this.cleanDBCString(signal.description);
                        dbcContent += `CM_ SG_ ${messageId} ${signalName} "${description}";\n`;
                    }
                });
            }
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
    
    // ==========================================
    // 信号位图可视化功能
    // ==========================================
    
    /**
     * 显示指定报文的信号位图
     * @param {string} messageId - 报文ID
     */
    showMessageBitmap(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) {
            console.error(`未找到报文: ${messageId}`);
            return;
        }
        
        // 更新当前选中的报文
        this.currentSelectedMessage = message;
        
        // 显示位图区域
        const bitmapSection = document.getElementById('messageBitmapSection');
        if (bitmapSection) {
            bitmapSection.style.display = 'block';
        }
        
        // 更新报文信息
        this.updateMessageBitmapInfo(message);
        
        // 更新位图显示
        this.updateMessageBitmap(message);
        
        // 更新报文选中状态
        this.updateMessageSelection(messageId);
        
        // 滚动到位图区域
        bitmapSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * 更新报文信息显示
     * @param {Object} message - 报文对象
     */
    updateMessageBitmapInfo(message) {
        const nameElement = document.getElementById('currentMessageName');
        const lengthElement = document.getElementById('currentMessageLength');
        const bitsElement = document.getElementById('currentMessageBits');
        
        if (nameElement) nameElement.textContent = message.name;
        if (lengthElement) lengthElement.textContent = message.length;
        if (bitsElement) bitsElement.textContent = message.length * 8;
    }
    
    /**
     * 更新报文位图显示
     * @param {Object} message - 报文对象
     */
    updateMessageBitmap(message) {
        const container = document.getElementById('messageBitDisplay');
        const scaleContainer = container?.parentElement?.querySelector('.message-bit-scale');
        const labelsContainer = container?.parentElement?.querySelector('.message-bit-labels');
        
        if (!container || !scaleContainer || !labelsContainer) {
            console.error('位图容器未找到');
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        scaleContainer.innerHTML = '';
        labelsContainer.innerHTML = '';
        
        const totalBits = message.length * 8;
        const bitUsage = new Array(totalBits).fill(null);
        const conflicts = new Set();
        const byteOrder = new Array(totalBits).fill('lsb'); // 默认LSB
        
        // 标记已使用的位和检测冲突
        message.signals.forEach((signal, signalIndex) => {
            const startBit = parseInt(signal.startBit) || 0;
            const length = parseInt(signal.length) || 1;
            const endBit = startBit + length - 1;
            
            // 设置字节序（根据signal的type或配置）
            const signalByteOrder = this.getSignalByteOrder(signal);
            
            for (let i = startBit; i <= endBit && i < totalBits; i++) {
                if (bitUsage[i] !== null) {
                    conflicts.add(i);
                }
                bitUsage[i] = signalIndex;
                byteOrder[i] = signalByteOrder;
            }
        });
        
        // 从高位到低位显示（按字节组织）
        for (let byteIndex = 0; byteIndex < message.length; byteIndex++) {
            // 每个字节从高位到低位显示 (7,6,5,4,3,2,1,0)
            for (let bitInByte = 7; bitInByte >= 0; bitInByte--) {
                const bitIndex = byteIndex * 8 + bitInByte;
                
                // 位标尺
                const scaleSpan = document.createElement('span');
                scaleSpan.textContent = bitIndex;
                scaleContainer.appendChild(scaleSpan);
                
                // 位单元格
                const bitCell = document.createElement('div');
                bitCell.className = 'message-bit-cell';
                bitCell.textContent = bitIndex;
                bitCell.setAttribute('data-bit-index', bitIndex);
                
                if (conflicts.has(bitIndex)) {
                    bitCell.classList.add('signal-conflict');
                    bitCell.title = `位${bitIndex}: 信号冲突！`;
                } else if (bitUsage[bitIndex] !== null) {
                    bitCell.classList.add('signal-used');
                    const signal = message.signals[bitUsage[bitIndex]];
                    bitCell.style.backgroundColor = this.getSignalColor(bitUsage[bitIndex]);
                    bitCell.title = `位${bitIndex}: ${signal.name} (${signal.length}bit, ${byteOrder[bitIndex] === 'msb' ? 'MSB优先' : 'LSB优先'})`;
                    
                    // 添加字节序标识
                    if (byteOrder[bitIndex] === 'msb') {
                        bitCell.classList.add('msb-first');
                    } else {
                        bitCell.classList.add('lsb-first');
                    }
                } else {
                    bitCell.classList.add('signal-unused');
                    bitCell.title = `位${bitIndex}: 未使用`;
                }
                
                // 添加点击事件
                bitCell.addEventListener('click', () => {
                    this.onBitCellClick(bitIndex, message);
                });
                
                container.appendChild(bitCell);
                
                // 位标签
                const labelSpan = document.createElement('span');
                if (bitUsage[bitIndex] !== null && !conflicts.has(bitIndex)) {
                    const signal = message.signals[bitUsage[bitIndex]];
                    const startBit = parseInt(signal.startBit) || 0;
                    const endBit = startBit + (parseInt(signal.length) || 1) - 1;
                    
                    // 只在信号的最高位显示名称
                    if (bitIndex === endBit) {
                        labelSpan.textContent = signal.name;
                        labelSpan.title = `${signal.name} (${startBit}-${endBit})`;
                    }
                }
                labelsContainer.appendChild(labelSpan);
            }
        }
        
        // 更新信号颜色图例
        this.updateMessageSignalColorLegend(message);
    }
    
    /**
     * 获取信号的字节序
     * @param {Object} signal - 信号对象
     * @returns {string} 'lsb' 或 'msb'
     */
    getSignalByteOrder(signal) {
        // 可以根据信号的属性或用户配置来决定
        // 这里默认使用LSB，但可以扩展为用户可配置
        return signal.byteOrder || 'lsb';
    }
    
    /**
     * 获取信号颜色
     * @param {number} signalIndex - 信号索引
     * @returns {string} 颜色值
     */
    getSignalColor(signalIndex) {
        const colors = [
            '#e3f2fd',  // 浅蓝色
            '#f3e5f5',  // 浅紫色
            '#e8f5e8',  // 浅绿色
            '#fff3e0',  // 浅橙色
            '#fce4ec',  // 浅粉色
            '#e0f2f1',  // 浅青色
            '#f9fbe7',  // 浅黄绿色
            '#fff8e1',  // 浅黄色
            '#efebe9',  // 浅棕色
            '#eceff1'   // 浅灰色
        ];
        return colors[signalIndex % colors.length];
    }
    
    /**
     * 处理位单元格点击事件
     * @param {number} bitIndex - 位索引
     * @param {Object} message - 报文对象
     */
    onBitCellClick(bitIndex, message) {
        // 查找该位对应的信号
        const signal = message.signals.find(s => {
            const startBit = parseInt(s.startBit) || 0;
            const endBit = startBit + (parseInt(s.length) || 1) - 1;
            return bitIndex >= startBit && bitIndex <= endBit;
        });
        
        if (signal) {
            // 高亮显示相关信号编辑区域
            this.highlightSignalEditor(message.id, signal);
        } else {
            alert(`位 ${bitIndex} 未被任何信号使用。`);
        }
    }
    
    /**
     * 高亮显示信号编辑区域
     * @param {string} messageId - 报文ID
     * @param {Object} signal - 信号对象
     */
    highlightSignalEditor(messageId, signal) {
        // 移除所有高亮
        document.querySelectorAll('.signal-item.editing').forEach(item => {
            item.classList.remove('editing');
        });
        
        // 查找对应的信号编辑元素
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const signalElements = messageElement.querySelectorAll('.signal-item');
            signalElements.forEach((element, index) => {
                const message = this.messages.find(m => m.id === messageId);
                if (message && message.signals[index] === signal) {
                    element.classList.add('editing');
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }
    
    /**
     * 更新信号颜色图例
     * @param {Object} message - 报文对象
     */
    updateMessageSignalColorLegend(message) {
        const legendContainer = document.getElementById('messageSignalColorLegend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = '';
        
        message.signals.forEach((signal, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'signal-legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'signal-color-box';
            colorBox.style.backgroundColor = this.getSignalColor(index);
            
            const label = document.createElement('span');
            label.textContent = `${signal.name} (${signal.startBit}-${parseInt(signal.startBit) + parseInt(signal.length) - 1})`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
    }
    
    /**
     * 更新报文选中状态
     * @param {string} selectedMessageId - 选中的报文ID
     */
    updateMessageSelection(selectedMessageId) {
        // 移除所有选中状态
        document.querySelectorAll('.message-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加选中状态
        const selectedElement = document.querySelector(`[data-message-id="${selectedMessageId}"]`);
        if (selectedElement) {
            selectedElement.closest('.message-item').classList.add('selected');
        }
    }
}

// 初始化编辑器
let dbcEditor;
document.addEventListener('DOMContentLoaded', () => {
    dbcEditor = new DBCEditor();
});