// 全局状态
var isAuthorized = localStorage.getItem('merchantIsAuthorized') === 'true';
var adminAuthCode = localStorage.getItem('merchantAuthCode') || '12345678';
var authCodeExpire = localStorage.getItem('authCodeExpire') || (Date.now() + 86400000);
var goodsList = JSON.parse(localStorage.getItem('goodsList')) || [];
var pendingOrderList = JSON.parse(localStorage.getItem('pendingOrderList')) || [];
var finishedOrderList = JSON.parse(localStorage.getItem('finishedOrderList')) || [];
var canceledOrderList = JSON.parse(localStorage.getItem('canceledOrderList')) || [];

// 新增数据结构
var merchantProfile = JSON.parse(localStorage.getItem('merchantProfile')) || {
    shopName: '我的食堂店铺',
    contactName: '张经理',
    phone: '13800000000',
    email: 'shop@example.com',
    address: 'XX市XX区XX路XX号',
    businessHours: '10:00-20:00'
};
var qualificationData = JSON.parse(localStorage.getItem('qualificationData')) || {
    status: 'pending',
    licenseUrl: '',
    foodLicenseUrl: '',
    submitTime: null,
    remark: ''
};
var passwordHash = localStorage.getItem('merchantPasswordHash') || btoa('123456');
var reviewsList = JSON.parse(localStorage.getItem('reviewsList')) || [{
    id: 'r1',
    userName: '王同学',
    rating: 5,
    content: '红烧肉太香了！',
    reply: '',
    createTime: '2025-03-30'
}];
var complaintsList = JSON.parse(localStorage.getItem('complaintsList')) || [{
    id: 'c1',
    userName: '李老师',
    content: '送餐速度有点慢',
    status: 'pending',
    reply: '',
    createTime: '2025-03-29'
}];

// 初始化模拟数据
function initMockData() {
    if (goodsList.length === 0) {
        goodsList = [{
            id: 1001,
            name: '红烧肉',
            type: 'hot',
            price: '28.00',
            stock: 50,
            sales: 28,
            status: 'on',
            desc: '经典美味'
        }, {
            id: 1002,
            name: '酸辣土豆丝',
            type: 'hot',
            price: '12.00',
            stock: 30,
            sales: 42,
            status: 'on',
            desc: '爽口开胃'
        }];
        localStorage.setItem('goodsList', JSON.stringify(goodsList));
    }
    if (finishedOrderList.length === 0) {
        finishedOrderList = [{
            orderId: 'OD123456',
            createTime: '2025-03-28 12:05',
            goodsName: '红烧肉',
            goodsNum: 2,
            totalAmount: '56.00',
            finishTime: '2025-03-28 12:25'
        }];
        localStorage.setItem('finishedOrderList', JSON.stringify(finishedOrderList));
    }
    if (reviewsList.length === 0) {
        reviewsList = [{
            id: 'r1',
            userName: '王同学',
            rating: 5,
            content: '红烧肉太香了！',
            reply: '',
            createTime: '2025-03-30'
        }];
        localStorage.setItem('reviewsList', JSON.stringify(reviewsList));
    }
    if (complaintsList.length === 0) {
        complaintsList = [{
            id: 'c1',
            userName: '李老师',
            content: '送餐速度有点慢',
            status: 'pending',
            reply: '',
            createTime: '2025-03-29'
        }];
        localStorage.setItem('complaintsList', JSON.stringify(complaintsList));
    }
}

// 页面加载
window.onload = function() {
    initMockData();
    if (!localStorage.getItem('merchantAuthCode')) {
        localStorage.setItem('merchantAuthCode', adminAuthCode);
        localStorage.setItem('authCodeExpire', authCodeExpire);
    }
    if (!isAuthorized) {
        document.getElementById('authModal').style.display = 'flex';
    } else {
        closeAuthModal();
        loadAllData();
        toggleMenu('dataMenu');
    }
};

function loadAllData() {
    loadShopInfo();
    renderGoodsList();
    renderPendingOrder();
    renderFinishedOrder();
    renderCanceledOrder();
    renderDashboard();
    renderOrderStats();
    renderMerchantInfo();
    renderQualification();
    renderReviewList();
    renderComplaintList();
}

// 授权相关
function verifyAuthCode() {
    var inputCode = document.getElementById('authCodeInput').value.trim();
    if (!inputCode) {
        alert('请输入授权码');
        return;
    }
    if (Date.now() > authCodeExpire) {
        alert('授权码已过期，请联系管理员重新生成');
        return;
    }
    if (inputCode === adminAuthCode) {
        localStorage.setItem('merchantIsAuthorized', 'true');
        isAuthorized = true;
        closeAuthModal();
        loadAllData();
        toggleMenu('dataMenu');
        alert('授权验证成功！');
    } else {
        alert('授权码错误，请重新输入（测试码：12345678）');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function logout() {
    if (confirm('确定退出登录吗？')) {
        localStorage.removeItem('merchantIsAuthorized');
        localStorage.removeItem('merchantShopName');
        window.location.reload();
    }
}

// 店铺设置
function loadShopInfo() {
    var shopName = localStorage.getItem('merchantShopName') || merchantProfile.shopName;
    document.getElementById('shopName').textContent = shopName;
    document.getElementById('shopNameInput').value = shopName;
    var businessStatus = localStorage.getItem('businessStatus') || 'open';
    var startTime = localStorage.getItem('startTime') || '10:00';
    var endTime = localStorage.getItem('endTime') || '20:00';
    var shopAddress = localStorage.getItem('shopAddress') || merchantProfile.address;
    document.getElementById('businessStatus').value = businessStatus;
    document.getElementById('startTime').value = startTime;
    document.getElementById('endTime').value = endTime;
    document.getElementById('shopAddress').value = shopAddress;
}

function saveShopSetting() {
    var shopName = document.getElementById('shopNameInput').value.trim();
    if (!shopName) {
        alert('请输入店铺名称');
        return;
    }
    localStorage.setItem('merchantShopName', shopName);
    localStorage.setItem('businessStatus', document.getElementById('businessStatus').value);
    localStorage.setItem('startTime', document.getElementById('startTime').value);
    localStorage.setItem('endTime', document.getElementById('endTime').value);
    localStorage.setItem('shopAddress', document.getElementById('shopAddress').value);
    document.getElementById('shopName').textContent = shopName;
    alert('店铺设置保存成功！');
}

// 菜单控制
function toggleMenu(menuId) {
    var subMenu = document.getElementById(menuId);
    if (subMenu) subMenu.classList.toggle('active');
    var arrow = subMenu ? subMenu.previousElementSibling.querySelector('.fa-chevron-down') : null;
    if (arrow) arrow.style.transform = subMenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
}

function switchPage(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');
    document.getElementById(pageId).classList.add('active');
    var titleMap = {
        dashboard: '营业数据',
        orderStats: '订单统计',
        goodsList: '菜品列表',
        addGoods: '新增菜品',
        pendingOrder: '待处理订单',
        finishedOrder: '已完成订单',
        canceledOrder: '已取消订单',
        shopSetting: '店铺设置',
        merchantInfo: '商家信息',
        qualification: '资质审核',
        accountSecurity: '账号权限',
        reviewList: '用户评价',
        complaintList: '投诉处理'
    };
    document.getElementById('pageTitle').textContent = titleMap[pageId] || '管理';
    if (pageId === 'dashboard') renderDashboard();
    if (pageId === 'orderStats') renderOrderStats();
    if (pageId === 'goodsList') renderGoodsList();
    if (pageId === 'pendingOrder') renderPendingOrder();
    if (pageId === 'finishedOrder') renderFinishedOrder();
    if (pageId === 'canceledOrder') renderCanceledOrder();
    if (pageId === 'reviewList') renderReviewList();
    if (pageId === 'complaintList') renderComplaintList();
    var items = document.querySelectorAll('.sub-item');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
    var target = document.querySelector('[onclick="switchPage(\'' + pageId + '\')"]');
    if (target) target.classList.add('active');
}

// 营业数据渲染
function renderDashboard() {
    var today = new Date().toLocaleDateString();
    var todayOrders = [];
    for (var i = 0; i < finishedOrderList.length; i++) {
        var o = finishedOrderList[i];
        if (o.finishTime && o.finishTime.indexOf(today) !== -1) todayOrders.push(o);
    }
    var todayRevenue = 0;
    for (var j = 0; j < todayOrders.length; j++) todayRevenue += parseFloat(todayOrders[j].totalAmount);
    var pendingCount = pendingOrderList.length;
    document.querySelector('#dashboard .stats-total h3').innerHTML = '¥' + todayRevenue.toFixed(2);
    document.querySelector('#dashboard .stats-success h3').innerHTML = todayOrders.length;
    document.querySelector('#dashboard .stats-warning h3').innerHTML = pendingCount;

    var sorted = goodsList.slice().sort(function(a, b) {
        return b.sales - a.sales;
    });
    var top5 = sorted.slice(0, 5);
    var tbody = document.getElementById('topGoodsBody');
    if (top5.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-data">暂无销售数据</td></tr>';
    } else {
        var html = '';
        for (var k = 0; k < top5.length; k++) {
            var g = top5[k];
            html += '<tr><td>' + (k + 1) + '</td><td>' + g.name + '</td><td>' + g.sales + '</td><td>¥' + (g.sales * parseFloat(g.price)).toFixed(2) + '</td></tr>';
        }
        tbody.innerHTML = html;
    }
}

function renderOrderStats() {
    var stats = {};
    for (var i = 0; i < finishedOrderList.length; i++) {
        var o = finishedOrderList[i];
        var date = o.finishTime ? o.finishTime.split(' ')[0] : '未知';
        if (!stats[date]) stats[date] = { count: 0, revenue: 0 };
        stats[date].count += 1;
        stats[date].revenue += parseFloat(o.totalAmount);
    }
    var tbody = document.getElementById('orderStatsBody');
    var rows = '';
    for (var d in stats) {
        var avg = stats[d].count ? (stats[d].revenue / stats[d].count).toFixed(2) : 0;
        rows += '<tr><td>' + d + '</td><td>' + stats[d].count + '</td><td>¥' + stats[d].revenue.toFixed(2) + '</td><td>¥' + avg + '</td></tr>';
    }
    if (rows === '') rows = '<tr><td colspan="4" class="empty-data">暂无统计数据</td></tr>';
    tbody.innerHTML = rows;
}

// 菜品管理
function saveGoods() {
    var name = document.getElementById('goodsName').value.trim();
    var type = document.getElementById('goodsType').value;
    var price = document.getElementById('goodsPrice').value;
    var stock = document.getElementById('goodsStock').value;
    var desc = document.getElementById('goodsDesc').value.trim();
    if (!name) { alert('请输入菜品名称'); return; }
    if (!type) { alert('请选择菜品分类'); return; }
    if (!price || price < 0) { alert('请输入正确的菜品价格'); return; }
    if (stock < 0) { alert('库存数量不能为负数'); return; }
    var goods = {
        id: Date.now(),
        name: name,
        type: type,
        price: parseFloat(price).toFixed(2),
        stock: parseInt(stock),
        sales: 0,
        status: 'on',
        desc: desc
    };
    goodsList.unshift(goods);
    localStorage.setItem('goodsList', JSON.stringify(goodsList));
    alert('菜品添加成功！');
    switchPage('goodsList');
    renderGoodsList();
}

function renderGoodsList() {
    var tbody = document.getElementById('goodsTableBody');
    if (goodsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-data">暂无菜品数据</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < goodsList.length; i++) {
        var item = goodsList[i];
        var typeMap = { hot: '热菜', cold: '凉菜', soup: '汤品', rice: '主食' };
        var statusMap = { on: '上架中', off: '已下架' };
        var stockStyle = item.stock <= 5 ? 'style="color:red;font-weight:bold;"' : '';
        html += '<tr>' +
            '<td>' + item.name + '</td>' +
            '<td>' + (typeMap[item.type] || '其他') + '</td>' +
            '<td>¥' + item.price + '</td>' +
            '<td ' + stockStyle + '>' + item.stock + '</td>' +
            '<td>' + item.sales + '</td>' +
            '<td>' + statusMap[item.status] + '</td>' +
            '<td><button class="btn btn-warning" onclick="editGoods(' + item.id + ')">编辑</button> <button class="btn btn-danger" onclick="deleteGoods(' + item.id + ')">删除</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function deleteGoods(id) {
    if (!confirm('确定删除该菜品吗？')) return;
    goodsList = goodsList.filter(function(item) { return item.id !== id; });
    localStorage.setItem('goodsList', JSON.stringify(goodsList));
    renderGoodsList();
}

function editGoods(id) {
    alert('编辑功能可扩展，暂未开放。');
}

// 订单处理
function createTestOrder() {
    if (goodsList.length === 0) {
        alert('请先添加菜品再进行模拟下单！');
        switchPage('addGoods');
        return;
    }
    var randomGoods = goodsList[Math.floor(Math.random() * goodsList.length)];
    var buyNum = Math.floor(Math.random() * 3) + 1;
    if (randomGoods.stock < buyNum) {
        alert('【' + randomGoods.name + '】库存不足（当前：' + randomGoods.stock + '），无法下单！');
        return;
    }
    var order = {
        orderId: 'OD' + Date.now().toString().slice(-8),
        createTime: new Date().toLocaleString(),
        goodsName: randomGoods.name,
        goodsNum: buyNum,
        goodsPrice: randomGoods.price,
        totalAmount: (buyNum * parseFloat(randomGoods.price)).toFixed(2),
        payStatus: '已支付'
    };
    pendingOrderList.unshift(order);
    localStorage.setItem('pendingOrderList', JSON.stringify(pendingOrderList));
    renderPendingOrder();
    alert('模拟下单成功！\n订单：' + randomGoods.name + '×' + buyNum + '\n总金额：¥' + order.totalAmount);
}

function confirmOrder(orderId) {
    var orderIndex = -1;
    for (var i = 0; i < pendingOrderList.length; i++) {
        if (pendingOrderList[i].orderId === orderId) { orderIndex = i; break; }
    }
    if (orderIndex === -1) return;
    var order = pendingOrderList[orderIndex];
    var goodsIndex = -1;
    for (var j = 0; j < goodsList.length; j++) {
        if (goodsList[j].name === order.goodsName) { goodsIndex = j; break; }
    }
    if (goodsIndex === -1) { alert('菜品不存在，无法确认出餐！'); return; }
    var goods = goodsList[goodsIndex];
    if (goods.stock < order.goodsNum) { alert('【' + goods.name + '】库存不足（当前：' + goods.stock + '），无法出餐！'); return; }
    goods.stock -= order.goodsNum;
    goods.sales += order.goodsNum;
    goodsList[goodsIndex] = goods;
    localStorage.setItem('goodsList', JSON.stringify(goodsList));
    order.finishTime = new Date().toLocaleString();
    finishedOrderList.unshift(order);
    pendingOrderList.splice(orderIndex, 1);
    localStorage.setItem('pendingOrderList', JSON.stringify(pendingOrderList));
    localStorage.setItem('finishedOrderList', JSON.stringify(finishedOrderList));
    renderPendingOrder();
    renderFinishedOrder();
    renderGoodsList();
    alert('确认出餐成功！已自动扣减菜品库存并增加销量');
}

function cancelOrder(orderId) {
    if (!confirm('确定取消该订单吗？')) return;
    var orderIndex = -1;
    for (var i = 0; i < pendingOrderList.length; i++) {
        if (pendingOrderList[i].orderId === orderId) { orderIndex = i; break; }
    }
    if (orderIndex === -1) return;
    var order = pendingOrderList[orderIndex];
    order.cancelReason = '商家取消';
    canceledOrderList.unshift(order);
    pendingOrderList.splice(orderIndex, 1);
    localStorage.setItem('pendingOrderList', JSON.stringify(pendingOrderList));
    localStorage.setItem('canceledOrderList', JSON.stringify(canceledOrderList));
    renderPendingOrder();
    renderCanceledOrder();
    alert('订单取消成功！');
}

function renderPendingOrder() {
    var tbody = document.getElementById('pendingOrderTableBody');
    if (pendingOrderList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-data">暂无待处理订单</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < pendingOrderList.length; i++) {
        var o = pendingOrderList[i];
        html += '<tr><td>' + o.orderId + '</td><td>' + o.createTime + '</td><td>' + o.goodsName + '</td><td>' + o.goodsNum + '</td><td>¥' + o.totalAmount + '</td><td>' + o.payStatus + '</td>' +
            '<td><button class="btn btn-success" onclick="confirmOrder(\'' + o.orderId + '\')">确认出餐</button> <button class="btn btn-danger" onclick="cancelOrder(\'' + o.orderId + '\')">取消订单</button></td></tr>';
    }
    tbody.innerHTML = html;
}

function renderFinishedOrder() {
    var tbody = document.getElementById('finishedOrderTableBody');
    if (finishedOrderList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-data">暂无已完成订单</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < finishedOrderList.length; i++) {
        var o = finishedOrderList[i];
        html += '<tr><td>' + o.orderId + '</td><td>' + o.createTime + '</td><td>' + o.goodsName + '</td><td>' + o.goodsNum + '</td><td>¥' + o.totalAmount + '</td><td>' + (o.finishTime || '已完成') + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function renderCanceledOrder() {
    var tbody = document.getElementById('canceledOrderTableBody');
    if (canceledOrderList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-data">暂无已取消订单</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < canceledOrderList.length; i++) {
        var o = canceledOrderList[i];
        html += '<tr><td>' + o.orderId + '</td><td>' + o.createTime + '</td><td>' + o.goodsName + '</td><td>' + o.goodsNum + '</td><td>¥' + o.totalAmount + '</td><td>' + (o.cancelReason || '用户取消') + '</td></tr>';
    }
    tbody.innerHTML = html;
}

// 商家信息
function renderMerchantInfo() {
    document.getElementById('merchantShopName').value = merchantProfile.shopName;
    document.getElementById('merchantContact').value = merchantProfile.contactName;
    document.getElementById('merchantPhone').value = merchantProfile.phone;
    document.getElementById('merchantEmail').value = merchantProfile.email;
    document.getElementById('merchantAddress').value = merchantProfile.address;
    document.getElementById('merchantHours').value = merchantProfile.businessHours;
}

function saveMerchantInfo() {
    merchantProfile.shopName = document.getElementById('merchantShopName').value.trim();
    merchantProfile.contactName = document.getElementById('merchantContact').value.trim();
    merchantProfile.phone = document.getElementById('merchantPhone').value.trim();
    merchantProfile.email = document.getElementById('merchantEmail').value.trim();
    merchantProfile.address = document.getElementById('merchantAddress').value.trim();
    merchantProfile.businessHours = document.getElementById('merchantHours').value.trim();
    localStorage.setItem('merchantProfile', JSON.stringify(merchantProfile));
    document.getElementById('shopName').textContent = merchantProfile.shopName;
    alert('商家信息保存成功！');
}

// 资质审核
function renderQualification() {
    var statusText = { pending: '待审核', approved: '已通过', rejected: '未通过' };
    document.getElementById('qualificationStatus').innerHTML = statusText[qualificationData.status] || '未提交';
    document.getElementById('licenseUrl').value = qualificationData.licenseUrl || '';
    document.getElementById('foodLicenseUrl').value = qualificationData.foodLicenseUrl || '';
}

function submitQualification() {
    qualificationData.licenseUrl = document.getElementById('licenseUrl').value;
    qualificationData.foodLicenseUrl = document.getElementById('foodLicenseUrl').value;
    qualificationData.status = 'pending';
    qualificationData.submitTime = new Date().toISOString();
    localStorage.setItem('qualificationData', JSON.stringify(qualificationData));
    alert('资质已提交，等待管理端审核。');
    renderQualification();
}

// 账号权限
function changePassword() {
    var oldPwd = document.getElementById('oldPassword').value;
    var newPwd = document.getElementById('newPassword').value;
    if (btoa(oldPwd) !== passwordHash) { alert('原密码错误'); return; }
    if (!newPwd) { alert('请输入新密码'); return; }
    passwordHash = btoa(newPwd);
    localStorage.setItem('merchantPasswordHash', passwordHash);
    alert('密码修改成功！请牢记新密码。');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
}

// 评价管理
function renderReviewList() {
    var tbody = document.getElementById('reviewTableBody');
    if (reviewsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-data">暂无评价</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < reviewsList.length; i++) {
        var r = reviewsList[i];
        var stars = '';
        for (var s = 0; s < r.rating; s++) stars += '★';
        for (var t = 0; t < (5 - r.rating); t++) stars += '☆';
        html += '<tr>' +
            '<td>' + r.userName + '</td>' +
            '<td>' + stars + '</td>' +
            '<td>' + r.content + '</td>' +
            '<td><textarea id="reply_' + r.id + '" rows="1" style="width:180px;">' + (r.reply || '') + '</textarea></td>' +
            '<td><button class="btn btn-primary" onclick="replyReview(\'' + r.id + '\')">回复</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function replyReview(id) {
    var replyText = document.getElementById('reply_' + id).value;
    for (var i = 0; i < reviewsList.length; i++) {
        if (reviewsList[i].id === id) { reviewsList[i].reply = replyText; break; }
    }
    localStorage.setItem('reviewsList', JSON.stringify(reviewsList));
    renderReviewList();
    alert('回复已保存');
}

// 投诉管理
function renderComplaintList() {
    var tbody = document.getElementById('complaintTableBody');
    if (complaintsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-data">暂无投诉</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < complaintsList.length; i++) {
        var c = complaintsList[i];
        html += '<tr>' +
            '<td>' + c.userName + '</td>' +
            '<td>' + c.content + '</td>' +
            '<td>' + (c.status === 'pending' ? '待处理' : '已回复') + '</td>' +
            '<td><textarea id="compReply_' + c.id + '" rows="1" style="width:180px;">' + (c.reply || '') + '</textarea></td>' +
            '<td><button class="btn btn-success" onclick="resolveComplaint(\'' + c.id + '\')">回复处理</button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function resolveComplaint(id) {
    var replyText = document.getElementById('compReply_' + id).value;
    for (var i = 0; i < complaintsList.length; i++) {
        if (complaintsList[i].id === id) {
            complaintsList[i].reply = replyText;
            complaintsList[i].status = 'resolved';
            break;
        }
    }
    localStorage.setItem('complaintsList', JSON.stringify(complaintsList));
    renderComplaintList();
    alert('投诉已回复');
}