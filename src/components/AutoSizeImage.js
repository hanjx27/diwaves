import React, {PureComponent} from 'react';
import {
  Image,
  Dimensions,
} from 'react-native';

const {width, height } = Dimensions.get('window');
import { baseimgurl } from '../utils/Global';

export default class AutoSizeImage extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.props.source.uri;
    this.url = baseimgurl + this.url.substring(this.url.lastIndexOf('/') + 1)
    console.log(this.url)
    this.state = {
      // set width 1 is for preventing the warning
      // You must specify a width and height for the image %s
      width: 0,
      height: 0,
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

  render() {
    if(this.state.width == 0) {
      return null;
    } else {
      
      /*if(url.indexOf('http') < 0) {
        url = baseimgurl + url.substring(url.lastIndexOf('/') + 1)
      }
      console.log(url)*/
      return <Image resizeMode='cover' style={[this.props.style,{width:this.state.width,height:this.state.height}]} source={{uri:this.url}} />;
    }
    
  }
}
