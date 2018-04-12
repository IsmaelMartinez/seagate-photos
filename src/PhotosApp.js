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

        fetch('http://localhost:3001/list', {mode: 'cors'}).then(function (response) {
            return response.json();
        })
            .then(function (json) {
                let folders = [];
                console.log('folders', json);
                for (var i = 0; i < json.length; i++) {
                    if(json[i].IsDir) {
                        folders.push({
                            'label': json[i].Name,
                            'value': json[i].Name
                        });
                    }
                    
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
        var that = this;
        const req = request.post('http://localhost:3001/upload?pathname='+this.state.pathname);
        acceptedFiles.forEach(file => {
            req.attach(file.name, file);
            console.log("file added with name", file.name);
        });
        req.end(function (){
            that.loadFolder(that.state.pathname);
        });
    }

    loadFolder(pathname) {
        if (!pathname) {
            console.log("no pathname");
            return;
        }
        var that = this;
        this.setState({
            linksSize: 0,
            lastLoaded: 0,
            currentImage: 0,
            pathname: pathname,
            links: [],
            loadedLinks: [],
            hasMoreItems: true,
            nextHref: null
        });
        fetch('http://localhost:3001/list?pathname=' + pathname, {mode: 'cors'}).then(function (response) {
            return response.json();
        })
            .then(function (json) {
                let links = [];
                let loadedLinks = [];
                console.log(json);
                for (var i = 0; i < json.length; i++) {
                    if (!json[i].IsDir) {
                        if(!json[i].Name.includes('.db')){

                            links.push({
                                'alt': json[i].Name,
                                'src': 'http://localhost:3001/' + pathname + '/' + json[i].Name,
                                'caption': json[i].Name,
                                'contentType': json[i].ContentType
                            });
                        }
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

        if (!this.state.hasMoreItems){
            console.log('all loaded');
            return;
        }
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
        if (e){
            e.preventDefault();
        }
        this.setState({loadedLinks: this.state.links, lastLoaded: this.state.linksSize, hasMoreItems: false});
    }

    render() {
        let dropzoneRef;
        return (
            <div className="photosApp container">
                <Dropzone
                        disableClick
                        style={{position: "relative"}}
                        onDrop={this.onDrop.bind(this)}
                    >
                    <NavigationBar
                        linksSize={this.state.linksSize}
                        lastLoaded={this.state.lastLoaded}
                        folders={this.state.folders}
                        loadFolder={this.loadFolder}
                        loadAllItems={this.loadAllItems}
                        onDrop={this.onDrop.bind(this)}
                        />
                    
                    <GalleryBody
                        hasMoreItems={this.state.hasMoreItems}
                        linksSize={this.state.linksSize}
                        loadedLinks={this.state.loadedLinks}
                        loadItems={this.loadItemsThrottle}
                        loadAllItems={this.loadAllItems}
                        />
                    
                </Dropzone>
            </div>
        );
    }
}

export default PhotosApp;