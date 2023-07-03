import { Component, Show, createSignal } from 'solid-js';
import axios from 'axios';
import { clipsApiResponse } from './utils/types';
import Footer from './components/footer';
import { useNavigate, useParams } from '@solidjs/router';
import formatTimeAgo from './utils/formatTimeAgo';

const Clips: Component = () => {
    const instanceBaseUrl = window.location.origin,
        { username, slug } = useParams(),
        [isValid, setClipStatus] = createSignal<boolean>(),
        [clipData, setClipData] = createSignal<clipsApiResponse>(),
        [isReady, setReadyStatus] = createSignal<boolean>(false),
        nav = useNavigate(),
        redirect = (url: string) =>
            nav(url, {
                replace: false,
                scroll: true,
            });
    (async () => {
        const req = await axios.get(
                `${instanceBaseUrl}/api/clipinfo/${username}/${slug}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus(status) {
                        return true;
                    },
                }
            ),
            data = req.data as clipsApiResponse;

        if (data.invalid == true) {
            setClipStatus(false);
            setReadyStatus(true);
            return;
        }
        setClipData(data);
        setClipStatus(true);
        setReadyStatus(true);
    })();

    return (
        <>
            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-secondary"></span>
                    Loading..
                </div>
            </Show>
            <Show when={isReady() == true}>
                <Show when={isValid() == false}>
                    <title>Invalid Clip</title>
                    <div class="container max-auto my-auto px-5 py-10">
                        <div class="border border-base-200 rounded-lg p-6 mt-3 ml-5">
                            <h1 class="font-semibold text-2xl">Not found</h1>
                            <p>Clip not found.</p>
                        </div>
                    </div>
                </Show>
                <Show when={isValid() == true}>
                    <title>Clip {clipData()?.metadata!.title}</title>
                    <div class="container max-auto my-auto px-5 py-10">
                        <div class="flex justify-center">
                            <div class="rounded-md w-auto sm:w-1/2">
                                <video
                                    class="h-auto w-auto"
                                    controls
                                    src={`${instanceBaseUrl}${
                                        clipData()?.media![0]?.src
                                    }`}
                                />
                                <div>
                                    <a
                                        class="text-indigo-400"
                                        href={`${instanceBaseUrl}/${username}/clip/${slug}?embed=true`}
                                    >
                                        Embedded Link
                                    </a>
                                    <br />
                                    <span class="italic">
                                        Created{' '}
                                        {formatTimeAgo(
                                            clipData()?.metadata!.date!
                                        )}
                                    </span>
                                    <h2 class="font-semibold text-xl">
                                        {clipData()?.metadata!.title}
                                    </h2>
                                    <span class="text-indigo-400">
                                        {clipData()?.metadata!.game}
                                    </span>
                                    <br />
                                    <span>
                                        By {clipData()?.metadata!.author} -{' '}
                                        {clipData()?.metadata!.views} Views
                                    </span>
                                    <br />
                                    <div
                                        class="flex flex-row"
                                        onclick={() => redirect(`/${username}`)}
                                    >
                                        <img
                                            class="w-8 rounded-full"
                                            id="avatar"
                                            src={`${instanceBaseUrl}/stream/urlproxy?url=${clipData()
                                                ?.metadata!.avatar!}`}
                                        />
                                        <span class="ml-1">{username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
                <Footer />
            </Show>
        </>
    );
};

export default Clips;
