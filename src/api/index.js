import request from '@/utils/request';

// 用户登录
export function login(data) {
    return request({
        url: '/heart_lung/system_login',
        method: 'POST',
        data
    });
}

// 登录信息
export function system(params) {
    return request({
        url: '/heart_lung/system_login',
        method: 'get',
        params
    });
}

// 系统页面信息
export function getInfo() {
    return request({
        url: '/heart_lung/getHeartLungMonitorInfo',
        method: 'get',
        params: {
            deviceId: sessionStorage.getItem('deviceId')
        }
    });
}

// 开始测试
export function startTest() {
    return request({
        url: '/heart_lung/start_test',
        method: 'POST',
        data: {
            deviceId: sessionStorage.getItem('deviceId')
        }
    });
}

// 终止测试
export function stopTest() {
    return request({
        url: '/heart_lung/stop_test',
        method: 'POST',
        data: {
            deviceId: sessionStorage.getItem('deviceId')
        }
    });
}

// 结束测试
export function endTest() {
    return request({
        url: '/heart_lung/end_test',
        method: 'POST',
        data: {
            deviceId: sessionStorage.getItem('deviceId')
        }
    });
}