import React from 'react';
import ReactDOM from 'react-dom';
import PhotosApp from './PhotosApp';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render((
    <PhotosApp/>
), document.getElementById('root'));

registerServiceWorker();