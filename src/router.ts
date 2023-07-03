import { Router } from 'express';
import { version } from '../package.json';
import { join } from 'path';
// Apis
import vodInfo from './routes/apis/vodInfo';
import streamInfo from './routes/apis/streamInfo';
import clipsInfo from './routes/apis/clipsInfo';
// Proxy
import vodProxy from './routes/proxy/vodProxy';
import streamProxy from './routes/proxy/streamProxy';
import clipProxy from './routes/proxy/clipProxy';
// User
import clipsPage from './routes/user/clipsPage';
import streamPage from './routes/user/streamPage';
import vodsPage from './routes/user/vodsPage';

const router = Router(),
    clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    Cache: { [key: string]: string } = {},
    baseUrl = process.env.INSTANCE_URL || undefined;

router.get('/', (_, res) => {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

clipsInfo.append(router);
streamInfo.append(router);
vodInfo.append(router);

vodProxy.append(router, userAgent, clientId, Cache);
streamProxy.append(router, userAgent, clientId);
clipProxy.append(router, userAgent, clientId);

clipsPage.append(router, baseUrl);
streamPage.append(router);
vodsPage.append(router);

export default router;
