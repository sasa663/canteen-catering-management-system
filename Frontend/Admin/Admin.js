// ========== 1. 管理员数据与核心逻辑 ==========
var ALL_PERMISSIONS = [{
    value: "数据总览",
    label: "数据总览"
}, {
    value: "用户管理",
    label: "用户管理"
}, {
    value: "商家管理",
    label: "商家管理"
}, {
    value: "订单监管",
    label: "订单监管"
}, {
    value: "管理员管理",
    label: "管理员管理"
}, {
    value: "学生管理",
    label: "学生管理"
}];

var admins = [{
    id: 1,
    account: "superadmin",
    fullName: "超级管理员",
    mobile: "13800000000",
    status: "active",
    permissions: ["数据总览", "用户管理", "商家管理", "订单监管", "管理员管理"],
    lastLogin: "2025-03-25 10:00"
}, {
    id: 2,
    account: "zhangwei",
    fullName: "张伟",
    mobile: "13812345678",
    status: "active",
    permissions: ["商家管理", "订单监管"],
    lastLogin: "2025-02-10 14:32"
}, {
    id: 3,
    account: "lina",
    fullName: "李娜",
    mobile: "13987654321",
    status: "active",
    permissions: ["学生管理"],
    lastLogin: "2025-02-09 09:15"
}, {
    id: 4,
    account: "wangqiang",
    fullName: "王强",
    mobile: "15233445566",
    status: "disabled",
    permissions: [],
    lastLogin: "2025-01-20 11:20"
}];

var currentAdminFilter = {
    keyword: "",
    status: "all"
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getPermissionDisplay(admin) {
    if (admin.account === "superadmin") return "最高权限";
    if (admin.status === "disabled") return "禁止使用";
    if (!admin.permissions || admin.permissions.length === 0) return "无权限";
    return admin.permissions.join("、");
}

function renderAdminTable() {
    var filtered = [];
    for (var i = 0; i < admins.length; i++) {
        if (admins[i].account !== "superadmin") {
            filtered.push(admins[i]);
        }
    }
    var kw = currentAdminFilter.keyword.trim().toLowerCase();
    if (kw) {
        filtered = filtered.filter(function(a) {
            return a.account.toLowerCase().indexOf(kw) !== -1 ||
                a.fullName.toLowerCase().indexOf(kw) !== -1 ||
                a.mobile.indexOf(kw) !== -1;
        });
    }
    if (currentAdminFilter.status !== "all") {
        filtered = filtered.filter(function(a) {
            return a.status === currentAdminFilter.status;
        });
    }

    var tbody = document.getElementById("adminTableBody");
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-data">暂无普通管理员数据</td></tr>';
        return;
    }
    var html = "";
    for (var i = 0; i < filtered.length; i++) {
        var admin = filtered[i];
        var statusClass = admin.status === "active" ? "status-active" : "status-disabled";
        var statusText = admin.status === "active" ? "启用" : "禁用";
        var permDisplay = getPermissionDisplay(admin);
        html += '<tr>' +
            '<td>' + admin.id + '</td>' +
            '<td><strong>' + escapeHtml(admin.account) + '</strong></td>' +
            '<td>' + escapeHtml(admin.fullName) + '</td>' +
            '<td>' + escapeHtml(admin.mobile) + '</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
            '<td class="permission-text">' + escapeHtml(permDisplay) + '</td>' +
            '<td>' + (admin.lastLogin || '—') + '</td>' +
            '<td class="action-buttons">' +
            '<button class="action-btn btn-edit" data-action="edit" data-id="' + admin.id + '"><i class="fa-regular fa-pen-to-square"></i> 编辑</button>' +
            '<button class="action-btn btn-toggle" data-action="toggle" data-id="' + admin.id + '"><i class="fa-solid ' + (admin.status === 'active' ? 'fa-ban' : 'fa-check-circle') + '"></i> ' + (admin.status === 'active' ? '禁用' : '启用') + '</button>' +
            '<button class="action-btn btn-reset" data-action="resetPwd" data-id="' + admin.id + '"><i class="fa-solid fa-key"></i> 重置密码</button>' +
            '<button class="action-btn btn-delete" data-action="delete" data-id="' + admin.id + '"><i class="fa-solid fa-trash-alt"></i> 删除</button>' +
            '</td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function renderPermissionCheckboxes(selectedValues, forceDisabled) {
    var container = document.getElementById("permissionsGroup");
    if (!container) return;
    container.innerHTML = "";
    for (var i = 0; i < ALL_PERMISSIONS.length; i++) {
        var perm = ALL_PERMISSIONS[i];
        var checked = false;
        for (var j = 0; j < selectedValues.length; j++) {
            if (selectedValues[j] === perm.value) {
                checked = true;
                break;
            }
        }
        var label = document.createElement("label");
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = perm.value;
        cb.checked = checked;
        if (forceDisabled) cb.disabled = true;
        label.appendChild(cb);
        label.appendChild(document.createTextNode(perm.label));
        container.appendChild(label);
    }
    var isDisabledGlobal = forceDisabled ? true : false;
    container.style.opacity = isDisabledGlobal ? "0.6" : "1";
    container.style.pointerEvents = isDisabledGlobal ? "none" : "auto";
}

function openAddAdminModal() {
    document.getElementById("modalTitle").innerText = "新增管理员";
    document.getElementById("editId").value = "";
    document.getElementById("account").value = "";
    document.getElementById("fullname").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("statusSelect").value = "active";
    renderPermissionCheckboxes([], false);
    document.getElementById("account").disabled = false;
    document.getElementById("account").style.background = "#fff";
    document.getElementById("statusSelect").disabled = false;
    document.getElementById("permHint").innerHTML = "禁用账号时权限自动清空并显示'禁止使用'";
    openModal('adminModal');
}

function openEditAdminModal(adminId) {
    var admin = null;
    for (var i = 0; i < admins.length; i++) {
        if (admins[i].id === adminId) {
            admin = admins[i];
            break;
        }
    }
    if (!admin) return;
    document.getElementById("modalTitle").innerText = "编辑管理员";
    document.getElementById("editId").value = admin.id;
    document.getElementById("account").value = admin.account;
    document.getElementById("fullname").value = admin.fullName;
    document.getElementById("mobile").value = admin.mobile;
    document.getElementById("statusSelect").value = admin.status;
    document.getElementById("account").disabled = true;
    document.getElementById("account").style.background = "#f1f5f9";
    if (admin.status === "disabled") {
        renderPermissionCheckboxes([], true);
    } else {
        renderPermissionCheckboxes(admin.permissions || [], false);
    }
    if (admin.account === "superadmin") {
        document.getElementById("statusSelect").disabled = true;
        renderPermissionCheckboxes(admin.permissions || [], true);
        document.getElementById("permHint").innerHTML = "<i class='fa-solid fa-shield-alt'></i> 超级管理员权限不可更改";
    } else {
        document.getElementById("statusSelect").disabled = false;
        document.getElementById("permHint").innerHTML = "禁用账号时权限自动清空并显示'禁止使用'";
    }
    openModal('adminModal');
}

function getSelectedPermissions() {
    var checkboxes = document.querySelectorAll("#permissionsGroup input[type='checkbox']");
    var selected = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) selected.push(checkboxes[i].value);
    }
    return selected;
}

function saveAdmin() {
    var id = document.getElementById("editId").value;
    var account = document.getElementById("account").value.trim();
    var fullName = document.getElementById("fullname").value.trim();
    var mobile = document.getElementById("mobile").value.trim();
    var status = document.getElementById("statusSelect").value;
    var permissions = getSelectedPermissions();

    if (!account || !fullName || !mobile) {
        alert("请完整填写账号、姓名和手机号");
        return;
    }
    if (!/^1[0-9]{10}$/.test(mobile)) {
        alert("手机号格式错误，需11位数字");
        return;
    }

    if (!id) {
        var exists = false;
        for (var i = 0; i < admins.length; i++) {
            if (admins[i].account === account) {
                exists = true;
                break;
            }
        }
        if (exists) {
            alert("账号 " + account + " 已存在");
            return;
        }
        var maxId = 0;
        for (var i = 0; i < admins.length; i++) {
            if (admins[i].id > maxId) maxId = admins[i].id;
        }
        var newId = maxId + 1;
        var newAdmin = {
            id: newId,
            account: account,
            fullName: fullName,
            mobile: mobile,
            status: status,
            permissions: status === "disabled" ? [] : permissions,
            lastLogin: "—"
        };
        admins.push(newAdmin);
        alert("新增管理员成功");
    } else {
        var idx = -1;
        for (var i = 0; i < admins.length; i++) {
            if (admins[i].id == id) {
                idx = i;
                break;
            }
        }
        if (idx !== -1 && admins[idx].account !== "superadmin") {
            admins[idx].fullName = fullName;
            admins[idx].mobile = mobile;
            admins[idx].status = status;
            admins[idx].permissions = status === "disabled" ? [] : permissions;
            alert("管理员信息已更新");
        } else if (admins[idx] && admins[idx].account === "superadmin") {
            admins[idx].fullName = fullName;
            admins[idx].mobile = mobile;
            alert("超级管理员信息已更新（仅姓名/手机号）");
        }
    }
    renderAdminTable();
    closeModal('adminModal');
}

function handleAdminAction(action, adminId) {
    var admin = null;
    for (var i = 0; i < admins.length; i++) {
        if (admins[i].id == adminId) {
            admin = admins[i];
            break;
        }
    }
    if (!admin) return;
    if (action === "toggle") {
        if (admin.account === "superadmin") {
            alert("超级管理员不能禁用/启用");
            return;
        }
        var newStatus = admin.status === "active" ? "disabled" : "active";
        if (confirm("确定" + (newStatus === "active" ? "启用" : "禁用") + "管理员 " + admin.account + " 吗？")) {
            admin.status = newStatus;
            if (newStatus === "disabled") admin.permissions = [];
            renderAdminTable();
        }
    } else if (action === "resetPwd") {
        if (confirm("确认重置管理员 " + admin.account + " 的登录密码？")) {
            alert("密码已重置为随机临时密码，并发送至手机 " + admin.mobile + "（演示模拟）");
        }
    } else if (action === "delete") {
        if (admin.account === "superadmin") {
            alert("无法删除超级管理员");
            return;
        }
        if (confirm("永久删除管理员 " + admin.account + " ？此操作不可恢复。")) {
            var newAdmins = [];
            for (var i = 0; i < admins.length; i++) {
                if (admins[i].id !== adminId) newAdmins.push(admins[i]);
            }
            admins = newAdmins;
            renderAdminTable();
            alert("删除成功");
        }
    }
}

// 事件委托
document.addEventListener("click", function(e) {
    var target = e.target.closest ? e.target.closest("[data-action]") : (function(el) {
        while (el && el.getAttribute) {
            if (el.getAttribute && el.getAttribute("data-action")) return el;
            el = el.parentNode;
        }
        return null;
    })(e.target);
    if (target) {
        var action = target.getAttribute("data-action");
        var id = parseInt(target.getAttribute("data-id"));
        if (action === "edit" && id) {
            openEditAdminModal(id);
        } else if (action === "toggle" || action === "resetPwd" || action === "delete") {
            if (id) handleAdminAction(action, id);
        }
    }
});

var adminForm = document.getElementById("adminForm");
if (adminForm) {
    adminForm.addEventListener("submit", function(e) {
        e.preventDefault();
        saveAdmin();
    });
}

var adminSearchBtn = document.getElementById("adminSearchBtn");
if (adminSearchBtn) {
    adminSearchBtn.addEventListener("click", function() {
        currentAdminFilter.keyword = document.getElementById("adminSearchInput").value;
        currentAdminFilter.status = document.getElementById("adminStatusFilter").value;
        renderAdminTable();
    });
}

var adminResetBtn = document.getElementById("adminResetBtn");
if (adminResetBtn) {
    adminResetBtn.addEventListener("click", function() {
        document.getElementById("adminSearchInput").value = "";
        document.getElementById("adminStatusFilter").value = "all";
        currentAdminFilter = {
            keyword: "",
            status: "all"
        };
        renderAdminTable();
    });
}

var statusSelect = document.getElementById("statusSelect");
if (statusSelect) {
    statusSelect.addEventListener("change", function() {
        var isDisabled = this.value === "disabled";
        var editId = document.getElementById("editId").value;
        if (editId) {
            var targetAdmin = null;
            for (var i = 0; i < admins.length; i++) {
                if (admins[i].id == editId) {
                    targetAdmin = admins[i];
                    break;
                }
            }
            if (targetAdmin && targetAdmin.account === "superadmin") return;
        }
        if (isDisabled) {
            renderPermissionCheckboxes([], true);
        } else {
            renderPermissionCheckboxes(getSelectedPermissions(), false);
        }
    });
}

// ========== 2. 授权码完整功能 ==========
var merchantAuthRecords = [];
var adminAuthRecords = [];

// 修改授权码生成为固定8位（大写字母+数字）
function generateRandomAuthCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for (var i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatDateTime(date) {
    return date.toLocaleString('zh-CN');
}

function renderMerchantAuthTable() {
    var tbody = document.getElementById('merchantAuthTableBody');
    if (!tbody) return;
    if (merchantAuthRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-data">暂无商家授权码数据</td></tr>';
        return;
    }
    var html = "";
    for (var i = 0; i < merchantAuthRecords.length; i++) {
        var record = merchantAuthRecords[i];
        var isExpired = new Date(record.expireTime) < new Date();
        var statusClass = isExpired ? 'tag-expired' : 'tag-normal';
        var statusText = isExpired ? '已过期' : '有效';
        html += '<tr>' +
            '<td>' + escapeHtml(record.merchantId) + '</td>' +
            '<td>' + escapeHtml(record.merchantCode) + '</td>' +
            '<td>' + escapeHtml(record.merchantName) + '</td>' +
            '<td>' + escapeHtml(record.code) + '</td>' +
            '<td><span class="tag ' + statusClass + '">' + statusText + '</span></td>' +
            '<td>' + escapeHtml(formatDateTime(new Date(record.expireTime))) + '</td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="deleteMerchantAuth(\'' + record.id + '\')">作废</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function renderAdminAuthTable() {
    var tbody = document.getElementById('adminAuthTableBody');
    if (!tbody) return;
    if (adminAuthRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-data">暂无管理员注册码数据</td></tr>';
        return;
    }
    var html = "";
    for (var i = 0; i < adminAuthRecords.length; i++) {
        var record = adminAuthRecords[i];
        var isExpired = new Date(record.expireTime) < new Date();
        var statusClass = isExpired ? 'tag-expired' : 'tag-normal';
        var statusText = isExpired ? '已过期' : '有效';
        html += '<tr>' +
            '<td>' + escapeHtml(record.adminId) + '</td>' +
            '<td>' + escapeHtml(record.adminAccount) + '</td>' +
            '<td>' + escapeHtml(record.adminName) + '</td>' +
            '<td>' + escapeHtml(record.regCode) + '</td>' +
            '<td><span class="tag ' + statusClass + '">' + statusText + '</span></td>' +
            '<td>' + escapeHtml(formatDateTime(new Date(record.expireTime))) + '</td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="deleteAdminAuth(\'' + record.id + '\')">作废</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function deleteMerchantAuth(id) {
    var newRecords = [];
    for (var i = 0; i < merchantAuthRecords.length; i++) {
        if (merchantAuthRecords[i].id !== id) newRecords.push(merchantAuthRecords[i]);
    }
    merchantAuthRecords = newRecords;
    renderMerchantAuthTable();
    renderAuthRecordTable();
}

function deleteAdminAuth(id) {
    var newRecords = [];
    for (var i = 0; i < adminAuthRecords.length; i++) {
        if (adminAuthRecords[i].id !== id) newRecords.push(adminAuthRecords[i]);
    }
    adminAuthRecords = newRecords;
    renderAdminAuthTable();
    renderAuthRecordTable();
}

function renderAuthRecordTable() {
    var typeSelect = document.getElementById('authRecordType');
    var typeFilter = typeSelect ? typeSelect.value : 'all';
    var searchInput = document.getElementById('authRecordSearchInput');
    var keyword = searchInput ? (searchInput.value || '').toLowerCase() : '';

    var allRecords = [];
    for (var i = 0; i < merchantAuthRecords.length; i++) {
        var r = merchantAuthRecords[i];
        allRecords.push({
            type: 'merchant',
            typeName: '商家授权码',
            subject: r.merchantName + ' (编号:' + r.merchantId + ')',
            code: r.code,
            generateTime: r.generateTime,
            expireTime: r.expireTime,
            status: new Date(r.expireTime) < new Date() ? '已过期' : '有效'
        });
    }
    for (var i = 0; i < adminAuthRecords.length; i++) {
        var r = adminAuthRecords[i];
        allRecords.push({
            type: 'admin',
            typeName: '管理员注册码',
            subject: r.adminName + ' (账号:' + r.adminAccount + ')',
            code: r.regCode,
            generateTime: r.generateTime,
            expireTime: r.expireTime,
            status: new Date(r.expireTime) < new Date() ? '已过期' : '有效'
        });
    }
    if (typeFilter !== 'all') {
        var filtered = [];
        for (var i = 0; i < allRecords.length; i++) {
            if (allRecords[i].type === typeFilter) filtered.push(allRecords[i]);
        }
        allRecords = filtered;
    }
    if (keyword) {
        var filtered = [];
        for (var i = 0; i < allRecords.length; i++) {
            if (allRecords[i].subject.toLowerCase().indexOf(keyword) !== -1 ||
                allRecords[i].code.toLowerCase().indexOf(keyword) !== -1) {
                filtered.push(allRecords[i]);
            }
        }
        allRecords = filtered;
    }

    var tbody = document.getElementById('authRecordTableBody');
    if (!tbody) return;
    if (allRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-data">暂无授权记录</td></tr>';
        return;
    }
    var html = "";
    for (var i = 0; i < allRecords.length; i++) {
        var rec = allRecords[i];
        html += '<tr>' +
            '<td>' + rec.typeName + '</td>' +
            '<td>' + escapeHtml(rec.subject) + '</td>' +
            '<td>' + escapeHtml(rec.code) + '</td>' +
            '<td>' + escapeHtml(formatDateTime(new Date(rec.generateTime))) + '</td>' +
            '<td>' + escapeHtml(formatDateTime(new Date(rec.expireTime))) + '</td>' +
            '<td><span class="tag ' + (rec.status === '有效' ? 'tag-normal' : 'tag-expired') + '">' + rec.status + '</span></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function generateMerchantAuthCode() {
    var merchantId = document.getElementById('newMerchantId').value.trim();
    var merchantCode = document.getElementById('newMerchantCode').value.trim();
    var merchantName = document.getElementById('newMerchantName').value.trim();
    var expireDays = parseInt(document.getElementById('merchantAuthExpireDays').value) || 30;
    if (!merchantId || !merchantCode || !merchantName) {
        alert('请填写完整的商家信息');
        return;
    }
    if (!/^\d{6}$/.test(merchantCode)) {
        alert('商家编码必须为6位数字');
        return;
    }
    var authCode = generateRandomAuthCode();
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expireDays);
    var recordId = Date.now() + '-' + Math.random();
    merchantAuthRecords.push({
        id: recordId,
        code: authCode,
        merchantName: merchantName,
        merchantId: merchantId,
        merchantCode: merchantCode,
        expireTime: expireDate.toISOString(),
        generateTime: new Date().toISOString()
    });
    renderMerchantAuthTable();
    renderAuthRecordTable();
    var container = document.getElementById('merchantAuthCodeContainer');
    document.getElementById('merchantAuthCodeMerchant').innerHTML = '商家：' + merchantName + '（' + merchantCode + '）';
    document.getElementById('merchantAuthCodeText').innerText = authCode;
    document.getElementById('merchantAuthCodeExpire').innerHTML = '过期时间：' + formatDateTime(expireDate) + '（' + expireDays + '天）';
    container.style.display = 'flex';
    document.getElementById('newMerchantId').value = '';
    document.getElementById('newMerchantCode').value = '';
    document.getElementById('newMerchantName').value = '';
    document.getElementById('merchantAuthExpireDays').value = 30;
}

function generateAdminAuthCode() {
    var adminId = document.getElementById('newAdminId').value.trim();
    var adminAccount = document.getElementById('newAdminAccount').value.trim();
    var adminName = document.getElementById('newAdminName').value.trim();
    var adminPhone = document.getElementById('newAdminPhone').value.trim();
    var expireDays = parseInt(document.getElementById('adminAuthExpireDays').value) || 7;
    if (!adminId || !adminAccount || !adminName || !adminPhone) {
        alert('请填写完整的管理员信息');
        return;
    }
    if (!/^1[3-9]\d{9}$/.test(adminPhone)) {
        alert('手机号格式不正确');
        return;
    }
    var regCode = generateRandomAuthCode();
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expireDays);
    var recordId = Date.now() + '-' + Math.random();
    adminAuthRecords.push({
        id: recordId,
        regCode: regCode,
        adminName: adminName,
        adminAccount: adminAccount,
        adminId: adminId,
        adminPhone: adminPhone,
        expireTime: expireDate.toISOString(),
        generateTime: new Date().toISOString()
    });
    renderAdminAuthTable();
    renderAuthRecordTable();
    var container = document.getElementById('adminAuthCodeContainer');
    document.getElementById('adminAuthCodeAdmin').innerHTML = '管理员：' + adminName + '（' + adminAccount + '）';
    document.getElementById('adminAuthCodeText').innerText = regCode;
    document.getElementById('adminAuthCodeExpire').innerHTML = '过期时间：' + formatDateTime(expireDate) + '（' + expireDays + '天）';
    container.style.display = 'flex';
    document.getElementById('newAdminId').value = '';
    document.getElementById('newAdminAccount').value = '';
    document.getElementById('newAdminName').value = '';
    document.getElementById('newAdminPhone').value = '';
    document.getElementById('adminAuthExpireDays').value = 7;
}

function copyAuthCode(elementId) {
    var text = document.getElementById(elementId).innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            alert('复制成功');
        }).catch(function() {
            alert('复制失败');
        });
    } else {
        alert('您的浏览器不支持自动复制，请手动复制');
    }
}

// ========== 3. 基础系统函数 ==========
function toggleMenu(id) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('active');
}

function switchPage(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    var target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    if (pageId === 'adminAdd') {
        setTimeout(function() {
            switchPage('adminList');
            openAddAdminModal();
        }, 100);
        return;
    }
    var titleSpan = target ? target.querySelector('.card-title span') : null;
    document.getElementById('pageTitle').innerText = titleSpan ? titleSpan.innerText : pageId;
}

function switchAuthTab(event, tabId) {
    var contents = document.querySelectorAll('.auth-content');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    var tabs = document.querySelectorAll('.auth-tab-item');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    if (event && event.target) event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function saveProfile() {
    alert('个人信息保存成功');
}

function logout() {
    if (confirm('确定退出？')) alert('已退出');
}

function openEditMerchantModal() {
    openModal('editMerchantModal');
}

function saveMerchant() {
    alert('商家保存成功');
    closeModal('editMerchantModal');
}

function saveStudent() {
    alert('学生保存成功');
    closeModal('addStudentModal');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderAdminTable();
    renderMerchantAuthTable();
    renderAdminAuthTable();
    renderAuthRecordTable();

    var searchBtn = document.getElementById('searchAuthRecordBtn');
    if (searchBtn) searchBtn.addEventListener('click', function() {
        renderAuthRecordTable();
    });
    var typeSelect = document.getElementById('authRecordType');
    if (typeSelect) typeSelect.addEventListener('change', function() {
        renderAuthRecordTable();
    });
    var searchInput = document.getElementById('authRecordSearchInput');
    if (searchInput) searchInput.addEventListener('input', function() {
        renderAuthRecordTable();
    });
});