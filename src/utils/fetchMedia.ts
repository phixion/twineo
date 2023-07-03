import axios from 'axios';
import { M3U } from 'playlist-parser';
import { AccessTokenRes, PlaybackAccessToken } from '../types/acessToken';
import fetchAcessToken from './fetchAccessToken';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

export default async function fetchMedia(
    mediaID: string,
    isVod: boolean,
    proxy: boolean
): Promise<{
    valid: boolean;
    data?: { artist: string; file: string; title: string }[];
}> {
    try {
        if (isVod == true) {
            const accessToken = await fetchAcessToken(mediaID, true);

            if (accessToken.valid == false) return { valid: false };

            const queryObj = {
                    acmb: 'e30=',
                    allow_source: true,
                    p: Math.floor(Math.random() * 99999) + 1,
                    cdm: 'wv',
                    transcode_mode: 'cbr_v1',
                    supported_codecs: 'avc1',
                    player_version: '1.19.0',
                    player_base: 'mediaplayer',
                    reassignments_supported: true,
                    playlist_include_framerate: true,
                    player_backend: 'mediaplayer',
                    token: (accessToken.data as PlaybackAccessToken).data
                        .videoPlaybackAccessToken.value,
                    sig: (accessToken.data as PlaybackAccessToken).data
                        .videoPlaybackAccessToken.signature,
                },
                queryString = Object.keys(queryObj)
                    .map((k) => {
                        return `${encodeURIComponent(k)}=${encodeURIComponent(
                            queryObj[k]
                        )}`;
                    })
                    .join('&');

            let headers = {
                'User-Agent': userAgent,
                Referer: 'https://player.twitch.tv',
                Origin: 'https://player.twitch.tv',
                'Client-ID': clientId,
            };
            if (proxy == true)
                headers['X-Donate-To'] = 'https://ttv.lol/donate';

            const req = await axios.get(
                proxy
                    ? `https://api.ttv.lol/vod/${encodeURIComponent(
                          mediaID + '?' + queryString
                      )}`
                    : `https://usher.ttvnw.net/vod/${mediaID}.m3u8?${queryString}`,
                {
                    headers: headers,
                    validateStatus: () => true,
                }
            );

            if (req.status !== 200) return { valid: false };

            const parsed: {
                artist: string;
                title: string;
                file: string;
            }[] = (
                M3U.parse(req.data) as
                    | {
                          artist: string;
                          title: string;
                          file: string;
                      }[]
                    | undefined
            ).filter((x) => x !== undefined);
            return {
                valid: true,
                data: parsed,
            };
        } else {
            let queryObj = {
                    acmb: 'e30=',
                    allow_source: true,
                    p: Math.floor(Math.random() * 99999) + 1,
                    cdm: 'wv',
                    transcode_mode: 'cbr_v1',
                    supported_codecs: 'avc1',
                    player_version: '1.19.0',
                    player_base: 'mediaplayer',
                    reassignments_supported: true,
                    playlist_include_framerate: true,
                    player_backend: 'mediaplayer',
                },
                headers = {
                    'User-Agent': userAgent,
                    Referer: 'https://player.twitch.tv',
                    Origin: 'https://player.twitch.tv',
                    'Client-ID': clientId,
                };

            if (proxy == false) {
                const accessToken = await fetchAcessToken(mediaID, false);

                if (accessToken.valid == false) return { valid: false };

                queryObj['token'] = (
                    accessToken.data as AccessTokenRes
                ).data.streamPlaybackAccessToken.value;
                queryObj['sig'] = (
                    accessToken.data as AccessTokenRes
                ).data.streamPlaybackAccessToken.signature;
            }

            if (proxy == true)
                headers['X-Donate-To'] = 'https://ttv.lol/donate';

            const queryString = Object.keys(queryObj)
                    .map((k) => {
                        return `${encodeURIComponent(k)}=${encodeURIComponent(
                            queryObj[k]
                        )}`;
                    })
                    .join('&'),
                req = await axios.get(
                    proxy
                        ? `https://api.ttv.lol/playlist/${mediaID}.m3u8${encodeURIComponent(
                              '?allow_source=true'
                          )}`
                        : `https://usher.ttvnw.net/api/channel/hls/${mediaID}.m3u8?${queryString}`,
                    {
                        headers: headers,
                        validateStatus: () => true,
                    }
                );
            if (req.status !== 200) return { valid: false };
            const parsed: {
                artist: string;
                title: string;
                file: string;
            }[] = (
                M3U.parse(req.data) as
                    | {
                          artist: string;
                          title: string;
                          file: string;
                      }[]
                    | undefined
            ).filter((x) => x !== undefined);

            return {
                valid: true,
                data: parsed,
            };
        }
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
