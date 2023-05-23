import '../App.css';
import React from 'react'

const CFG_SERVER_ENDPOINT = "http://localhost:3003";

function getImages(directory) {
  console.log("Accessing directory " + directory);
  return (
      <ul>
        <li><p>Current directory: {directory}</p></li>
      </ul>
  );
}

class GalleryFrame extends React.Component {

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
  populateImages(){
    const curDir = this.getCurrentDirectory();
    const req = new XMLHttpRequest();
    req.onload = () => {
      const imgObj = JSON.parse(req.responseText).images;

      let dirObj = this.state.directories;
      dirObj[this.state.selectedDirectory] = {...dirObj[this.state.selectedDirectory], images: imgObj};

      this.setState({...this.state,
        directories: dirObj,
        imgPopulated: true
      })
    }
    req.open("GET", CFG_SERVER_ENDPOINT+"/"+curDir.shortname);
    req.send();
  }
  populateDirectories(){
    const req = new XMLHttpRequest();
    req.onload = () => {

      const dirObj = JSON.parse(JSON.parse(req.responseText).directories);
      this.setState({...this.state,
        dirPopulated: true,
        directories: dirObj
      })
    }
    req.open("GET", CFG_SERVER_ENDPOINT);
    req.send();
  }
  selectDirectory(index){
    if(!this.isValidDirectoryIndex(index)){
      return;
    }
    this.setState({...this.state, imgPopulated: false, selectedDirectory: index, selectedImage: 0});
  }
  isValidImageIndex(ind){
    const curDir = this.getCurrentDirectory();
    return (Array.isArray(curDir.images) && (ind < curDir.images.length) && (ind > -1));
  }
  isValidDirectoryIndex(ind){
    const directories = this.getDirectories();
    return (Array.isArray(directories) && (ind < directories.length) && (ind > -1));
  }
  renderDirectories = () => {
    const directories = this.getDirectories();
    return (<ul className={"SunsetDirectoryList"}>
      Galleries:
      {directories.map((value, index)=>{
        return (<li className={"SunsetDirectoryListing"}><a className={"SunsetLink"} href={"#"} onClick={(event)=>{
          this.selectDirectory(index);
          event.preventDefault();}
        }>{value.meta.title}</a></li>)
      })}
    </ul>);
  }

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
          <h4>{currentDirectory.meta.description}</h4>
      </>
    )
  }
  renderCurrentImage = () => {
    const curDir = this.getCurrentDirectory();
    const curImage = curDir.images[this.state.selectedImage].name;
    return (
        <img src={CFG_SERVER_ENDPOINT +"/" +curDir.name+"/"+curImage}></img>
    )
  }
  setCurrentImageIndex(index){
      this.setState({...this.state, selectedImage:index});
  }
  render() {
    if(!this.state.dirPopulated){
      this.populateDirectories();
      return;
    }
    if(!this.state.imgPopulated){
      this.populateImages();
      return;
    }


    const makeIndexControl = (min, max) =>{
      const len = max-min;
      const arr = Array.from(Array(len).keys());
      return (
          <div className="SunsetImageControl"><div>{arr.map((value,index)=>{
            const label = index + min + 1;
            const event = (e) => {e.preventDefault(); this.setCurrentImageIndex(label-1)};
            const inhClass = (label-1) === this.state.selectedImage ? "SunsetImageControlIndexSelected" : "SunsetImageControlIndex";
            return (<a className={inhClass} href={""} onClick={event}>{label}</a>);
          })}</div></div>
      );
    }
    const renderImageIndexControls = () =>{
      const selIndex = this.state.selectedImage;
      const curDir = this.getCurrentDirectory();
      const curImgs = curDir.images;
      const len = curImgs.length;

      return makeIndexControl(0,len);
    }
    return (
      <div id="sunset-frame" className="App SunsetsFrame flex-container">
          <div id="ssframe" className="SunsetDirectories">
            {this.renderDirectories()}
          </div>
          <div className="SunsetControls">
            {this.renderCurrentDirectory()}
            {renderImageIndexControls()}
          </div>
         <div className="SunsetImageGrid">
           <div className="SunsetImagePanel">{this.renderCurrentImage()}</div>
        </div>
      </div>
    );
  }

}
export default GalleryFrame;
