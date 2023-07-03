import server from 'express';
import router from './router';
import eta from 'eta';

const app = server();

app.disable('x-powered-by');

app.engine('eta', eta.renderFile);
eta.configure({ views: process.cwd() + '/templates', cache: true, autoEscape: true });
app.set('view engine', 'eta');
app.set('view cache', true);
app.set('views', process.cwd() + '/templates');

app.use(server.static(process.cwd() + '/public'));
app.use(router);

app.listen(3000, () => {
    console.log('Server started at port 3000');
});
