import '../App.css';
import React from 'react'

const cfg = window.cfgGlobal;
class GalleryFrameInner extends React.Component {

  uniqId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
    if(!this.state.imgPopulated){
      return;
    }
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

      req.open("GET", cfg.locations.server+"/"+curDir.shortname);
      req.send();


    }
    req.open("GET", cfg.locations.server);
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



  getCurrentDirectory = () => {
    if(!this.isValidDirectoryIndex(this.state.selectedDirectory)){
      return false;
    }
    const directories = this.getDirectories();
    return directories[this.state.selectedDirectory];
  }
  renderDirectories = () => {
    const directories = this.getDirectories();
    const currentDirectoryIndex = this.state.selectedDirectory;
    return (
        <ul className="SunsetDirectoryList">
          Galleries:
          {directories.map((value, index) => (
              <li className="SunsetDirectoryListing" key={value.name}>
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
  }
  renderCurrentDirectory = (directory) => {
    let currentDirectory = directory||this.getCurrentDirectory()||{meta:{title:"None",description:""}};
    return (<>
          <h3>Current Directory: {currentDirectory.meta.title}</h3>
          <h4>Description: {currentDirectory.meta.description}</h4>
      </>
    )
  }
  renderImage = (directory) => {
    if(!this.state.imgPopulated) {
      return;
    }
    const curDir = directory;
    const curImage = curDir.images[this.state.selectedImage].name;
    return (
        <img alt={"Gallery image "+this.state.selectedImage} id={"gallery-img-"+this.uniqId} src={cfg.locations.images +"/" +curDir.name+"/"+curImage}></img>
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


        }, cfg.image.fade_time);
      }, cfg.image.fade_time);

  }
  makeIndexControl = (min, max, ) =>{

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
  renderImageIndexControls = (dir) =>{
    const curImgs = dir.images;
    const len = curImgs.length;
    return this.makeIndexControl(0,len);
  }
  render() {
    if(!this.state.imgPopulated){
      this.begin_populate();
      return;
    }
    this.preload_images();
    const curDir = this.getCurrentDirectory();



    const MemoizedDirectories = React.memo(this.renderDirectories);
    return (
      <>
          <div className="SunsetDirectories">
            <MemoizedDirectories/>
          </div>
          <div className="SunsetControls">
            {this.renderCurrentDirectory(curDir)}
            {this.renderImageIndexControls(curDir)}
          </div>
         <div className="SunsetImagePanel">
           <div>{this.renderImage(curDir)}</div>
        </div>
      </>
    )
  }


}

class SunsetGallery extends React.Component{
  render() {
    return(<div className="SunsetsFrame flex-container">
      <GalleryFrameInner/>
    </div>)
  }
}
export default SunsetGallery;



