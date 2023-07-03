import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import {
    Component,
    For,
    Show,
    createEffect,
    createSignal,
    onCleanup,
} from 'solid-js';
import axios from 'axios';
import Hls from 'hls.js';
import {
    vodCommentsApiResponse,
    vodsApiResponse,
    vodCommentsDataApiResponse,
} from './utils/types';
import Footer from './components/footer';

const Vods: Component = () => {
    const instanceBaseUrl = window.location.origin,
        [{ quality, proxy }, _] = useSearchParams(),
        { id } = useParams(),
        [isReady, setReadyStatus] = createSignal(false),
        [isValid, setValidStatus] = createSignal<boolean>(),
        [isHlsSupported, setHlsSuportStatus] = createSignal(true),
        [vodInfo, setVodInfo] = createSignal<vodsApiResponse>(),
        [vodComments, setVodComments] = createSignal<
            vodCommentsDataApiResponse[]
        >([]),
        [chatMessages, setChatMessages] = createSignal<
            vodCommentsDataApiResponse[]
        >([]),
        nav = useNavigate(),
        redirect = (url: string) =>
            nav(url, {
                replace: false,
                scroll: true,
            }),
        queryString = `?quality=${
            quality ? quality : '1280x720'
        }&proxy=${Boolean(proxy)}`,
        streamUrl = `${instanceBaseUrl}/vod/${id}${queryString}`;

    let hlsInstance: Hls, videoRef: HTMLVideoElement, scroll: HTMLDivElement;

    if (!Hls.isSupported()) setHlsSuportStatus(false);

    const initHlsStream = () => {
        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                backBufferLength: 9,
                liveSyncDuration: 9,
                manifestLoadingMaxRetry: Infinity,
                manifestLoadingRetryDelay: 500,
                xhrSetup: (xhr, url) => {
                    if (url.endsWith('.ts')) {
                        const parsedURl =
                            url.replace('vod/', `vod/${id}/`) + queryString;
                        xhr.open('GET', parsedURl);
                    } else xhr.open('GET', url);
                },
            });

            const retry = () => {
                hlsInstance.attachMedia(videoRef);
                hlsInstance.loadSource(streamUrl);
                hlsInstance.startLoad();
            };

            hlsInstance.attachMedia(videoRef);

            hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () =>
                hlsInstance.loadSource(streamUrl)
            );
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => videoRef.play());
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error. Retrying..');
                            retry();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error. Retrying..');
                            hlsInstance.recoverMediaError();
                            break;
                    }
                }
            });
        }
    };

    const fetchComments = async (offset: number) => {
        const req = await axios.get(
                `${instanceBaseUrl}/api/vodinfo/comments/${id}/${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus(status) {
                        return true;
                    },
                }
            ),
            data: vodCommentsApiResponse = req.data;

        if (data.invalid == true || data.valid == false) {
            return false;
        }
        setVodComments((prev) => [...prev, ...data.data!]);
        return true;
    };
    const initChat = async (offset: number = 0) => {
        let commentsStart = 0,
            commentsEnd = 0,
            latestItem: number;
        const fetchCommentsRes = await fetchComments(offset);

        if (fetchCommentsRes == false) {
            // retry after 1s
            setTimeout(() => initChat(offset), 1000);
            return;
        }

        const comments = vodComments();
        commentsStart = comments[0].offset;
        commentsEnd = comments[comments.length - 1].offset;

        console.log(
            `[Log] Chat info\nInit offset: ${commentsStart}\nEnd offset: ${commentsEnd}`
        );

        function playbackListener() {
            const time = Math.round(videoRef.currentTime);
            if (latestItem == time || time < commentsStart) return;

            latestItem = time;

            // load more comments
            if (time == commentsEnd || time > commentsEnd) {
                videoRef.removeEventListener('timeupdate', playbackListener);
                initChat(time > commentsEnd ? time : commentsEnd);
                return;
            }
            const selectedComments = comments.filter((x) => x.offset == time);

            if (selectedComments.length < 1) return;

            const length = comments.length;
            if (length > 1000) {
                setChatMessages([
                    ...comments.splice(0, length - 1000),
                    ...selectedComments,
                ]);
            } else setChatMessages((prev) => [...prev, ...selectedComments]);

            scroll.scrollTop = scroll.scrollHeight;
        }
        videoRef.addEventListener('timeupdate', playbackListener);
    };
    const fetchVodInfo = async () => {
        const req = await axios.get(`${instanceBaseUrl}/api/vodinfo/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus(status) {
                    return true;
                },
            }),
            data: vodsApiResponse = req.data;

        if (data.invalid == true) {
            setValidStatus(false);
            setReadyStatus(true);
            return;
        }
        setVodInfo(data);
        setValidStatus(true);
        setReadyStatus(true);
        initChat();
    };

    onCleanup(() => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });

    createEffect(() => {
        if (isReady() == true && isValid() == true) {
            initHlsStream();
        }
    });

    fetchVodInfo();

    return (
        <>
            <Show when={isHlsSupported() == false}>
                <div class="container mx-auto my-auto px-10 py-2">
                    <div class="border p-2 rounded-md shadow-md border-base-200">
                        Your browser don't support HLS.
                    </div>
                </div>
            </Show>
            <Show when={isReady() == false}>
                <div class="flex justify-center items-center h-screen flex-col">
                    <span class="loading loading-spinner text-secondary"></span>
                    Loading..
                </div>
            </Show>
            <Show when={isReady() == true}>
                <title>{vodInfo()?.title}</title>
                <Show when={isValid() == false}>
                    <div class="container mx-auto my-auto px-10 py-2">
                        <div class="border p-2 rounded-md shadow-md border-base-200">
                            Invalid VOD.
                        </div>
                    </div>
                </Show>
                <Show when={isValid() == true}>
                    <div class="container md:py-5">
                        <div class="flex justify-center items-center">
                            <div class="md:ml-40 flex flex-col md:flex-row md:gap-2">
                                <div class="w-full md:w-3/4 md:h-auto">
                                    <video ref={videoRef} controls />
                                    <div class="p-1">
                                        <h2 class="text-lg font-semibold">
                                            {vodInfo()?.title}
                                        </h2>
                                        <span class="text-indigo-400">
                                            {vodInfo()?.game}
                                        </span>
                                        <div
                                            class="mt-1 flex flex-row space-x-1"
                                            onclick={() =>
                                                redirect(
                                                    `/${
                                                        vodInfo()?.username
                                                    }${queryString}`
                                                )
                                            }
                                        >
                                            <img
                                                class="w-8 rounded-full"
                                                id="avatar"
                                                src={`${instanceBaseUrl}/stream/urlproxy?url=${
                                                    vodInfo()?.avatar
                                                }`}
                                            />
                                            <span class="ml-1">
                                                {vodInfo()?.username}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="w-full md:w-2/4">
                                    <div class="border border-base-200 rounded-md shadow-md p-4 w-auto">
                                        <h2 class="text-xl">Chat</h2>
                                        <div
                                            class="mt-3 h-96 md:h-80 overflow-auto break-words"
                                            style={{
                                                'scrollbar-width': 'thin',
                                            }}
                                            ref={scroll}
                                        >
                                            <For each={chatMessages()}>
                                                {(item) => (
                                                    <div>
                                                        <span
                                                            style={{
                                                                color: item.color,
                                                            }}
                                                        >
                                                            {item.username}
                                                        </span>
                                                        : {item.message}
                                                    </div>
                                                )}
                                            </For>
                                        </div>
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

export default Vods;
