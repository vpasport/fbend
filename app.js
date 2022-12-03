export const appSrc = (express, bodyParser, createReadStream, crypto, http) => {
    const app = express();

    app.use((req, res, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,PATCH,OPTIONS,DELETE'
        );
        next();
    });


    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/login/', (_, res) => {
        res.send('itmo335225');
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
    app.all(/./, (_, res) => {
        res.send('itmo335225');
    });

    return app;
};