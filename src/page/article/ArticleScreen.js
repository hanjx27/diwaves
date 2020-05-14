import React, { Component } from 'react';
import { DeviceEventEmitter,Modal,TextInput,Image,FlatList,findNodeHandle,UIManager,StatusBar,NativeModules,Keyboard,View,StyleSheet,Platform,Text,Dimensions,TouchableOpacity,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import ImagePicker from 'react-native-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import ComentinArticle from '../../components/ComentinArticle';
import PushinArticle from '../../components/PushinArticle';
import AsyncStorage from '@react-native-community/async-storage';
import AutoSizeImage from '../../components/AutoSizeImage';
import HTMLView from 'react-native-htmlview';
import HTML from 'react-native-render-html';
import WebView from 'react-native-webview';
import { Request } from '../../utils/request';
import { baseimgurl } from '../../utils/Global';
import Datetime from '../../components/Datetime';
import FocusBtn from '../../components/FocusBtn';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather'
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import Sound from 'react-native-sound';

const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

import {Colors} from '../../constants/iColors';

/*let font = (width / 37.5)
if(PixelRatio.get() >= 3) {
      font = font * PixelRatio.get() / 2.5
}*/
let font = (width / 30)

export default class ArticleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.pickimage = false;
    this.article = props.navigation.getParam('article');

    this.pushuserid = this.props.navigation.getParam('pushuserid')
    if(!this.pushuserid) {
      this.pushuserid = -1;
    }

    this.upeddata = null;
    
    this.sound = null;

    this.audioPlayBgs = [
      require('../../images/u448_3.png'),
      require('../../images/u448_2.png'),
      require('../../images/u448.png')
    ]
    this.audioPlayBgsIndex = 2;
    this.interval = null;

    this.myUpedarticles = {};
    this.myUpedcomments = {};
    this.myremarklist = {};
    this.flatlistpageY = null;
    this.scrollY = 0;
    this.scrollFlag = 0; //0:评论按钮第一次按滚动到评论区，1:评论按钮第二次按滚动到顶部
    this.state = {
      audioPlayBg:this.audioPlayBgs[2],

      articlecontent:'',
      article:this.article,
      keyboardHeight:new Animated.Value(0),
      writefocus:false,
      imageurl:null,
      commentList:[],
      pushList:[],
      height:0,
      commentcontent:'',
      user:null,
      uplist:{},
      uped:false,
      reportVisible:false,
      reportArticleVisible:false,
      sort:'最热',
      upcount:this.article.up,

      myremark:[0,0],// 第一位:0没选,1喜欢,2不喜欢   第二位:0没选,1利好,2利空

      onlyauth:0
    }

    this.reportcommentid = -1;
    this.reportCommentList = {}
  }

  onlyauthClick = () => {
    this.setState({
      onlyauth:this.state.onlyauth == 0?1:0
    })
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
      let url = baseimgurl + this.article.audiopath
      
      this.sound = new Sound(url, null, err => {
        if(err) {
          return console.log(err)
        }
        
        this.sound.play(success =>{
          this.stop();
        })

        //DeviceEventEmitter.emit('someone_play', { id: that.article.id});
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
    if(this.article.userid == 1|| this.article.username == 'admin') {
      return;
    }
    this.props.navigation.navigate('PersonScreen',{personid:this.article.userid})
  }

  renderNode(node, index, siblings, parent, defaultRenderer) {
    if (node.name == 'h3') {
      return (
        <View style={{display:'flex',flexDirection:'column',borderLeftWidth:0.3*font,borderLeftColor:"red",paddingLeft:font*0.8, marginBottom:font* 1.5,fontSize:1.5*font}}>
          {defaultRenderer(node.children, node)}
        </View>
      );
    } else if(node.name == 'div' && node.attribs.id == 'covertag') {
      return null;
    } else if (node.name == 'img') {
      return (
        <AutoSizeImage source={{uri:node.attribs.src}}></AutoSizeImage>
      );
    } else if(node.name == 'h5') {
      return (
        <View style={{fontSize:font*1.5,paddingBottom:1*font,lineHeight:font*2.2,}}>
           {defaultRenderer(node.children, node)}
        </View>
      )
    }
  }

  componentWillMount() {
    
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);

  }
  _keyboardWillShow = (e) => {
    
    Animated.parallel([
        Animated.timing(this.state.keyboardHeight , {
          duration: e.duration,
          toValue: isIphoneX ? e.endCoordinates.height -34 : e.endCoordinates.height 
        })
      ]).start();
  }
  _keyboardWillHide = (e) => {

    Animated.parallel([
        Animated.timing(this.state.keyboardHeight , {
          duration: e.duration,
          toValue: 0
        })
      ]).start();
  }

  componentDidMount = async() => {
    //this.addView(); addView 放到getcontent里一并执行
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})

      const myremarkliststr = await AsyncStorage.getItem('myremarklist_' + json.id);
      if(!!myremarkliststr) {
        this.myremarklist = JSON.parse(myremarkliststr)
        console.log(this.myremarklist)
        if(this.myremarklist[this.state.article.id]) {
          this.setState({
            myremark:this.myremarklist[this.state.article.id]
          })
        }
      }
    }
    this.getArticleRemark();
    if(this.article.category == 1) {
      this.getContent();
    }
    const reportCommentListstr = await AsyncStorage.getItem('reportCommentList');
    if(reportCommentListstr) {
      this.reportCommentList = JSON.parse(reportCommentListstr)
    }

    if(reportCommentListstr) {
      this.reportCommentList = JSON.parse(reportCommentListstr)
    }
    this.getUped();
  }

  report2 = (commentid,title,publishuserid) => {
    this.reportcommenttitle = title;
    this.reportcommentid = commentid;
    this.publishuserid = publishuserid;
    this.setState({
      reportVisible:true
    })
  }

  reportArticle = async(text) => {
    let reportListstr = await AsyncStorage.getItem('reportList');
    let reportList = {};
    if(reportListstr != null) {
      reportList = JSON.parse(reportListstr);
    }
    reportList[this.state.article.id] = 1;
    AsyncStorage.setItem('reportList', JSON.stringify(reportList), function (error) {})

    DeviceEventEmitter.emit('reportArticle', { id: this.state.article.id});

    try {
      const result = await Request.post('addReport',{
        userid:!!this.state.user?this.state.user.id:'',
        objid:this.state.article.id,
        title:this.state.article.title,
        publishuserid:this.state.article.userid,
        type:1,
        text:text
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      if(result.code == 1) {
        this.setState({
          reportArticleVisible:false
        },()=> {
          const toastOpts = {
            data: '感谢您的举报,我们会尽快处理',
            textColor: '#ffffff',
            backgroundColor: Colors.TextColor,
            duration: 1000, //1.SHORT 2.LONG
            position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
          }
          WToast.show(toastOpts)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  reportComment = async(text) => {
    this.reportCommentList[this.reportcommentid] = 1;
    AsyncStorage.setItem('reportCommentList', JSON.stringify(this.reportCommentList), function (error) {})

    try {
      const result = await Request.post('addReport',{
        userid:!!this.state.user?this.state.user.id:'', //举报人
        text:text,
        objid:this.reportcommentid,
        type:2,
        publishuserid:this.publishuserid,
        title:this.reportcommenttitle
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      if(result.code == 1) {
        let commentList = this.state.commentList;
        for(let i = 0;i < commentList.length;i++) {
          if(commentList[i].id == this.reportcommentid) {
            commentList.splice(i,1);
            break;
          }
        }
        this.setState({
          reportVisible:false,
          commentList:commentList
        },()=> {
          const toastOpts = {
            data: '感谢您的举报,我们会尽快处理',
            textColor: '#ffffff',
            backgroundColor: Colors.TextColor,
            duration: 1000, //1.SHORT 2.LONG
            position: WToast.position.TOP, // 1.TOP 2.CENTER 3.BOTTOM
          }
          WToast.show(toastOpts)
        })
        
      }
    } catch (error) {
      console.log(error)
    }
  }

  getUped = async() => {
    if(this.state.user == null) {
      this.getComment();
      return;
    }
    const myUpedarticlesstr = await AsyncStorage.getItem('myUpedarticles_' + this.state.user.id);
    if(myUpedarticlesstr != null) {
      this.myUpedarticles = JSON.parse(myUpedarticlesstr);
      const myUpedcommentsstr = await AsyncStorage.getItem('myUpedcomments_' + this.state.user.id);
      this.myUpedcomments = JSON.parse(myUpedcommentsstr);
      if(this.myUpedarticles[this.article.id] == 1) {
        this.setState({
          uped:true
        })
      }
      this.getComment();
    } else {
      try {
        const result = await Request.post('getUpedObjects',{
          userid:this.state.user.id,
        });
        if(result.code == 1) {
          const myUpedarticles = result.data.myUpedarticles
          const myUpedcomments = result.data.myUpedcomments
          const myUpedreplys = result.data.myUpedreplys
          
          this.myUpedarticles = myUpedarticles
          this.myUpedcomments = myUpedcomments

          AsyncStorage.setItem('myUpedarticles_' + this.state.user.id, JSON.stringify(myUpedarticles), function (error) {})
          AsyncStorage.setItem('myUpedcomments_' + this.state.user.id, JSON.stringify(myUpedcomments), function (error) {})
          AsyncStorage.setItem('myUpedreplys_' + this.state.user.id, JSON.stringify(myUpedreplys), function (error) {})
          if(myUpedarticles[this.article.id] == 1) {
            this.setState({
              uped:true
            })
          }
        }
      } catch (error) {
      }
      this.getComment();
    }
    
  }

  addUp = async(type,objid) => {
    if(this.state.user == null) {
      Alert.alert('您尚未登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('addUp',{
        userid:this.state.user.id,
        type:type,
        objid:objid
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      
        this.myUpedarticles[objid] = 1
        AsyncStorage.setItem('myUpedarticles_' + this.state.user.id, JSON.stringify(this.myUpedarticles), function (error) {})
        this.setState({
          uped:true,
          upcount:this.state.upcount+1
        })
      
    } catch (error) {
      console.log(error)
    }
  }

  delUp = async(type,objid) => {
    if(this.state.user == null) {
      Alert.alert('您尚未登录') //需要做统一处理
      return;
    }

    try {
      const result = await Request.post('delUp',{
        userid:this.state.user.id,
        type:type,
        objid:objid,
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      this.myUpedarticles[objid] = -1
      AsyncStorage.setItem('myUpedarticles_' + this.state.user.id, JSON.stringify(this.myUpedarticles), function (error) {})
      this.setState({
        uped:false,
        upcount:this.state.upcount-1
      })
    } catch (error) {
      console.log(error)
    }

  }


  uploadImage = async(uri) => {
    let result;
    let formData = new FormData();
    let file = {uri: "file://" + uri, type: 'multipart/form-data', name: uri};
    formData.append("multipartFiles",file);
    try {
      result = await Request.post3('uploadImage',formData,'formdata');
    } catch (error) {
    }
    return result;
  }
  

  scrollToFlatlist =(toComment)=> {
    if(toComment) { //确定去评论区
      this.scrollFlag = 1;
      let that = this;
      const handle = findNodeHandle(this.flatlist)
      UIManager.measure(handle,(x, y, width, height, pageX, pageY)=>{
        that.flatlistpageY = pageY + this.scrollY - 200
        that.scrollview.scrollTo({ x: 0, y: that.flatlistpageY, animated: true });
      });
    } else {
      if(this.scrollFlag == 0) {
        this.scrollFlag = 1;
        let that = this;
        const handle = findNodeHandle(this.flatlist)
        UIManager.measure(handle,(x, y, width, height, pageX, pageY)=>{
          that.flatlistpageY = pageY + this.scrollY - 200
          that.scrollview.scrollTo({ x: 0, y: that.flatlistpageY, animated: true });
        });
      } else {
        this.scrollFlag = 0;
        this.scrollview.scrollTo({ x: 0, y: 0, animated: true });
      }
    }
    
  }

  addComment= async() => {
    if(this.state.user == null) {
      Alert.alert('您尚未登录')
      return;
    }

    let urluploadpath = '';
    if(this.state.imageurl != null) {
      const uploadresult = await this.uploadImage(this.state.imageurl);
      urluploadpath = uploadresult.path
    }
    try {
      const result = await Request.post('addComment',{
        userid:this.state.user.id,
        content:this.state.commentcontent, 
        articleid:this.article.id, 
        onlyauth:this.state.onlyauth,
        pic:urluploadpath,
        articleuserid:this.article.userid
      });
      if(result.code > 0) {
        let commentList = this.state.commentList
        let comment = result.data

        comment.content = this.state.commentcontent;
        comment.userid = this.state.user.id;
        comment.replaycount = 0;
        comment.up = 0;
        comment.articleid = this.article.id;
        comment.pic = urluploadpath
        comment.username = this.state.user.name
        comment.avatarUrl = this.state.user.avatar

        commentList.unshift(comment)

        this.commentinput.blur()
        let that = this;
        this.setState({
          commentcontent:'',
          imageurl:null,
          commentList:commentList,
          writefocus:false
        },()=>{
          that.scrollToFlatlist(true);
        })
      } else if(result.code == -2) {
        Alert.alert('您已被封禁')
      } else if(result.code == -3) {
        Alert.alert('请勿发表包含辱骂、色情、暴恐、涉政等违法信息')
        return;
      }
    } catch (error) {
      
    }
  }

  getPushs = async()=> {
    try {
      const result = await Request.post('getPushs',{
        articleid:this.article.id
      });
      if(result.code == 1) {
         this.setState({
          pushList:result.data
         })
      }
    } catch (error) {
      
    }
  }

  getComment = async() => {
    try {
      const result = await Request.post('comments',{
        articleid:this.article.id,
        sort:this.state.sort
      });
      
      if(result.code == 1) {
        let commentList = []
        for(let i = 0;i < result.data.length;i++) {
          if(this.reportCommentList[result.data[i].id] == 1) {
            continue;
          }
          if(result.data[i].onlyauth == 1 && (!this.state.user || (this.state.user.id != this.article.userid && this.state.user.id != result.data[i].userid))) {
            continue;
          }
          commentList.push(result.data[i])
        }
         this.setState({
          commentList:commentList
         })
      }
    } catch (error) {
      console.log(error)
    }
  }

  changeSort = async(sort) => {
    if(sort == this.state.sort) {
      return;
    }
    this.setState({
      sort:sort
    },async() => {
      if(sort == '最新' || sort == '最热') {
        this.getComment();
      } else if(sort == '推+数'){
        this.getPushs();
      }
    })
    
  }

  onDelComment = (commentid) => {
    let commentList = this.state.commentList;
    for(let i = 0;i < commentList.length;i++) {
      if(commentList[i].id == commentid) {
        commentList.splice(i,1);
        break;
      }
    }
    this.setState({
      commentList:commentList
    })
  }

  getArticleRemark = async() => {
    try {
      const result = await Request.post('getArticleRemark',{
        articleid:this.article.id,
      });
      if(result.code == 1) {
         let article = this.article;
         article.like = result.data.like;
         article.dislike = result.data.dislike;
         article.good = result.data.good;
         article.bad = result.data.bad;
         this.setState({
          article:article
         })
      }
    } catch (error) {
      
    }
  }

  getContent = async() => {
    try {
      const result = await Request.post('getArticleContent',{
        contentid:this.article.content,
        articleid:this.article.id,
        articletitle:this.article.title,
        userid:this.state.user?this.state.user.id : '-1', //未登录
        username:this.state.user?this.state.user.name : '', //未登录
        articleuserid:this.article.userid,
        pushuserid:this.pushuserid
      });
      if(result.code == 1) {
         this.setState({
          articlecontent:result.data
         })
      }
    } catch (error) {
      
    }
  }

  componentWillUnmount() {
    this.stop();
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
    if(this.props.navigation.state.params.updateCommentCount) {
      this.props.navigation.state.params.updateCommentCount(this.state.commentList.length);
    }
    
  }

  chooseImage = () => {
    const photoOptions = {
      title:'请选择',
      quality: 0.8,
      cancelButtonTitle:'取消',
      takePhotoButtonTitle:'拍照',
      chooseFromLibraryButtonTitle:'选择相册',
      allowsEditing: true,
      noData: false,
      storageOptions: {
          skipBackup: true,
          path: 'images'
      }
    };
    let that = this;
    this.commentinput.blur();
    ImagePicker.showImagePicker(photoOptions, (response) => {
      this.pickimage = true;
      if (response.didCancel) {
          
          that.commentinput.focus();
      }
      else if (response.error) {
          
      }
      else if (response.customButton) {
          
      }
      else {
        that.setState({imageurl: response.uri});
        that.commentinput.focus();
      }
  });
  }

  rewardArticle = () => {
    if(this.state.user != null) {
      if(this.state.user.id == this.article.userid) {
        Alert.alert('您不能给自己的文章打赏')
        return;
      }
      this.props.navigation.navigate('RewardScreen',{article:this.article,type:1,user:this.state.user});
    } else {
      Alert.alert('您尚未登录')
      return;
    }
  }

  report=()=> {

  }

  addMyremark = async(remark) => {
    if(!this.state.user) {
      Alert.alert('您尚未登录')
      return;
    }
    let myremark = this.state.myremark;

    if(remark == 1 && myremark[0] == 1) {
      return;
    }
    if(remark == 2 && myremark[0] == 2) {
      return;
    }
    if(remark == 3 && myremark[1] == 1) {
      return;
    }
    if(remark == 4 && myremark[1] == 2) {
      return;
    }

    let article = this.state.article;
    let decreasecolumn = '';
    let increasecolumn = '';
    if(remark == 1) {
      if(myremark[0] == 2) {
        decreasecolumn = 'dislike';
        article.dislike = article.dislike - 1;
      }
      increasecolumn = 'like';
      myremark[0] = 1;
      article.like = article.like + 1;
    } else if(remark == 2) {
      if(myremark[0] == 1) {
        decreasecolumn = 'like';
        article.like = article.like - 1;
      }
      increasecolumn = 'dislike';
      myremark[0] = 2;
      article.dislike = article.dislike + 1;
    } else if(remark == 3) {
      if(myremark[1] == 2) {
        decreasecolumn = 'bad';
        article.bad = article.bad - 1;
      }
      myremark[1] = 1;
      increasecolumn = 'good';
      article.good = article.good + 1;
    } else if(remark == 4) {
      if(myremark[1] == 1) {
        decreasecolumn = 'good';
        article.good = article.good - 1;
      }
      myremark[1] = 2;
      increasecolumn = 'bad';
      article.bad = article.bad + 1;
    }
    this.setState({
      myremark:myremark,
      article:article
    })

    let data = {
      decreasecolumn:decreasecolumn,
      increasecolumn:increasecolumn,
      userid:this.state.user.id,
      articleid:this.state.article.id,
      like:myremark[0],
      good:myremark[1],
      articleuserid:this.state.article.userid
    }
    try {
      const result = await Request.post('remarkArticle',data);
      if(result.code == 1) {
        this.myremarklist[this.state.article.id] = myremark;
        AsyncStorage.setItem('myremarklist_' + this.state.user.id, JSON.stringify(this.myremarklist), function (error) {})
      }
      
    } catch (error) {
      console.log(error)
    }


  }

  render() {
    let comment = require('../../images/article/u1464.png')
    let write = require('../../images/article/write.png')
    let zhuanfa = require('../../images/article/u1462.png')
    let reward = require('../../images/article/u1463.png')
    let add = require('../../images/article/add.png')

    let up = require('../../images/article/up1.png')
    let uped = require('../../images/article/up2.png')
    let push = require('../../images/push.png');
    let deletepng = require('../../images/article/delete.png')
    
    const injectedJs = 'setTimeout(() => {window.ReactNativeWebView.postMessage(document.getElementById("content").clientHeight)},0)'
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
        
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={this.article.dirname} isLeftTitle={false} />
      <ScrollView 
        ref={(scrollview) => {
          this.scrollview = scrollview
        }}
        onScroll = {(event)=>{{
          this.scrollY = event.nativeEvent.contentOffset.y;//垂直滚动距离 
        }}}
        scrollEventThrottle = {200}
        style={{flex:1}}>
        <View style={{paddingHorizontal:15}}>
        <View style={{marginTop:20}}>
        <Text style={{fontSize:20,fontWeight:'bold',color:'#222',lineHeight:22}}>{this.state.article.title}</Text>
        </View>

        {this.article.level != 0 &&
        <TouchableOpacity onPress={this.goPerson} style={{marginTop:20,display:'flex',flexDirection:'row',height:36,alignItems:"center"}}>
          <Image style={{width:40,height:40,borderRadius:20}} source={{uri:baseimgurl+this.state.article.avatarUrl}}></Image>
          <View style={{flex:1,marginLeft:10,height:36,justifyContent:'space-between'}}>
            <Text style={{fontSize:14,color:Colors.TextColor,marginBottom:5,fontWeight:"bold"}}>{this.state.article.username}</Text>
            <Datetime style={{fontSize:12,color:Colors.GreyColor}} datetime={this.state.article.createdate}></Datetime>
          </View>
          <View style={{height:28}}>
            {this.article.level != 0 && (this.state.user == null || this.state.user.id != this.article.userid) &&
              <FocusBtn focususerid={this.article.userid}></FocusBtn>
            }
          </View>
        </TouchableOpacity>
        }
        <View style={{marginTop:30}}>
        {this.article.category == 1 &&
        <HTMLView
        value={this.state.articlecontent}
        stylesheet={styles}
        renderNode={this.renderNode}
        paragraphBreak={''}
        lineBreak={''}
        />
        }
        {this.article.category == 2 &&
          <View style={{flexDirection:'row',paddingVertical:10,alignItems:'center',}}>
          <TouchableWithoutFeedback onPress={this.audioPlay}>
              <View style={{alignItems:'center',flexDirection:'row',minWidth:80,width:this.article.audiolength*10,maxWidth:width*0.7,height:34,borderWidth:0.5,borderColor:'#eee',borderRadius:17}}>
                <Image source={this.state.audioPlayBg} style={{marginLeft:10,width:20,height:20}}></Image>
                <Text style={{marginLeft:10,fontSize:13,color:'black'}}>{this.article.audiolength + '"'}</Text>
              </View>
          </TouchableWithoutFeedback>
          <View style={{marginLeft:10,width:10,height:10,backgroundColor:'red',borderRadius:10}}></View>
          </View>
        }
        {false && this.state.articlecontent != null &&
        <WebView
						style={{
              	width: width-30,
              	height: this.state.height
						}}
						injectedJavaScript={injectedJs}
						automaticallyAdjustContentInsets={true}
						source={{html: '<div id="content">' + this.state.articlecontent + "</content>"}}
						scalesPageToFit={true}
						javaScriptEnabled={true}
						domStorageEnabled={true}
						scrollEnabled={false}
						onMessage={(event)=>{
              this.setState({height: +event.nativeEvent.data})
						}}
        />
        }

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:"center"}}>
        <Text style={{marginTop:10,fontSize:13,color:Colors.GreyColor}}>{this.state.article.view} 阅读</Text>

        <TouchableOpacity onPress={()=> {this.setState({reportArticleVisible:true})}} style={{width:30,height:40,alignItems:'flex-end',justifyContent:'center'}}>
            <View style={{alignItems:'center',justifyContent:'center',width:20,paddingVertical:px(3),borderRadius:3,backgroundColor:'#f3f3f3'}}>
            <AntDesign name='close' size={9} color={'#888'}/>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={{marginTop:20,fontSize:13,color:Colors.GreyColor,flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
          <View style={{flexDirection:"row"}}>
          <View style={{borderColor:'#e1e1e1',borderWidth:0.5,paddingVertical:7,paddingHorizontal:15,borderRadius:30}}>
          {!this.state.uped &&
            <TouchableOpacity onPress={()=>this.addUp(1,this.article.id)} style={{alignItems:'center',flexDirection:'row'}}>
              <AntDesign name='staro' size={18} color={'#fabb2d'}/>
              <Text style={{marginLeft:3,fontSize:12}}>收藏</Text>
            </TouchableOpacity>
          }
          {this.state.uped &&
          <TouchableOpacity onPress={()=>this.delUp(1,this.article.id)} style={{alignItems:'center',flexDirection:'row'}}>
            <AntDesign name='star' size={18} color={'#fabb2d'}/>
            <Text style={{marginLeft:3,fontSize:12}}>取消</Text>
          </TouchableOpacity>
          }
          </View>
          <View style={{marginLeft:10,borderColor:'#e1e1e1',borderWidth:0.5,paddingVertical:7,paddingHorizontal:15,borderRadius:30}}>
          <TouchableOpacity style={{alignItems:'center',flexDirection:'row'}}>
          <FontAwesome name='weixin' size={17} color={'#1fb922'}/>
            <Text style={{marginLeft:3,fontSize:12}}>微信</Text>
          </TouchableOpacity>
          </View>
          <View style={{marginLeft:10,borderColor:'#e1e1e1',borderWidth:0.5,paddingVertical:7,paddingHorizontal:15,borderRadius:30}}>
          <TouchableOpacity style={{alignItems:'center',flexDirection:'row'}}>
            <Image source={require('../../images/pyq.png')} style={{width:18,height:18}}></Image>
            <Text style={{marginLeft:3,fontSize:12}}>朋友圈</Text>
          </TouchableOpacity>
          </View>
          </View>
        </View>
            
        </View>

        <View style={{flexDirection:"row",marginTop:20,flexWrap:"wrap",justifyContent:"center"}}>
          <TouchableOpacity onPress={()=>{this.addMyremark(1)}} 
          style={[this.state.myremark[0] == 1?{backgroundColor:"#fecd36"}:{backgroundColor:"#eee"},{marginTop:5,paddingVertical:7,paddingHorizontal:12,borderRadius:15}]}>
            <Text style={this.state.myremark[0] == 1?{fontSize:12,color:'black'}:{fontSize:12,color:'#333'}}>喜欢{this.state.article.like > 0 ? '(' + this.state.article.like + ')':''}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>{this.addMyremark(2)}} 
          style={[this.state.myremark[0] == 2?{backgroundColor:"#fecd36"}:{backgroundColor:"#eee"},{marginTop:5,marginLeft:10,paddingVertical:7,paddingHorizontal:12,borderRadius:15}]}>
            <Text style={this.state.myremark[0] == 2?{fontSize:12,color:'black'}:{fontSize:12,color:'#333'}}>不喜欢{this.state.article.dislike > 0 ? '(' + this.state.article.dislike + ')':''}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>{this.addMyremark(3)}} 
          style={[this.state.myremark[1] == 1?{backgroundColor:"#fecd36"}:{backgroundColor:"#eee"},{marginTop:5,marginLeft:10,paddingVertical:7,paddingHorizontal:12,borderRadius:15}]}>
            <Text style={this.state.myremark[1] == 1?{fontSize:12,color:'black'}:{fontSize:12,color:'#333'}}>利好{this.state.article.good > 0 ? '(' + this.state.article.good + ')':''}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>{this.addMyremark(4)}} 
          style={[this.state.myremark[1] == 2?{backgroundColor:"#fecd36"}:{backgroundColor:"#eee"},{marginTop:5,marginLeft:10,paddingVertical:7,paddingHorizontal:12,borderRadius:15}]}>
            <Text style={this.state.myremark[1] == 2?{fontSize:12,color:'black'}:{fontSize:12,color:'#333'}}>利空{this.state.article.bad > 0 ? '(' + this.state.article.bad + ')':''}</Text></TouchableOpacity>

        </View>
        <View style={{marginTop:20,flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:25}} onPress={()=> {this.changeSort('最热')}}>
          <Text style={[this.state.sort =='最热'?{color:Colors.TextColor}:{color:"black"},{fontSize:15}]}>最热</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:25}} onPress={()=> {this.changeSort('最新')}}>
          <Text style={[this.state.sort =='最新'?{color:Colors.TextColor}:{color:"black"},{fontSize:15}]} >最新</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:25}} onPress={()=> {this.changeSort('推+数')}}>
          <Text style={[this.state.sort =='推+数'?{color:Colors.TextColor}:{color:"black"},{fontSize:15}]} >推+数</Text>
        </TouchableOpacity>
        </View>

        {( (this.state.sort =='推+数' && this.state.pushList.length == 0) || (this.state.sort !='推+数' && this.state.commentList.length == 0)) &&
          <View ref={(empty) => {
            this.empty = empty
          }} style={{paddingVertical:50,alignItems:'center'}}><Text style={{color:Colors.GreyColor}}>暂无内容</Text></View>
        }
        
        {this.state.sort != '推+数' &&
        <FlatList
        ref={(flatlist) => {
          this.flatlist = flatlist
        }}
          style={{ marginTop: 0 }}
          data={this.state.commentList}
          renderItem={
            ({ item }) => {
              return(
                <ComentinArticle report={this.report2} onDelComment={this.onDelComment} myUpedcomments={this.myUpedcomments} user={this.state.user} comment={item} article={this.article}></ComentinArticle>
              )
            }
          }
          ItemSeparatorComponent={this._separator}
          keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
        />
        }
        {this.state.sort == '推+数' &&
        <FlatList
        ref={(flatlist) => {
          this.flatlist = flatlist
        }}
          style={{ marginTop: 0 }}
          data={this.state.pushList}
          renderItem={
            ({ item }) => {
              return(
                <PushinArticle user={this.state.user} push={item} article={this.article}></PushinArticle>
              )
            }
          }
          ItemSeparatorComponent={this._separator}
          keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
        />
        }
        
        </View>
      </ScrollView>

      
      <View style={{display:this.state.writefocus?'none':'flex',width:width,height:px(96),flexDirection:'row',borderTopColor:"#eee",borderTopWidth:0.5,alignItems:'center',paddingHorizontal:15,justifyContent:'space-between'}}>
        <TouchableWithoutFeedback onPress={()=>{this.setState({writefocus:true},()=> {this.commentinput.focus()})}}>
        <View style={{paddingLeft:30,flex:1,height:px(72),backgroundColor:'#f7f7f7',borderRadius:5,marginRight:20,borderColor:'#eee',borderWidth:0.5,justifyContent:"center"}}>
          <Text style={{color:'#222',fontWeight:'normal'}}>写评论...</Text>
        </View>
        </TouchableWithoutFeedback>
      <View style={{flexDirection:'row',paddingRight:10,alignItems:'center'}}>

        <TouchableOpacity onPress={()=>{this.scrollToFlatlist()}} style={{alignItems:'center'}}>
          <Feather name='message-square' size={26} color={'black'}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.props.navigation.navigate('PushScreen',{article:this.article,pushuserid:this.pushuserid})}} style={{marginLeft:20,alignItems:'center'}}>
          <Image source={push} resizeMode='stretch' style={{width:26,height:26}}></Image>
          <Text style={{display:'none',fontWeight:'bold',fontSize:0,color:"#000"}}>推</Text>
        </TouchableOpacity>
        {this.state.commentList.length > 0 && 
        <TouchableOpacity onPress={()=>{this.scrollToFlatlist()}} style={{position:'absolute',left:13,top:0,height:14,paddingHorizontal:3,minWidth:14,backgroundColor:'#fc0d1b',borderRadius:14,justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:10,color:'white'}}>{this.state.commentList.length}</Text>
        </TouchableOpacity>
        }
        
      </View>
      
      <Image source={write} resizeMode='stretch' style={{top:11,left:20,position:'absolute',width:22,height:22}}></Image>
      </View>
  
        <TouchableWithoutFeedback onPress={()=> {this.commentinput.blur(),this.setState({writefocus:false})}}>
        <View style={{display:this.state.writefocus?'flex':'none',position:this.state.writefocus?'absolute':'relative',backgroundColor:'rgba(0,0,0,0)',zIndex:99,width:width,height:height}}>
        </View>
        </TouchableWithoutFeedback>
        <Animated.View
        style={{zIndex:100,display:this.state.writefocus?'flex':'none',marginBottom:this.state.keyboardHeight,flexDirection:'column',
        backgroundColor:'white',borderTopColor:'#eee',borderTopWidth:0.5,paddingVertical:12,paddingHorizontal:15}}>
            <View style={{flexDirection:"row",width:'100%',alignItems:"center"}}>
              <View style={{flex:1,height:px(140),paddingHorizontal:px(20),paddingVertical:px(10),borderRadius:3,backgroundColor:"#f7f7f7",borderColor:'#eee',borderWidth:0.5}}>
              <TextInput value={this.state.commentcontent} onChangeText = {(commentcontent) => this.setState({commentcontent})} placeholder="发表你的评论，最多50字" maxLength={50} multiline={true} underlineColorAndroid="transparent" ref={commentinput => this.commentinput = commentinput} 
              style={{flex:1,textAlignVertical: 'top'}}/>
              </View>
              {(this.state.commentcontent == '') && 
              <View style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.GreyColor,fontSize:px(32),fontWeight:'bold'}}>发布</Text>
              </View>
              } 
              {(this.state.commentcontent != '') && 
              <TouchableOpacity onPress={()=>{this.addComment()}} style={{marginLeft:10,width:px(70),alignItems:'center'}}>
                <Text style={{color:Colors.TextColor,fontSize:px(32),fontWeight:'bold'}}>发布</Text>
              </TouchableOpacity>
              } 
              
            </View>

            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:"center"}}>
              {(this.state.imageurl == null || this.state.imageurl == '') &&
              <TouchableOpacity onPress={this.chooseImage} style={{marginTop:7,backgroundColor:"#f7f7f7",width:px(100),height:px(100),alignItems:'center',justifyContent:"center"}}>
                <Image source={add} style={{width:px(54),height:px(54)}}></Image>
              </TouchableOpacity>
              }
              {this.state.imageurl != null && this.state.imageurl != '' &&
              <View style={{marginTop:7,backgroundColor:"#f7f7f7",width:px(100),height:px(100),alignItems:'center',justifyContent:"center"}}>
              <Image source={{uri:this.state.imageurl}} style={{width:px(100),height:px(100)}}></Image>
                <TouchableOpacity onPress={()=> {this.setState({imageurl:null})}} style={{alignItems:'center',justifyContent:'center',position:'absolute',backgroundColor:'rgba(0,0,0,0.6)',top:-px(10),right:-px(10),borderRadius:px(18),width:px(36),height:px(36)}}>
                  <Image style={{width:px(20),height:px(20)}} source={deletepng}></Image>
                </TouchableOpacity>
              </View>
              }
              <View>
                <TouchableOpacity onPress={this.onlyauthClick} style={{justifyContent:"flex-end",marginRight:10,marginTop:15,flexDirection:'row',alignItems:"center"}}>
                  <View style={this.state.onlyauth == 0 ?styles.unselectwrap:styles.selectwrap}>
                    <View style={this.state.onlyauth == 0 ?styles.unselectinner:styles.selectinner}></View>
                  </View>
                  <Text style={{marginLeft:10,fontSize:14,color:'#666'}}>仅帖子作者可见</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            
        </Animated.View>
        
      
        {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}




        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.reportArticleVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({reportArticleVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white"}}>
            <TouchableWithoutFeedback>
            <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
              <AntDesign name='warning' size={16} color={'black'}/>
              <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>举报</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('低俗色情')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>低俗色情</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('虚假欺诈')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>虚假欺诈</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('暴恐涉政')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>暴恐涉政</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportArticle('涉及违禁品')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>涉及违禁品</Text>
            </View>
            </TouchableWithoutFeedback>

            </View>
          </View>
        </TouchableWithoutFeedback>
        </Modal>

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.reportVisible}
        >
       <TouchableWithoutFeedback onPress={() => {this.setState({reportVisible:false})}}>
          <View style={[this.props.style,{top:0,left:0,backgroundColor:'rgba(0,0,0,0.4)',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}]}>
            <View style={{width:width - 80,borderRadius:5,backgroundColor:"white"}}>
            <TouchableWithoutFeedback>
            <View style={{paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
              <AntDesign name='warning' size={16} color={'black'}/>
              <Text style={{marginLeft:5,color:'black',fontSize:15,fontWeight:'bold',textAlign:'center'}}>举报</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportComment('低俗色情')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>低俗色情</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportComment('虚假欺诈')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>虚假欺诈</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportComment('暴恐涉政')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>暴恐涉政</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportComment('涉及违禁品')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>涉及违禁品</Text>
            </View>
            </TouchableWithoutFeedback>

            </View>
          </View>
        </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  h3:{
    fontSize:font*1.3,
    lineHeight:font*2.2,
    color:'black'
  },
  p:{
    fontSize:font*1.3,
    paddingBottom:1*font,
    lineHeight:font*2.2,
    color:'black'
  },
  div:{
    fontSize:font*1.3,
    paddingBottom:1*font,
    lineHeight:font*2.2,
    color:'black'
  },
  h5:{
    fontSize:font*1.3,
    paddingBottom:1*font,
    lineHeight:font*2.2,
  },
  h2:{
    fontSize:font*1.5,
    fontWeight:'bold',
    paddingBottom:1*font,
    lineHeight:font*2.2,
    color:'black'
  },
  img:{
    maxWidth:width-30,
    width:width-30
  },
  unselectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:"#999",
    width:17,
    height:17,
    
  },
  selectwrap:{
    marginLeft:5,
    borderWidth:1,
    borderColor:Colors.TextColor,
    width:17,
    height:17,
    alignItems:'center',
    justifyContent:"center"
  },
  unselectinner:{

  },
  selectinner:{
    width:11,
    height:11,
    backgroundColor:Colors.TextColor
  },
});

const topStyles = StyleSheet.create({
  androidTop: {
    width: px(750),
    height: STATUSBAR_HEIGHT,
  },  
  topBox: {
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
  footerBox:{
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 34 : 0
  }
})
