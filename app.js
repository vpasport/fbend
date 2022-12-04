import mongoose from 'mongoose';
import pug from 'pug';
import puppeteer from 'puppeteer';

const appSrc = (express, bodyParser, createReadStream, crypto, http) => {
    const app = express();

    const model = mongoose.model('user', { login: String, password: String }, 'users');

    const login = 'itmo335225';

    app.use((req, res, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,PATCH,OPTIONS,DELETE'
        );
        res.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Accept, Access-Control-Allow-Headers'
        );
        next();
    });


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get('/login/', (_, res) => {
        res.send(login);
    });
    app.get('/code/', (req, res) => {
        createReadStream(import.meta.url.substring(7)).pipe(res);
    });
    app.get('/sha1/:input/', ({ params: { input } }, res) => {
        res.send(crypto.createHash('sha1').update(input).digest('hex'));
    });
    app.get('/req/', ({ query: { addr } }, res) => {
        http.get(addr, (result) => {
            let data = [];
            result.on('data', chunk => data.push(chunk));
            result.on('end', () => res.send(Buffer.concat(data).toString()));
            result.on('error', err => res.send(err.message));
        });
    });
    app.post('/req/', ({ query: { addr: addrQuery }, body: { addr } }, res) => {
        http.get(addr || addrQuery, (result) => {
            let data = [];
            result.on('data', chunk => data.push(chunk));
            result.on('end', () => res.send(Buffer.concat(data).toString()));
            result.on('error', err => res.send(err.message));
        });
    });
    app.post('/insert/', ({ body: { login, password, URL } }, res) => {
        mongoose.connect(URL).then(() => {
            const user = new model({ login, password });

            user.save().then(_ => res.setndStatus(201));
        });
    });
    app.all('/wordpress/*', (req, res) => {
        fetch(`http://localhost:8080/${req.originalUrl.replace('/wordpress/', '')}`)
            .then(res => res.text())
            .then(result => {
                res.send(result);
            });
    });
    app.post('/render/', ({ body: { random2, random3 }, query: { addr } }, res) => {
        fetch(addr).then(res => res.text()).then(pugTmp => {
            res.send(pug.compile(pugTmp)({ random2, random3, login }));
        });
    });
    app.get('/test/', async ({ query: { URL: testURL } }, res) => {
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
        const page = await browser.newPage();

        await page.goto(testURL);
        const btSelector = '#bt';
        await page.waitForSelector(btSelector);
        await page.click(btSelector);

        const inpSelector = '#inp';
        await page.waitForSelector(inpSelector);
        const value = await page.$eval(inpSelector, (input) => input.value);

        await browser.close();

        res.set('Content-Type', 'text/plain');
        res.send(value);
    });
    app.all(/./, (_, res) => {
        res.send(login);
    });

    return app;
};

export default appSrc;