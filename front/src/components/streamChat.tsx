import { Component, onCleanup, createSignal, For } from 'solid-js';
import { parsedMessageObject } from '../utils/types';
import ModImg from '../../assets/mod.png';
import SubImg from '../../assets/sub.png';

function parseMessage(content: string) {
    const valPairs = content.split(';'),
        res: { [key: string]: string } = {};

    valPairs.forEach((p) => {
        const [key, val] = p.split('='),
            keyTrim = key.trim(),
            valTrim = val.trim();

        if (keyTrim == 'user-type') {
            res['message'] = valTrim.split(':')[2].trim();
        } else res[keyTrim] = valTrim;
    });
    return res as unknown as parsedMessageObject;
}

const StreamChat: Component<{ username: string; scroll: HTMLDivElement }> = ({
    username,
    scroll,
}) => {
    const [messages, setMessages] = createSignal<parsedMessageObject[]>([]);
    let socket: WebSocket;

    const initWSConnection = () => {
        socket = new WebSocket('wss://irc-ws.chat.twitch.tv/');

        socket.onopen = () => {
            console.log('[Log] WebSocket: connected');
            socket.send(
                'CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership'
            );
            socket.send('PASS SCHMOOPIIE');
            socket.send('NICK justinfan35233');
            socket.send('USER justinfan35233 8 * :justinfan35233');
            socket.send(`JOIN #${username}`);
        };

        socket.onclose = () => {
            console.log('[Log] WebSocket closed, retrying.');
            socket.close();
            initWSConnection();
        };

        socket.onmessage = (event) => {
            const parsedMsg = parseMessage(event.data);
            if (parsedMsg?.message && parsedMsg.message.length > 1) {
                const length = messages().length;
                if (length > 1000) {
                    setMessages([
                        ...messages().splice(0, length - 1000),
                        parsedMsg,
                    ]);
                }
                setMessages((prev) => [...prev, parsedMsg]);
            }
            scroll.scrollTop = scroll.scrollHeight;
        };
    };

    onCleanup(() => {
        if (socket && socket.readyState == WebSocket.OPEN) socket.close();
    });

    initWSConnection();

    return (
        <>
            <For each={messages()}>
                {(item) => (
                    <div>
                        {item.mod == '1' ? (
                            <img
                                class="inline-block w-[18px] h-auto m-1"
                                src={ModImg}
                            />
                        ) : (
                            <></>
                        )}
                        {item.subscriber == '1' ? (
                            <img
                                class="inline-block w-[18px] h-auto m-2"
                                src={SubImg}
                            />
                        ) : (
                            <></>
                        )}
                        <span
                            style={{
                                color: `${item.color || '#FFFF'}`,
                            }}
                        >
                            {item['display-name']}
                        </span>
                        : {item.message}
                    </div>
                )}
            </For>
        </>
    );
};

export default StreamChat;
