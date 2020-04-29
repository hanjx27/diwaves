import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  DeviceEventEmitter,
  Alert,
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
import Datetime from './Datetime';
import { withNavigation } from 'react-navigation';
import { baseimgurl } from '../utils/Global';
import AutoSizeImage from './AutoSizeImage';
import ThumbArticle from './ThumbArticle';
import { Request } from '../utils/request';
import AsyncStorage from '@react-native-community/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class Article_push extends React.PureComponent {
  constructor(props) {
    super(props);
    this.audioPlayBgs = [
      require('../images/u448_3.png'),
      require('../images/u448_2.png'),
      require('../images/u448.png')
    ]

    this.audioPlayBgsIndex = 2;
    this.interval = null;
    this.user = this.props.user;
    this.article = this.props.pushhome.article;
    this.getArticleDone = false; 
    this.state= {
      audioPlayBg:this.audioPlayBgs[2],
      maximgWidth:(width-78)*0.7,
      maximgHeight:300,
      imgWidth:0,
      imgHeight:0,
    }
  }
  static defaultProps = {
    
  }

  componentDidMount() {
    
    if(this.article.pic) {
      Image.getSize(baseimgurl + this.article.pic,(width,height) => {
        let imgWidth = width;
        let imgHeight = height;

        if(imgWidth > this.state.maximgWidth) {
          imgWidth = this.state.maximgWidth
          imgHeight = imgWidth/width * height
        } else if(imgHeight > this.state.maximgHeight){
          imgHeight = this.state.maximgHeight
          imgWidth = imgHeight/height * width
        }

        this.setState({
          imgWidth:imgWidth,
          imgHeight:imgHeight
        })
      })
    }
    

    this.eventHandler = DeviceEventEmitter.addListener('someone_play', (data) => { 
      if(data.id != this.article.id) {
        this.stop();
      }
    });
  }
  componentWillUnmount() {
    this.eventHandler.remove();
  } 
  stop = () => {
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
      DeviceEventEmitter.emit('someone_play', { id: this.article.id});

      let that = this;
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

      this.interval = interval;
    }
    
  }

  goPerson = () => {
    this.props.navigation.navigate('PersonScreen',{personid:this.props.pushhome.userid})
  }
  
  getArticle = async() => {
    if(this.getArticleDone) {
      return;
    }
    try {
      const result = await Request.post('getArticleByIdForApp',{
        articleid:this.article.id
      });
      if(result.code == 1) {
        this.article = result.data;
        this.getArticleDone = true;
      }
    } catch (error) {
      console.log(error)
    }
  }
  report = () => {
    !!this.props.report && this.props.report(this.article.id,this.article.title,this.article.userid)
  }

  render() {
    console.log('render article_push:' + this.props.pushhome.id)
    const push = require('../images/push.png')
    
    const u82 = require('../images/u82.png')
    const u84 = require('../images/u84.png')
    const u86 = require('../images/u86.png')
    let up = require('../images/article/up1.png')
    let uped = require('../images/article/up2.png')
    let reward = require('../images/article/u1463.png')
    let more = require('../images/more.png');
    return (
      <View style={{flexDirection:'row',paddingHorizontal:15,paddingTop:15,paddingBottom:0,backgroundColor:'white',marginTop:7,borderBottomColor:'#E9E9E9',borderBottomWidth:0.4}}>
        <TouchableOpacity style={{width:38,height:38,marginRight:10}} onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:19}} source={{uri:(baseimgurl + this.props.pushhome.avatarUrl)}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',height:36,alignItems:"center",justifyContent:'space-between'}}>
          <TouchableOpacity onPress={this.goPerson}>
            <Text style={{fontSize:15,fontWeight:"bold",color:Colors.TextColor,marginBottom:5}}>{this.props.pushhome.username}</Text>
            <Datetime style={{fontSize:12,color:Colors.GreyColor,marginRight:10}} datetime={this.props.pushhome.createdatetime}></Datetime>
          </TouchableOpacity>
        </View>
        <Text ellipsizeMode='tail' style={{marginTop:10,color:'black',fontSize:15,lineHeight:21}} numberOfLines={2}>{!this.props.pushhome.content?'推荐了':this.props.pushhome.content}</Text>
        <ThumbArticle style={{width:width - 100,marginTop:10}} article={this.article} pushhome={this.props.pushhome}></ThumbArticle>

        <TouchableOpacity onPress={()=>{this.props.navigation.navigate('CategoryArticles',{title:this.article.dirname,lastdir:{id:this.article.dir,title:this.article.dirname.split('/')[2]}})}} style={{flexDirection:'row',marginTop:10,borderRadius:3,overflow:'hidden'}}>
            <View style={{width:28,height:28,backgroundColor:'#efefef',justifyContent:'center',alignItems:'center'}}>
              <Image source={u82} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
            <View style={{borderRadius:3,overflow:'hidden',flexDirection:'row',height:28,backgroundColor:'#f9f9f9',alignItems:'center',paddingHorizontal:5}}>
              <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth:width-150,fontSize:12,color:Colors.sTextColor}}>{this.article.dirname}</Text>
              <Image source={u84} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
        </TouchableOpacity>
        <View style={{height:40,flexDirection:'row',marginTop:0,alignItems:'center',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={{fontSize:13,color:Colors.sTextColor}}>{this.article.view} 阅读</Text>
            {(this.article.userid != 1) &&    //这里获取的article是pushhome下的article 并没有获取到level，只有userid 所以没有用level判断  感觉这里不应该有赞赏按钮，建议只在帖子详情页保留
            <TouchableOpacity onPress={this.rewardArticle} style={{display:'none',marginLeft:20,alignItems:'center'}}>
              <Image source={reward} style={{width:18,height:18}}></Image>
            </TouchableOpacity>
            }
          </View>

          <View style={{flexDirection:'row',alignItems:'center'}}>
          <TouchableOpacity onPress={()=> this.props.navigation.navigate('PushScreen',{article:this.article,pushuserid:this.props.pushhome.userid})} style={{width:50,height:40,alignItems:'center',justifyContent:"center",flexDirection:'row'}}>
              
              <Image style={{width:19,height:19}} source={push}></Image>
              <Text style={{fontWeight:'bold',marginLeft:3,color:'#555',fontSize:14}}>推</Text>
          </TouchableOpacity>
          {this.props.report &&
          <TouchableOpacity onPress={this.report} style={{width:40,height:40,alignItems:'flex-end',justifyContent:'center'}}>
             <View style={{alignItems:'center',justifyContent:'center',width:20,paddingVertical:1,borderRadius:3,backgroundColor:'#f3f3f3'}}>
            <AntDesign name='close' size={9} color={'#888'}/>
            </View>
          </TouchableOpacity>
          }
          </View>
        </View>
        </View>
        </View>
    )
  }
}

export default withNavigation(Article_push);
