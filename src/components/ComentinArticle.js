import React from 'react';
import {px, isIphoneX} from '../utils/px';
import {
  Alert,
  DeviceEventEmitter,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import { baseimgurl } from '../utils/Global';
import {Colors} from '../constants/iColors';
import AutoSizeImage from './AutoSizeImage';
const {width,height} =  Dimensions.get('window');
import { Request } from "../utils/request";
import Datetime from '../components/Datetime';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
class ComentinArticle extends React.PureComponent {
  constructor(props) {
    super(props);
    this.myUpedcomments = this.props.myUpedcomments
    this.state= {
      replycount:this.props.comment.replaycount,
      up:this.props.comment.up,
      uped:this.myUpedcomments[this.props.comment.id] == 1?true:false
    }
  }
  static defaultProps = {
    
  }
  
  componentDidMount() {
    
  }
  componentWillUnmount() {
    
  }
 
  /*shouldComponentUpdate(nextProps, nextState) {
    if(nextState.up != this.state.up) {
      return true;
    } else {
      return false;
    }
    //return true;
  }*/


  addUp = async() => {
    if(this.props.user == null) {
      Alert.alert('请先登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('addUp',{
        userid:this.props.user.id,
        type:2,
        objid:this.props.comment.id,
        parentid:this.props.article.id
      });

      this.myUpedcomments[this.props.comment.id] = 1
      AsyncStorage.setItem('myUpedcomments_' + this.props.user.id, JSON.stringify(this.myUpedcomments), function (error) {})

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
        objid:this.props.comment.id
      });

      this.myUpedcomments[this.props.comment.id] = -1
      AsyncStorage.setItem('myUpedcomments_' + this.props.user.id, JSON.stringify(this.myUpedcomments), function (error) {})

      this.setState({
        up:this.state.up - 1,
        uped:false
      })
    } catch (error) {
      console.log(error)
    }
  }

  deleteCommentConfirm = async() => {
    this.props.onDelComment(this.props.comment.id);
    try {
      const result = await Request.post('deleteComment',{
        commentid:this.props.comment.id,
        articleid:this.props.article.id,
        userid:this.props.comment.userid //评论人的id，有可能是文章作者删除评论，但是传递的userid要传评论人的id
      });
    } catch (error) {
      
    }
  }

  deleteComment = async() => {
    Alert.alert(
      '确认删除此评论？',
      '',
      [
        {text: '确定', onPress: () => {this.deleteCommentConfirm()}},
        {text: '取消', onPress: () => {}}
      ],
      { cancelable: true }
      )
  }


  updateReplyCountAndUp = (replycount,uped) => {
    
    if(uped != this.state.uped) {
      this.myUpedcomments[this.props.comment.id] = uped ? 1: -1
      AsyncStorage.setItem('myUpedcomments_' + this.props.user.id, JSON.stringify(this.myUpedcomments), function (error) {})
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

  goPerson = () => {
    if(this.props.comment.userid == 1 || this.props.comment.username == 'admin') {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.props.comment.userid})
  }

  render() {
    

    let up = require('../images/article/up1.png')
    let uped = require('../images/article/up2.png')
    console.log('render comment')
    return (
      <TouchableOpacity onPress={() => {this.props.navigation.navigate('CommentScreen',{article:this.props.article,comment:this.props.comment,commentuped:this.state.uped,updateReplyCountAndUp:this.updateReplyCountAndUp})}} style={{flexDirection:'row',paddingVertical:15,backgroundColor:'white',marginTop:5,borderBottomColor:'#f1f1f1',borderBottomWidth:0.5}}>
        <TouchableOpacity onPress={this.goPerson}>
          <Image style={{width:38,height:38,borderRadius:5,marginRight:10}} source={{uri:(baseimgurl + this.props.comment.avatarUrl)}}></Image>
        </TouchableOpacity>
        <View style={{flex:1,flexDirection:'column'}}>
        <View style={{display:'flex',flexDirection:'row',alignItems:"center"}}>
          <TouchableOpacity onPress={this.goPerson} style={{flex:1}}>
            <Text style={{fontSize:14,fontWeight:"bold",color:Colors.TextColor}}>{this.props.comment.username}</Text>
          </TouchableOpacity>


          {this.state.uped &&
          <TouchableOpacity onPress={()=>{this.delUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <MaterialCommunityIcons name='thumb-up' size={19} color={Colors.TextColor}/>
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
          </TouchableOpacity>
          }
          {!this.state.uped &&
            <TouchableOpacity onPress={()=>{this.addUp()}} style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
            <MaterialCommunityIcons name='thumb-up-outline' size={19} color={'black'}/>
            {this.state.up == 0 &&
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>赞</Text>
            }
            {this.state.up > 0 &&
            <Text style={{fontSize:13,marginLeft:3,marginTop:2}}>{this.state.up }</Text>
            }
            </TouchableOpacity>
          }
          
        </View>
        <Text style={{marginTop:10,lineHeight:18}}>{this.props.comment.content}</Text>

        {this.props.comment.pic != null && this.props.comment.pic != '' &&
        <AutoSizeImage style={{marginTop:10}} maxWidth={width*0.5} source={{uri:baseimgurl + this.props.comment.pic}}></AutoSizeImage>
        }

        <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Datetime style={{fontSize:12,color:Colors.GreyColor,marginRight:10}} datetime={this.props.comment.createdatetime}></Datetime>
            {this.state.replycount == 0 &&
            <View><Text style={{fontSize:12,color:'#222'}}>回复</Text></View>
            }
            {this.state.replycount > 0 &&
            <View style={{paddingVertical:5,paddingHorizontal:10,borderRadius:12,backgroundColor:'#f7f7f7'}}><Text style={{fontSize:12,color:'#222'}}>{this.state.replycount}回复</Text></View>
            }
          </View>
          {(this.props.user != null && (this.props.article.userid == this.props.user.id || this.props.comment.userid == this.props.user.id)) &&
          <TouchableOpacity style={{paddingVertical:3,paddingHorizontal:3}} onPress={()=>this.deleteComment()}>
            <Text style={{fontSize:12,color:'#222'}}>删除</Text>
          </TouchableOpacity>
          }
        </View>
      </View>
      </TouchableOpacity>
    )
  }
}

export default withNavigation(ComentinArticle);
