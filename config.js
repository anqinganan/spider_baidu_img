const config = {
    queryUrl: 'https://image.baidu.com/search/index?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1623208983399_R&pv=&ic=0&nc=1&z=9&hd=&latest=&copyright=&se=1&showtab=0&fb=0&width=0&height=0&face=0&istype=2&ie=utf-8&sid=&word=%E8%8A%92%E7%A7%8D&f=3&oq=mangzhong&rsp=1',
    imgPath: 'images/mangzhong/',
    pageTotal: 1000, //最大加载页数
    timer: 1500, // 下拉翻页间隔时间（毫秒）
    timeout:20000 //图片下载请求超时时间，网络不好或者下载大尺寸图时设置高一点（此处设置20s）
};
module.exports = config;