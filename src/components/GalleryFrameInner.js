import '../App.css';
import React from 'react'

const CFG_GLOBAL = {
  image:{
    fade_time:200
  },
  locations:{
    server:"http://localhost:3003",
    images:"http://localhost/server"

  }
}

class GalleryFrameInner extends React.Component {
  uniqId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  iterator = 0
  state = {
    directories: [],
    selectedDirectory:0,
    selectedImage:0,
    dirPopulated: false,
    imgPopulated: false
  }

  getDirectories = () => {
    return this.state.directories || null;
  }

  preload_images() {
    const { directories, selectedDirectory } = this.state;
    const images = directories[selectedDirectory].images;

    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
  }

  begin_populate(){
    const req = new XMLHttpRequest();
    req.onload = () => {
      const dirObj = JSON.parse(JSON.parse(req.responseText).directories);
      const tempState = {...this.state,
        dirPopulated: true,
        directories: dirObj
      }

      const curDir = tempState.directories[tempState.selectedDirectory];

      req.onload = () => {
        const imgObj = JSON.parse(req.responseText).images;
        let s = this.state.selectedDirectory;
        let dirObj = tempState.directories;
          dirObj[s] = {...dirObj[s], images: imgObj};
          this.setState({...tempState,
            directories: dirObj,
            imgPopulated: true,
          })

      }

      req.open("GET", CFG_GLOBAL.locations.server+"/"+curDir.shortname);
      req.send();


    }
    req.open("GET", CFG_GLOBAL.locations.server);
    req.send();
  }
  selectDirectory(index){
    if(!this.isValidDirectoryIndex(index)){
      return;
    }
    this.setState({...this.state, imgPopulated: false, selectedDirectory: index, selectedImage: 0});
  }

  isValidDirectoryIndex(ind){
    if(!this.state.dirPopulated){
      return;
    }
    const directories = this.getDirectories();
    return (Array.isArray(directories) && (ind < directories.length) && (ind > -1));
  }

  renderDirectories = () => {
    const directories = this.getDirectories();
    const currentDirectoryIndex = this.state.selectedDirectory;

    return (
        <ul className="SunsetDirectoryList">
          Galleries:
          {directories.map((value, index) => (
              <li className="SunsetDirectoryListing" key={index}>
                <button
                    className={`SunsetLink${index === currentDirectoryIndex ? ' SunsetLinkCurrent' : ''}`}
                    onClick={() => this.selectDirectory(index)}
                >
                  {value.meta.title}
                </button>
              </li>
          ))}
        </ul>
    );
  };

  getCurrentDirectory = () => {
    if(!this.isValidDirectoryIndex(this.state.selectedDirectory)){
      return false;
    }
    const directories = this.getDirectories();
    return directories[this.state.selectedDirectory];
  }
  renderCurrentDirectory = () => {

    if (!this.isValidDirectoryIndex) {
      return (
          <h3>Current Directory: None</h3>
      )
    }
    const currentDirectory = this.getCurrentDirectory();
    return (<>
          <h3>Current Directory: {currentDirectory.meta.title}</h3>
          <h4>Description: {currentDirectory.meta.description}</h4>
      </>
    )
  }
  renderCurrentImage = () => {
    if(!this.state.imgPopulated) {
      return;
    }
    const curDir = this.getCurrentDirectory();
    const curImage = curDir.images[this.state.selectedImage].name;
    return (
        <img alt={"Gallery image "+this.state.selectedImage} id={"gallery-img-"+this.uniqId} src={CFG_GLOBAL.locations.images +"/" +curDir.name+"/"+curImage}></img>
    )
  }
  setCurrentImageIndex(index){
      const imageElement = document.getElementById("gallery-img-"+this.uniqId)
      imageElement.style.opacity = '0';

      // Wait for the transition to complete
      setTimeout(() => {

        this.setState({...this.state, selectedImage:index});
        setTimeout(() => {
          imageElement.style.opacity = '1';


        }, CFG_GLOBAL.image.fade_time);
      }, CFG_GLOBAL.image.fade_time);

  }
  render() {
    if(!this.state.imgPopulated){
      this.begin_populate();
      return;
    }
    this.preload_images();

    const makeIndexControl = (min, max) =>{
      const len = max-min;
      const arr = Array.from(Array(len).keys());
      return (
          <div className="SunsetImageControl">
            <div>
              {arr.map((value, index) => {
                const label = index + min + 1;
                const event = () => this.setCurrentImageIndex(label - 1);
                const inhClass =
                    label - 1 === this.state.selectedImage
                        ? "SunsetImageControlIndexSelected"
                        : "SunsetImageControlIndex";
                return (
                    <button
                        className={inhClass}
                        onClick={event}
                        key={index}
                    >
                      {label}
                    </button>
                );
              })}
            </div>
          </div>
      )
    }
    const renderImageIndexControls = () =>{

      const curDir = this.getCurrentDirectory();
      const curImgs = curDir.images;
      const len = curImgs.length;

      return makeIndexControl(0,len);
    }
    return (
      <div className="SunsetsFrame flex-container">
          <div className="SunsetDirectories">
            {this.renderDirectories()}
          </div>
          <div className="SunsetControls">
            {this.renderCurrentDirectory()}
            {renderImageIndexControls()}
          </div>
         <div className="SunsetImagePanel">
           <div>{this.renderCurrentImage()}</div>
        </div>
      </div>
    );
  }

}
export default GalleryFrameInner;
