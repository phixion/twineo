import { Component, createSignal } from 'solid-js';
import Footer from './components/footer';
import { useNavigate } from '@solidjs/router';

const clipRegex = /(.+)?twitch\.tv\/\w+\/clip\/[\w-]+/,
    streamRegex = /(.+)?twitch\.tv\/(.+)/,
    vodRegex = /(.+)?twitch\.tv\/videos\/(\d+)/,
    twitchDomainRegex = /(.+)?twitch\.tv/;

const Home: Component = () => {
    const [inputVal, setInputVal] = createSignal(''),
        [selectedRes, setRes] = createSignal(''),
        [useProxy, setProxyStatus] = createSignal(false),
        redirect = useNavigate();

    function handleSearch() {
        if (inputVal().length < 1) return;
        let queryArgs: { [key: string]: string | boolean } = {};

        if (selectedRes().length > 1) queryArgs['quality'] = selectedRes();
        if (useProxy()) queryArgs['proxy'] = useProxy();

        const resultQuery =
            '?' +
            Object.keys(queryArgs)
                .map((key) => {
                    return `${key}=${queryArgs[key]}`;
                })
                .join('&');

        if (
            inputVal().match(clipRegex) ||
            inputVal().match(streamRegex) ||
            inputVal().match(vodRegex)
        ) {
            redirect(
                `${inputVal().replace(twitchDomainRegex, '')}${resultQuery}`,
                {
                    replace: false,
                    scroll: true,
                }
            );
        } else if (!Number.isNaN(Number(inputVal()))) {
            redirect(`/videos/${inputVal()}${resultQuery}`, {
                replace: false,
                scroll: true,
            });
        } else
            redirect(`/${inputVal()}${resultQuery}`, {
                replace: false,
                scroll: true,
            });
    }

    return (
        <>
        <title>Twineo - Home</title>
            <div class="container max-auto my-auto px-5 py-10">
                <div class="flex mt-32 justify-center items-cente">
                    <div class="m-auto">
                        <div class="form-control w-full max-w-xs">
                            <label class="label">
                                <span class="label-text">Search</span>
                            </label>
                            <input
                                type="text"
                                placeholder="URL, name, vod, clip..."
                                class="input input-bordered w-full max-w-xs"
                                value={inputVal()}
                                onInput={(e) =>
                                    setInputVal(e.currentTarget.value)
                                }
                            />
                            <details class="mt-2 rounded-md border border-base-200 px-4 py-2">
                                <summary>Advanced</summary>
                                <select
                                    onchange={(e) => setRes(e.target.value)}
                                    class="select select-bordered w-full max-w-xs mt-1"
                                >
                                    <option disabled selected>
                                        Resolution
                                    </option>
                                    <option value="1920x1080">1920x1080</option>
                                    <option value="1280x720">1280x720</option>
                                    <option value="852x480">852x480</option>
                                    <option value="640x360">640x360</option>
                                    <option value="284x160">284x160</option>
                                </select>
                                <div class="mt-1">
                                    <input
                                        type="checkbox"
                                        id="proxy"
                                        checked={useProxy()}
                                        onChange={(e) =>
                                            setProxyStatus(e.target.checked)
                                        }
                                    />{' '}
                                    Use{' '}
                                    <a
                                        class="text-secondary"
                                        href="https://ttv.lol/"
                                    >
                                        ttv.lol
                                    </a>{' '}
                                    proxy (vod or stream only) for no ads
                                </div>
                            </details>

                            <button
                                class="btn btn-secondary mt-2"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Home;
