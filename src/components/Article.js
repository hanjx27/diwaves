import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';

import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import { baseimgurl } from '../utils/Global';
import { withNavigation } from 'react-navigation';
import Sound from 'react-native-sound';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class Article extends React.PureComponent {
  constructor(props) {
    super(props);
    this.addviewflag = false;

    this.sound = null;

    this.audioPlayBgs = [
      require('../images/u448_3.png'),
      require('../images/u448_2.png'),
      require('../images/u448.png')
    ]
    this.audioPlayBgsIndex = 2;
    this.interval = null;
    this.state= {
      audioPlayBg:this.audioPlayBgs[2],
      comment:this.props.article.comment,
      view:this.props.article.view
    }
  }
  static defaultProps = {
    
  }
  
  updateCommentCount = (comment) => {
    this.setState({
      comment:comment
    })
  }
  
  componentDidMount() {
    
    this.eventHandler = DeviceEventEmitter.addListener('someone_play', (data) => { 
      if(data.id != this.props.article.id) {
        this.stop();
      }
    });
  }
  componentWillUnmount() {
    this.stop();
    this.eventHandler.remove();
  } 
  stop = () => {
    if(this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
    }
    if(this.interval) {
      clearInterval(this.interval);
      this.setState({
        audioPlayBg:this.audioPlayBgs[2]
      })
      this.audioPlayBgsIndex = 2;
      this.interval = null;
    }
  }
  audioPlay = () => {
    if(this.interval) {
      this.stop();
    } else {
      let that = this;
      let url = baseimgurl + this.props.article.audiopath
      console.log(url)
      this.sound = new Sound(url, null, err => {
        if(err) {
          return console.log(err)
        }
        
        this.sound.play(success =>{
          this.stop();
        })

        DeviceEventEmitter.emit('someone_play', { id: that.props.article.id});

        that.audioPlayBgsIndex++;
          if(that.audioPlayBgsIndex == 3) {
            that.audioPlayBgsIndex = 0;
          }
          that.setState({
            audioPlayBg:that.audioPlayBgs[that.audioPlayBgsIndex]
          })

        let interval = setInterval(function() {
          that.audioPlayBgsIndex++;
          if(that.audioPlayBgsIndex == 3) {
            that.audioPlayBgsIndex = 0;
          }
          that.setState({
            audioPlayBg:that.audioPlayBgs[that.audioPlayBgsIndex]
          })
        },300)
        that.interval = interval;
      })

      
    }
    
  }

  goPerson = () => {
    if(this.props.article.level == 0) {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.props.article.userid})
  }
  
  pushArticle = () => {
    this.props.navigation.navigate('PushScreen',{article:this.props.article})
  }

  goArticleDetail = () => {
    DeviceEventEmitter.emit('someone_play', { id: -1});
    if(!this.addviewflag) {
      this.setState({view:this.state.view + 1});
      this.addviewflag = true;
    }
  
    this.props.navigation.navigate('ArticleScreen',{article:this.props.article,updateCommentCount:this.updateCommentCount});
  }

  report = () => {
    !!this.props.report && this.props.report(this.props.article.id)
  }
  render() {
    const push = require('../images/push.png')
    const u82 = require('../images/u82.png')
    const u84 = require('../images/u84.png')
    const u86 = require('../images/u86.png')
    let more = require('../images/more.png');
    console.log('render article')
    return (
      <TouchableOpacity onPress={this.goArticleDetail}  style={{paddingHorizontal:15,paddingTop:10,paddingBottom:9,backgroundColor:'white',marginTop:7,borderBottomColor:'#E9E9E9',borderBottomWidth:0.4}}>
        
        {this.props.article.level != 0 &&
        <TouchableOpacity onPress={this.goPerson} style={{display:'flex',flexDirection:'row',height:36,alignItems:"center",marginBottom:10}}>
          <Image style={{width:36,height:36,borderRadius:18}} source={{uri:(baseimgurl + this.props.article.avatarUrl)}}></Image>
          <View style={{flex:1,marginLeft:10}}>
            <Text style={{fontSize:15,fontWeight:"bold",color:Colors.TextColor,marginBottom:5}}>{this.props.article.username}</Text>
            <Text style={{fontSize:12,color:Colors.GreyColor}}>{this.props.article.createdate}</Text>
          </View>
          <TouchableOpacity onPress={this.pushArticle} style={{display:'none',width:36,height:36,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <Image style={{width:18,height:18}} source={push}></Image>
          </TouchableOpacity>
        </TouchableOpacity>
        }
        <Text ellipsizeMode='tail' style={{fontWeight:'bold',color:'#222',fontSize:16,lineHeight:21}} numberOfLines={2}>{this.props.article.title}</Text>
        
        {this.props.article.category == 1 && 
        <View style={{marginTop:10,flexDirection:'row'}}>
          <Text ellipsizeMode={'tail'} numberOfLines={3} style={{lineHeight:18,fontSize:14,color:Colors.sTextColor,flex:1}}>{this.props.article.contenttext}</Text>
          {this.props.article.pic != null && this.props.article.pic != '' && 
          <Image source={{uri:(baseimgurl + this.props.article.pic)}}  resizeMode={'cover'} style={{borderRadius:3,width:85,height:54,marginLeft:7}}></Image>
          }
          </View>
        }
        {this.props.article.category == 2 && 
        <View style={{marginTop:10,flexDirection:'row',paddingVertical:10,alignItems:'center',}}>
          <TouchableWithoutFeedback onPress={this.audioPlay}>
              <View style={{alignItems:'center',flexDirection:'row',minWidth:80,width:this.props.article.audiolength*10,maxWidth:width*0.7,height:34,borderWidth:0.5,borderColor:'#eee',borderRadius:17}}>
                <Image source={this.state.audioPlayBg} style={{marginLeft:10,width:20,height:20}}></Image>
                <Text style={{marginLeft:10,fontSize:13,color:'black'}}>{this.props.article.audiolength + '"'}</Text>
              </View>
          </TouchableWithoutFeedback>
          <View style={{marginLeft:10,width:10,height:10,backgroundColor:'red',borderRadius:10}}></View>
        </View>
        }
        <View style={{flexDirection:'row',marginTop:10,borderRadius:3,overflow:'hidden'}}>
            <View style={{width:28,height:28,backgroundColor:'#efefef',justifyContent:'center',alignItems:'center'}}>
              <Image source={u82} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
            <View style={{flexDirection:'row',height:28,backgroundColor:'#f9f9f9',alignItems:'center',paddingHorizontal:5,borderRadius:3,overflow:'hidden'}}>
              <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth:width-100,fontSize:12,color:Colors.sTextColor}}>{this.props.article.dirname}</Text>
              <Image source={u84} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
        </View>
        <View style={{flexDirection:'row',marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
          
          <Text style={{fontSize:13,color:Colors.GreyColor}}><Text style={{fontSize:13,color:Colors.GreyColor}}>{this.state.view} 阅读</Text> {this.state.comment} 评论</Text>
          {this.props.report &&
          <TouchableOpacity onPress={this.report} style={{width:25,height:25,alignItems:'center',justifyContent:'center'}}>
            <Image source={more} resizeMode='stretch' style={{width:25,height:25}}></Image>
          </TouchableOpacity>
          }
        </View>
        </TouchableOpacity>
    )
  }
}

export default withNavigation(Article);
