import axios from 'axios';
import { Router, Response, Request } from 'express';
import fetchMedia from '../../utils/fetchMedia';

export default {
    append(app: Router, userAgent: string, clientId: string) {
        // Proxy streams
        app.get('/stream/:username', async (req, res) => {
            try {
                const { username } = req.params,
                    {
                        quality,
                        proxy,
                        url,
                    }: { quality?: string; proxy?: boolean; url?: string } =
                        req.query;

                if (username == 'urlproxy') {
                    if (!url || url.length < 1)
                        return res.status(400).json({ invalid: true });

                    const fetchFile = await axios.get(url, {
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

                    res.setHeader('Cache-Control', 'max-age=3600');

                    fetchFile.data.pipe(res);
                    return;
                }

                const mediaFetch = await fetchMedia(
                    username.toLowerCase(),
                    false,
                    Boolean(proxy)
                );

                if (mediaFetch.valid == false)
                    return res.status(400).json({ invalid: true });

                const media: {
                    artist: string;
                    title: string;
                    file: string;
                } = mediaFetch.data.filter((x) =>
                    x.title.includes(quality || '1280x720')
                )[0];

                const pipereq = await axios.get(media.file, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': userAgent,
                        Referer: 'https://player.twitch.tv',
                        Origin: 'https://player.twitch.tv',
                        'Client-ID': clientId,
                    },
                    validateStatus: () => true,
                });

                if (pipereq.status !== 200)
                    return res.status(400).json({ invalid: true });

                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/x-mpegURL');

                pipereq.data.pipe(res);
            } catch (err) {
                console.log(err);
                return res.status(400).send('err');
            }
        });
    },
};
