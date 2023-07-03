import type { Component } from 'solid-js';
import { Route, Routes } from '@solidjs/router';
import { lazy } from 'solid-js';

import Home from './Home';

// lazy load /:username, /videos/:id, /:username/:slug
const Stream = lazy(() => import('./Stream')),
    Clips = lazy(() => import('./Clips')),
    Vod = lazy(() => import("./Vod"));

const App: Component = () => {
    return (
        <>
            <Routes>
                <Route path="/" component={Home} />
                <Route path="/:username" component={Stream} />
                <Route path="/:username/clip/:slug" component={Clips} />
                <Route path="/videos/:id" component={Vod} />
            </Routes>
        </>
    );
};

export default App;
