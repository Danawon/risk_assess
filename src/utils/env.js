/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * imgBaseUrl: 图片所在域名地址
 *
 */
let baseUrl = 'https://devsaas.hansifit.com/api/';

if (process.env.NODE_ENV == 'development') {
    baseUrl = 'https://devsaas.hansifit.com/api/';
} else if (process.env.NODE_ENV == 'production') {
    baseUrl = 'https://devsaas.hansifit.com/api/';
}
export {
    baseUrl,
};
