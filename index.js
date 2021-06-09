const puppeteer = require('puppeteer');
const request = require("request");
const fs = require("fs");
const urlEncode = require('urlencode');
const config = require("./config.js");

// 异步检察
fs.stat(config.imgPath, (err, stats) =>{
    if(err && err.code == 'ENOENT'){
        fs.mkdirSync(config.imgPath, {recursive: true});
    }
});

(async () => {
    const browser = await puppeteer.launch(
        {
            // headless: false,   //有浏览器界面启动
            // slowMo: 100,       //放慢浏览器执行速度，方便测试观察
            // defaultViewport: {width: 1440, height: 780},
            args: [            //启动 Chrome 的参数
                '-–no-sandbox',
                '--disable-setuid-sandbox',
                // '--window-size=1280,960',
                // '--start-fullscreen'       // 全屏打开页面
            ],
        }
    );
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 960});
    await page.goto(config.queryUrl,{timeout:5000});

    let pageNum = 0;
    while (pageNum < config.pageTotal){
        let classesItem = '.pageNum' + pageNum.toString();
        let currPage = await page.$(classesItem)

        // 翻页方法
        global.scrollTimes = 0;
        let nextPage = async function(page){
            if (global.scrollTimes > 20) {
                console.log('已加载完毕！请退出脚本！');
                await page.close();
                await browser.close();
            }
            await page.evaluate((global) => {
                window.scrollBy(0, 1000);
            });
            await page.waitForTimeout(config.timer);
            let currPage1 = await page.$(classesItem);
            if (currPage1 == null){
                global.scrollTimes += 1;
                console.log('重载 ',global.scrollTimes, ' 次');
                await nextPage(page);
            }
            global.scrollTimes = 0;
        }
        if (currPage == null) {
            await nextPage(page);
            currPage = await page.waitForSelector(classesItem);
        }
        let imgItems = await currPage.$$eval('li',lis => lis.map((li) => {
            let dataUrl = li.getAttribute('data-objurl');
            return dataUrl;
        }));
        imgItems.map((img, index) => {
            let imgUrl = img.split('src=')[1];

            if (imgUrl !== undefined) {
                imgUrl = imgUrl.split('&refer')[0];
            } else {
                imgUrl = img;
            }
            imgUrl = urlEncode.decode(imgUrl,'utf-8');
            let reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
            if(reg.test(imgUrl)){
                // 过滤中文url
                return;
            }
            let filename = pageNum * 50 + index + '.jpg';
            try{
                request(imgUrl,{timeout:config.timeout}).on('response',response=>{
                    if (response.statusCode == 200) {
                        response.pipe(fs.createWriteStream(config.imgPath + filename));
                    }

                }).on('error', err => {
                    console.log(' request fail',err);
                });
            } catch (e) {

            }
        });
        pageNum ++;
    }
    await page.close();
    await browser.close();
})();