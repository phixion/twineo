import axios from 'axios';
import { Router, Response, Request } from 'express';
import fetchMedia from '../../utils/fetchMedia';

export default {
    append(
        app: Router,
        userAgent: string,
        clientId: string,
        Cache: { [key: string]: string }
    ) {
        // VOD proxy
        app.get('/vod/:id/:end?', async (req, res) => {
            try {
                const { id, end } = req.params,
                    { quality, proxy }: { quality?: string; proxy?: boolean } =
                        req.query;

                res.setHeader('Access-Control-Allow-Origin', '*');

                if (end?.endsWith('.ts')) {
                    const cacheID = `${id}-${quality}`;

                    if (!(cacheID in Cache))
                        return res.status(403).send('Unknow');

                    const cacheFileFetch = await axios.get(
                        `${Cache[`${cacheID}`]}${end}`,
                        {
                            responseType: 'stream',
                            headers: {
                                'User-Agent': userAgent,
                                Referer: 'https://player.twitch.tv',
                                Origin: 'https://player.twitch.tv',
                                'Client-ID': clientId,
                            },
                            validateStatus: () => true,
                        }
                    );

                    if (cacheFileFetch.status !== 200)
                        return res.status(400).json({ invalid: true });

                    res.setHeader('Cache-Control', 'max-age=3600');
                    cacheFileFetch.data.pipe(res);
                    return;
                }

                const mediaFetch = await fetchMedia(id, true, Boolean(proxy));

                if (mediaFetch.valid == false)
                    return res.status(400).json({ invalid: true });

                const media: {
                        artist: string;
                        title: string;
                        file: string;
                    } = mediaFetch.data.filter((x) =>
                        x.title.includes(quality || '1280x720')
                    )[0],
                    cacheID = `${id}-${
                        media.title.match(/RESOLUTION=(.*?)\,/)[1]
                    }`;

                // set or refresh urls
                Cache[cacheID] = `${media.file.match(/https\:\/\/(.*)\//)[0]}`;

                const fetchFile = await axios.get(media.file, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': userAgent,
                        Referer: 'https://player.twitch.tv',
                        Origin: 'https://player.twitch.tv',
                        'Client-ID': clientId,
                    },
                    validateStatus: () => true,
                });

                if (fetchFile.status !== 200)
                    return res.status(400).json({ invalid: true });

                res.setHeader('Content-Type', 'application/x-mpegURL');
                res.setHeader('Cache-Control', 'max-age=3600');
                fetchFile.data.pipe(res);
            } catch (err) {
                console.log(err);
                return res.status(400).send('err');
            }
        });
    },
};
