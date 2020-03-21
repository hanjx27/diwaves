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

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class Article_comment extends React.PureComponent {
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
    this.article = this.props.commenthome.article;

    this.getArticleDone = false; //由于commenthome里的article内容不全（缺少username level 等用户相关字段），因此这里会获取一次article，用getArticleDone标记是否已经获取过
    ///从redis取数据之后就不存在这个问题了，因为redis里存储的article包含了username、avatar、level 暂时还没去掉取article的操作，后续处理
    this.myUpedcomments = this.props.myUpedcomments
    this.state= {
      audioPlayBg:this.audioPlayBgs[2],
      maximgWidth:(width-78)*0.7,
      maximgHeight:300,
      imgWidth:0,
      imgHeight:0,
      uped:this.myUpedcomments[this.props.commenthome.id] == 1?true:false,
      up:this.props.commenthome.up,
      replycount:this.props.commenthome.replaycount
      
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
    this.props.navigation.navigate('PersonScreen',{personid:this.props.commenthome.userid})
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

  updateReplyCountAndUp = (replycount,uped) => {
    if(uped != this.state.uped) {
      this.myUpedcomments[this.props.commenthome.id] = uped ? 1: -1
      AsyncStorage.setItem('myUpedcomments_' + this.user.id, JSON.stringify(this.myUpedcomments), function (error) {})
      this.setState({
        uped:uped,
        up:uped ? this.state.up + 1 : this.state.up - 1,
        replycount:replycount
      })
    } else {
      this.setState({
        replycount:replycount
      })
    }
  }

  goReply = async() => {
    await this.getArticle();
    this.props.navigation.navigate("CommentScreen",{comment:this.props.commenthome,article:this.article,commentuped:this.state.uped,updateReplyCountAndUp:this.updateReplyCountAndUp})
  }

  rewardArticle = async() => {
    if(this.user != null) {
      if(this.user.id == this.article.userid) {
        Alert.alert('您不能给自己的文章打赏')
        return;
      }
      await this.getArticle();
      this.props.navigation.navigate('RewardScreen',{article:this.article,type:1,user:this.user});
    } else {
      Alert.alert('请先登录')
      return;
    }
  }
  
  addUp = async() => {
    if(this.user == null) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('addUp',{
        userid:this.user.id,
        type:2,
        objid:this.props.commenthome.id,
        parentid:this.props.commenthome.articleid,
      });

      this.myUpedcomments[this.props.commenthome.id] = 1
      AsyncStorage.setItem('myUpedcomments_' + this.user.id, JSON.stringify(this.myUpedcomments), function (error) {})
      this.setState({
        up:this.state.up + 1,
        uped:true
      })
    } catch (error) {
      console.log(error)
    }
  }
  delUp = async() => {
    try {
      const result = await Request.post('delUp',{
        userid:this.props.user.id,
        type:2,
        objid:this.props.commenthome.id,
      });
      this.myUpedcomments[this.props.commenthome.id] = -1
      AsyncStorage.setItem('myUpedcomments_' + this.user.id, JSON.stringify(this.myUpedcomments), function (error) {})
      this.setState({
        up:this.state.up - 1,
        uped:false
      })
    } catch (error) {
      console.log(error)
    }
  }

  report = () => {
    !!this.props.report && this.props.report(this.props.commenthome.article.id,this.props.commenthome.id)
  }

  render() {
    const push = require('../images/push.png')
    
    const u82 = require('../images/u82.png')
    const u84 = require('../images/u84.png')
    const u86 = require('../images/u86.png')
    let up = require('../images/article/up1.png')
    let uped = require('../images/article/up2.png')
    let reward = require('../images/article/u1463.png')
    let more = require('../images/more.png');
    return (
      <View style={{flexDirection:'row',paddingHorizontal:15,paddingTop:15,paddingBottom:9,backgroundColor:'white',marginTop:7,borderBottomColor:'#E9E9E9',borderBottomWidth:0.4}}>
        <TouchableOpacity onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:5,marginRight:10}} source={{uri:(baseimgurl + this.props.commenthome.avatarUrl)}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',height:36,alignItems:"center",justifyContent:'space-between'}}>
          <TouchableOpacity onPress={this.goPerson}>
            <Text style={{fontSize:15,fontWeight:"bold",color:Colors.TextColor,marginBottom:5}}>{this.props.commenthome.username}</Text>
            <Datetime style={{fontSize:12,color:Colors.GreyColor,marginRight:10}} datetime={this.props.commenthome.createdatetime}></Datetime>
          </TouchableOpacity>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <TouchableOpacity style={{marginRight:15}} onPress={this.goReply}>
            <View style={{paddingVertical:6,paddingHorizontal:12,borderRadius:12,backgroundColor:'#f7f7f7'}}><Text style={{fontSize:12,color:'#222'}}>{this.state.replycount == 0 ? "" : this.state.replycount}回复</Text></View>
            </TouchableOpacity>
            {this.state.uped &&
            <TouchableOpacity onPress={()=>{this.delUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
              <MaterialCommunityIcons name='thumb-up' size={19} color={Colors.TextColor}/>
              <Text style={{fontSize:14,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
            </TouchableOpacity>
            }
            {!this.state.uped &&
              <TouchableOpacity onPress={()=>{this.addUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
              <MaterialCommunityIcons name='thumb-up-outline' size={19} color={'black'}/>
              {this.state.up == 0 &&
              <Text style={{fontSize:14,marginLeft:3,marginTop:2}}>赞</Text>
              }
              {this.state.up > 0 &&
              <Text style={{fontSize:14,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
              }
              </TouchableOpacity>
            }

            <TouchableOpacity onPress={()=> this.props.navigation.navigate('PushScreen',{article:this.article})} style={{width:30,height:36,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
              <Image style={{width:19,height:19}} source={push}></Image>
            </TouchableOpacity>
          </View>
        </View>
        <Text ellipsizeMode='tail' style={{marginTop:10,color:'black',fontSize:16,lineHeight:21}} numberOfLines={2}>{this.props.commenthome.content}</Text>
        
        {this.props.commenthome.pic != null && this.props.commenthome.pic != '' &&
          <AutoSizeImage style={{marginTop:10}} maxWidth={width*0.5} source={{uri:baseimgurl + this.props.commenthome.pic}}></AutoSizeImage>
        }

        <ThumbArticle style={{width:width - 100,marginTop:10}} article={this.article}></ThumbArticle>

        <View style={{flexDirection:'row',marginTop:10,borderRadius:3,overflow:'hidden'}}>
            <View style={{width:28,height:28,backgroundColor:'#efefef',justifyContent:'center',alignItems:'center'}}>
              <Image source={u82} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
            <View style={{borderRadius:3,overflow:'hidden',flexDirection:'row',height:28,backgroundColor:'#f9f9f9',alignItems:'center',paddingHorizontal:5}}>
              <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth:width-150,fontSize:12,color:Colors.sTextColor}}>{this.article.dirname}</Text>
              <Image source={u84} resizeMode='stretch' style={{width:14,height:14}}></Image>
            </View>
        </View>
        <View style={{flexDirection:'row',marginTop:10,flexDirection:'row',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={{fontSize:13,color:Colors.sTextColor}}>{this.article.view} 阅读</Text>
            {(this.article.userid != 1) &&    //这里获取的article是commenthome下的article 并没有获取到level，只有userid 所以没有用level判断  感觉这里不应该有赞赏按钮，建议只在帖子详情页保留
            <TouchableOpacity onPress={this.rewardArticle} style={{display:'none',marginLeft:20,alignItems:'center'}}>
              <Image source={reward} style={{width:18,height:18}}></Image>
            </TouchableOpacity>
            }
          </View>
          {this.props.report &&
          <TouchableOpacity onPress={this.report} style={{width:25,height:25,alignItems:'center',justifyContent:'center'}}>
            <Image source={more} resizeMode='stretch' style={{width:25,height:25}}></Image>
          </TouchableOpacity>
          }
        </View>
        </View>
        </View>
    )
  }
}

export default withNavigation(Article_comment);