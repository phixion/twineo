import axios from 'axios';

const clientId = process.env.CLIENTID || 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    userAgent =
        process.env.USERAGENT ||
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

export async function fetchCategoryInfo(username: string): Promise<{
    valid: boolean;
    data?: {
        userid: string;
        gamename: string;
        streamid: string;
    };
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'SignupPromptCategory',
                variables: {
                    channelLogin: username,
                    isLive: true,
                    isVod: false,
                    videoID: '',
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '21c86683bbfd1a6e9e6636c2b460f94c5014272dcb56f0aa04a7d28d0633502c',
                    },
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (
            req.status !== 200 ||
            req.data.data.user == null ||
            req.data.data.user.stream == null
        )
            return { valid: false };
        return {
            valid: true,
            data: {
                gamename: req.data.data.user.stream.game.name,
                userid: req.data.data.user.id,
                streamid: req.data.data.user.stream.id,
            },
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}

export async function fetchViewCount(userId: string | number): Promise<{
    valid: boolean;
    data?: number;
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                query: `query UseViewCount { user(id: ${userId}) { stream { viewersCount } } }`,
                variables: {},
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (
            req.status !== 200 ||
            req.data.data.user == null ||
            req.data.data.user.stream == null
        )
            return { valid: false };
        return {
            valid: true,
            data: req.data.data.user.stream.viewersCount,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}

export async function fetchAvatar(
    username: string
): Promise<{ valid: boolean; data?: string }> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ChannelShell',
                variables: {
                    login: username,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            '580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe',
                    },
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (
            req.status !== 200 ||
            req.data.data.userOrError == null ||
            req.data.data.userOrError.reason == 'UNKNOWN'
        )
            return { valid: false };
        return {
            valid: true,
            data: req.data.data.userOrError.profileImageURL,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}

export async function fetchTitle(username: string): Promise<{
    valid: boolean;
    data?: string;
}> {
    try {
        const req = await axios.post(
            'https://gql.twitch.tv/gql',
            {
                operationName: 'ComscoreStreamingQuery',
                variables: {
                    channel: username,
                    clipSlug: '',
                    isClip: false,
                    isLive: true,
                    isVodOrCollection: false,
                    vodID: '',
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash:
                            'e1edae8122517d013405f237ffcc124515dc6ded82480a88daef69c83b53ac01',
                    },
                },
            },
            {
                headers: {
                    'User-Agent': userAgent,
                    Referer: 'https://www.twitch.tv/',
                    Origin: 'https://www.twitch.tv/',
                    'Client-ID': clientId,
                },
                validateStatus: () => true,
            }
        );
        if (req.status !== 200 || req.data.data.user == null)
            return { valid: false };
        return {
            valid: true,
            data: req.data.data.user.broadcastSettings.title,
        };
    } catch (err) {
        console.log(err);
        return { valid: false };
    }
}
