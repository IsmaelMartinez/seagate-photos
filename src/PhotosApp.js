import React, {Component} from 'react';
import NavigationBar from './NavigationBar';
import GalleryBody from './GalleryBody';
import Dropzone from 'react-dropzone';
import throttle from 'lodash.throttle';
import request from 'superagent';

class PhotosApp extends Component {

    constructor(props) {
        super(props);
        var that = this;

        this.state = {
            linksSize: 0,
            lastLoaded: 0,
            links: [],
            loadedLinks: [],
            folders: [],
            hasMoreItems: true
        };

        fetch('http://192.168.5.8', {mode: 'cors'}).then(function (response) {
            return response.text();
        })
            .then(function (text) {
                const parser = new DOMParser();
                let doc = parser.parseFromString(text, "text/html");
                let folders = [];
                console.log('folders', doc.links);
                for (var i = 1; i < doc.links.length; i++) {
                    folders.push({
                        'label': doc.links[i].text,
                        'value': doc.links[i].pathname
                    });
                }
                that.setState({folders: folders});
            });

        this.loadItems = this
            .loadItems
            .bind(this);
        this.loadItemsThrottle = throttle(this.loadItems, 100);
        this.loadAllItems = this
            .loadAllItems
            .bind(this);
        this.loadFolder = this
            .loadFolder
            .bind(this);
    }

    componentWillUnmount() {
        this
            .loadItemsThrottle
            .cancel();
    }

    onDrop(acceptedFiles, rejectedFiles) {
        const req = request.post('http://localhost:3001/upload');
        acceptedFiles.forEach(file => {
            req.attach(file.name, file);
            console.log("file added with name", file.name);
        });
        console.log("callback to be called");
        req.end(function (response){
            console.log(response);
        });
    }

    loadFolder(pathname) {
        var that = this;
        this.setState({
            linksSize: 0,
            lastLoaded: 0,
            currentImage: 0,
            links: [],
            loadedLinks: [],
            hasMoreItems: true,
            nextHref: null
        });
        fetch('http://192.168.5.8' + pathname, {mode: 'cors'}).then(function (response) {
            return response.text();
        })
            .then(function (text) {
                const parser = new DOMParser();
                let doc = parser.parseFromString(text, "text/html");
                let links = [];
                let loadedLinks = [];
                console.log(doc.links);
                for (var i = 1; i < doc.links.length; i++) {
                    if(doc.links[i].pathname.includes('jpg')|| doc.links[i].pathname.includes('JPG')){
                        links.push({
                            'alt': doc.links[i].text,
                            'src': 'http://192.168.5.8' + doc.links[i].pathname
                        });
                    }
                }
                loadedLinks.push(links[0]);
                that.setState({
                    linksSize: links.length,
                    links: links,
                    loadedLinks: loadedLinks,
                    hasMoreItems: (links.length > 1)
                });
            });

    }

    loadItems() {
        console.log('loadedItems');

        var lastLoaded = this.state.lastLoaded;
        var loaded = this.state.loadedLinks;
        loaded.push(this.state.links[lastLoaded]);

        lastLoaded = lastLoaded + 1;

        this.setState({
            loadedLinks: loaded,
            lastLoaded: lastLoaded,
            hasMoreItems: (lastLoaded < this.state.linksSize)
        });
    }

    loadAllItems(e) {
        e.preventDefault();
        this.setState({loadedLinks: this.state.links, lastLoaded: this.state.linksSize, hasMoreItems: false});
    }

    render() {
        const overlayStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            padding: '2.5em 0',
            background: 'rgba(0,0,0,0.5)',
            textAlign: 'center',
            color: '#fff'
          };
              
        return (
            <div className="photosApp container">
                
                    <NavigationBar
                        linksSize={this.state.linksSize}
                        lastLoaded={this.state.lastLoaded}
                        folders={this.state.folders}
                        loadFolder={this.loadFolder}
                        loadAllItems={this.loadAllItems}/>
<Dropzone
            //    disableClick
                style={{position: "relative"}}
            //    accept={accept}
                onDrop={this.onDrop.bind(this)}
            //    onDragEnter={this.onDragEnter.bind(this)}
            //    onDragLeave={this.onDragLeave.bind(this)}
                >
                    <GalleryBody
                        hasMoreItems={this.state.hasMoreItems}
                        loadedLinks={this.state.loadedLinks}
                        loadItems={this.loadItemsThrottle}
                        />
                    
                </Dropzone>
            </div>
        );
    }
}

export default PhotosApp;