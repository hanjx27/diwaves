import React, {PureComponent} from 'react';
import {
  Image,
  Dimensions,
  View,
  Modal,
  CameraRoll,
  TouchableWithoutFeedback
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
const {width, height } = Dimensions.get('window');
import { baseimgurl } from '../utils/Global';

export default class AutoSizeImage extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.props.source.uri;
    if(this.url.indexOf('/') >= 0) {
      this.url = baseimgurl + this.url.substring(this.url.lastIndexOf('/') + 1);
    } else {
      this.url = baseimgurl + this.url;
    }
    
    console.log(this.url)
    this.state = {
      // set width 1 is for preventing the warning
      // You must specify a width and height for the image %s
      width: 0,
      height: 0,
      modalVisible:false
    };
  }

  componentDidMount() {

    const maxWidth = this.props.maxWidth;
    
    Image.getSize(this.url, (w, h) => {
      let imgwidth = w;
      let imgheight = h;
      if(maxWidth) {
        if(imgwidth > maxWidth) {
          imgwidth = maxWidth
          imgheight = (maxWidth)*h / w;
        }
      } else if(imgwidth > width - 30) {
        imgwidth = width - 30
        imgheight = (width - 30)*h / w;
      }

      this.setState({
        width:imgwidth,
        height:imgheight
      })
    });
  }

  /*savePhoto =()=> {
    let promise = CameraRoll.saveToCameraRoll(this.url);
    promise.then(function (result) {
       alert("已保存到系统相册")
    }).catch(function (error) {
        alert('保存失败！\n' + error);
    }); 
 }*/

  render() {
    if(this.state.width == 0) {
      return null;
    } else {
      let ImageObjArray = [];
      let Obj = {};
      Obj.url = this.url;
      ImageObjArray.push(Obj)

      return (
      <View>
        <TouchableWithoutFeedback onPress={()=>{
          this.setState({modalVisible:true})
        }}
        >
        <Image resizeMode='cover' style={[this.props.style,{width:this.state.width,height:this.state.height}]} source={{uri:this.url}} />
        </TouchableWithoutFeedback> 
      <Modal
            onRequestClose={()=>{this.setState({modalVisible:false})}}
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalVisible}
                //    onRequestClose={() => { this._pressSignClose() }}
                >
                    <ImageViewer
                        imageUrls={ImageObjArray} // 照片路径
                        enableImageZoom={true} // 是否开启手势缩放
                        saveToLocalByLongPress={false} //是否开启长按保存
                        index={0} // 初始显示第几张
                        // failImageSource={} // 加载失败图片
                        loadingRender={this.renderLoad}
                        enableSwipeDown={false}
                        //menuContext={{ "saveToLocal": "保存图片", "cancel": "取消" }}
                        onChange={(index) => { }} // 图片切换时触发
                        onClick={() => { // 图片单击事件
                            this.setState({modalVisible:false})
                        }}
                        //onSave={(url) => { this.savePhoto(url) }}
                    />
                </Modal>  
      </View>
      )}
    
  }
}
