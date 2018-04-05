import React, {Component} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Lightbox from 'react-images';

class GalleryBody extends Component {
    constructor() {
        super();
        this.state = {
            currentImage: 0
        };
        
        this.closeLightbox = this
            .closeLightbox
            .bind(this);
        this.gotoNext = this
            .gotoNext
            .bind(this);
        this.gotoPrevious = this
            .gotoPrevious
            .bind(this);
        this.gotoImage = this
            .gotoImage
            .bind(this);
        this.handleClickImage = this
            .handleClickImage
            .bind(this);
        this.openLightbox = this
            .openLightbox
            .bind(this);
        this.loadItems = this
            .loadItems
            .bind(this);
        this.loadImageOptimized = this
            .loadImageOptimized
            .bind(this);

    }

    loadItems() {
        this.props.loadItems();
    }

    openLightbox(index, event) {
        event.preventDefault();
        this.setState({currentImage: index, lightboxIsOpen: true});
    }

    loadImageOptimized(link) {
        return <img className="w-100 h-100 rounded img-thumbnail" src={link.src} alt={link.alt}/>;
    }

    closeLightbox() {
        this.setState({currentImage: 0, lightboxIsOpen: false});
    }

    gotoPrevious() {
        console.log('gotoPrevious');
        this.setState({
            currentImage: this.state.currentImage - 1
        });
    }

    gotoNext() {
        console.log('gotoNext');
        this.setState({
            currentImage: this.state.currentImage + 1
        });
        this.props.loadAllItems();
    }

    gotoImage(index) {
        console.log('gotoImage');
        this.setState({currentImage: index});
        
    }

    handleClickImage(e) {
        console.log('handleClickImage');
        if (this.state.currentImage === this.state.linksSize - 1) 
            return;
        this.gotoNext();
    }

    render() {

        const loader = <div key={0} className="loader">Loading ...</div>;

        var items = [];
        this
            .props
            .loadedLinks
            .map((link, i) => {
                if (link) {
                    items.push(
                        <a
                            href={link.src}
                            id={link.src}
                            key={i}
                            className="col-6 mt-4"
                            onClick={(e) => this.openLightbox(i, e)}>
                            {this.loadImageOptimized(link)}
                        </a>
                    );
                }
                return items;
            });

        return (
            <div className="row mt-5">

                <div>
                    <InfiniteScroll
                        pageStart={0}
                        className={"row"}
                        loadMore={this.loadItems}
                        hasMore={this.props.hasMoreItems}
                        loader={loader}>

                        {items}

                    </InfiniteScroll>
                    <Lightbox
                        currentImage={this.state.currentImage}
                        images={this.props.loadedLinks}
                        isOpen={this.state.lightboxIsOpen}
                        onClickImage={this.handleClickImage}
                        onClickNext={this.gotoNext}
                        onClickPrev={this.gotoPrevious}
                        onClickThumbnail={this.gotoImage}
                        onClose={this.closeLightbox}/>
                </div>
            </div>
        );
    }
}

export default GalleryBody;
