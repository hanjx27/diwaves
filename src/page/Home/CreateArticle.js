import React, { Component } from 'react';
import {Alert,Image,FlatList,StatusBar,NativeModules,PanResponder,ActivityIndicator,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableNativeFeedback,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import {baseurl,baseimgurl} from '../../utils/Global'
import ImagePicker from 'react-native-image-picker';
import { Request } from '../../utils/request';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {Colors} from '../../constants/iColors';
export default class CreateArticle extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    this.draft = this.props.navigation.getParam('draft');
    
    this.config = {
        format_inactive_color: 'black',
        format_active_color: 'red',
        format_unable_color:'#aaa'
    }
    
    this.issuevalid = false
    this.state = {
        user:null,
        uploading:false,
        uploadingText:'正在上传中...',
        dirchooseVisible:'none',
        dirchooseposition:'relative',
        dir1:'',
        dir2:'',
        dir3:'',
        choosendir:'选择发布目录',
        choosendirid:null,

        seconddir: null,
        thirddir:null,
       
        issuevalid:false,
        keyboardHeight:new Animated.Value(0),
        //B  I  U  Head  Qoute  Image   undo  redo
        format_btns:[{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        },{
            color:this.config.format_inactive_color
        }]
    }
  }
  

  

  componentWillMount = async() => {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);

    const CommonValue = {
      dxNum :3,
      x0Num :100
    }
    this._pinchResponder = PanResponder.create({
      /**
       * 在每一个触摸点开始移动的时候，再询问一次是否响应触摸交互
       * 需要注意，当水平位移大于30时，才进行后面的操作，不然可能是点击事件
       * @param evt
       * @param gestureState
       * @returns {boolean}
       */
      onMoveShouldSetPanResponder(evt, gestureState){
         
          if (gestureState.dx > CommonValue.dxNum)
              return true;
          else
              return false;
      },
      onPanResponderRelease: (evt, gestureState) => {
       
          if (gestureState.x0 > CommonValue.x0Num){
              this.props.navigation.goBack();
          }
      }
    })
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
  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    this.setState({
      user:JSON.parse(user)
    })


    const dirs = await AsyncStorage.getItem('dirs'); //不增加userid后缀
    this.dirs = JSON.parse(dirs)
    /*if(!this.subtab_caijing) {
      const subtab_caijing = await AsyncStorage.getItem('subtab_caijing'); //不增加userid后缀
      this.subtab_caijing = JSON.parse(subtab_caijing)
    }
    if(!this.subtab_tiyu) {
      const subtab_tiyu = await AsyncStorage.getItem('subtab_tiyu'); //不增加userid后缀
      this.subtab_tiyu = JSON.parse(subtab_tiyu)
    }
    if(!this.subtab_hot) {
      const subtab_hot = await AsyncStorage.getItem('subtab_hot'); //不增加userid后缀
      this.subtab_hot = JSON.parse(subtab_hot)
    }*/

    if(this.draft != null) {
      
      this.setState({
        choosendir:this.draft.dirname,
        choosendirid:this.draft.dir,
      })
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
    
  }

  onLoadEnd = (e) => {
    //let baseimgurl = "width:" + baseimgurl;
    this.inweb && this.inweb.postMessage("baseimgurl:" + baseimgurl);//发送消息到H5
    if(this.draft != null) {
      this.inweb && this.inweb.postMessage("initdraft:" + JSON.stringify(this.draft));//发送消息到H5
    }
  };

  formatClick = (index) => {
       //B  I  U  Head  Qoute  Image   undo  redo
    if(index != 5) {
        if(index <= 2) {
            let format_btns = this.state.format_btns
            format_btns[index].color = format_btns[index].color == this.config.format_active_color ? this.config.format_inactive_color : this.config.format_active_color
            this.setState({
                format_btns:format_btns
            })
        }
        
        this.inweb && this.inweb.postMessage(index);
    } else { //选择图片
      //this.inweb && this.inweb.postMessage(index + ":d2e3130e91bf4b679e999f0576beb321.jpg");
      //return;
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
      ImagePicker.showImagePicker(photoOptions, async (response) => {
        this.pickimage = true;
        if (response.didCancel) {
        }
        else if (response.error) {
           
        }
        else if (response.customButton) {
        }
        else {
          const result = await that.uploadImage(response.uri);
          //that.setState({imageurl: response.uri});
          if(result != null&& result.path) {
            this.inweb && this.inweb.postMessage(index + "$" + baseimgurl + result.path);
          }
        }
    });
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
      console.log(error)
    }
    return result;
  }

  selectfirstDir=(title)=> {
  
    let seconddir = null;
    let thirddir = null;
    for(let i = 0;i < this.dirs.length;i++) {
      if(title == this.dirs[i].title) {
        seconddir = this.dirs[i].subdirs
      }
    }

    this.setState({
      seconddir:seconddir,
      thirddir:thirddir,
      dir1:title,
      dir2:'',
      dir3:'',
      choosendir:title,
      choosendirid:null
    })
  }
  selectsecondDir=(title) => {
  
      let thirddir = null;
      for(let i = 0;i < this.state.seconddir.length;i++) {
        if(title == this.state.seconddir[i].title) {
          thirddir = this.state.seconddir[i].subdirs;
          break;
        }
      }
      this.setState({
        thirddir:thirddir,
        dir2:title,
        dir3:'',
        choosendir:this.state.dir1 + '/' + title
      })
  }

  selectthirdDir=(item) => {
    this.setState({
      thirddir:this.state.thirddir,
      dir3:item.title,
      dirchooseposition:"relative",
      dirchooseVisible:'none',
      choosendir:this.state.dir1 + '/' + this.state.dir2 + '/' + item.title,
      choosendirid:item.id
    })
  }

  saveArticle = () => {
    if(this.state.user == null) {
      Alert.alert('去登录')
      return;
    }
    if(this.state.user.phone == null || this.state.user.phone == '') {
      Alert.alert('您尚未绑定手机号，请前去设置-编辑资料中绑定手机号')
      return;
    }
    if(!this.state.choosendirid) {
      Alert.alert('请选择三级发表目录')
      return;
    }

    this.inweb && this.inweb.postMessage("save:" + this.state.user.id + ":" + this.state.choosendirid + ":" + this.state.choosendir);
  }

  saveDraft = () => {
    if(this.state.user == null) {
      Alert.alert('去登录')
      return;
    }
    this.inweb && this.inweb.postMessage("draft:" + this.state.user.id + ":" + (this.state.choosendirid?this.state.choosendirid:-1) + ":" + (this.state.choosendir?this.state.choosendir:''));
  }

  rightBtn = () => {
    return (
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <TouchableOpacity onPress={() => {this.saveDraft()}}>
        <Text style={{color:'#017bd1',fontSize:16}}>存草稿</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>{this.saveArticle()}}  style={{marginLeft:10}}>
        <Image style={{width:28,height:28}} source={require('../../images/home/issue/issue_active.png')}></Image>
      </TouchableOpacity>
    </View>
    )
  }
  render() {
    let forbidtext = '';
    if(!this.state.user) {
      forbidtext = '您尚未登录，请先登录';
    } else if(!this.state.user.phone) {
      forbidtext = '您尚未绑定手机号，请前去设置-编辑资料中绑定手机号';
    }
    let down = require('../../images/home/issue/u84.png')
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
        
      <View style={{display:this.state.uploading?'flex':'none',position:this.state.uploading?'absolute':'relative',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}}>
          <View style={{width:px(200),height:px(200),borderRadius:5,backgroundColor:"rgba(0,0,0,0.8)",alignItems:'center',justifyContent:"center"}}>
            <ActivityIndicator  color='white'/>
            <Text style={{marginTop:5,color:'white',fontSize:11}}>{this.state.uploadingText}</Text>
          </View>
      </View>

      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <TouchableWithoutFeedback onPress={() => {this.setState({dirchooseVisible:'none',dirchooseposition:'relative'})}}>
      <View style={{display:this.state.dirchooseVisible,zIndex:999,position:this.state.dirchooseposition,marginTop:isIphoneX?42+80:80+STATUSBAR_HEIGHT,backgroundColor:'rgba(0,0,0,0.3)',width:width,height:height}}>
        <View  style={{width:width,backgroundColor:'#f8f8f8',flexDirection:'row',height:height*0.6}}>
          <TouchableWithoutFeedback>
          <View style={[this.state.thirddir?{width:100}:{width:100},{alignItems:'center',backgroundColor:"#f3f3f3"}]}>
            <TouchableOpacity onPress={() => this.selectfirstDir('财经')} style={{zIndex:999,marginTop:20,width:80,alignItems:'center',justifyContent:'center'}}><Text style={this.state.dir1 == '财经'?{color:'#017bd1'}:{color:'#333'}}>财经</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => this.selectfirstDir('体育')} style={{display:'none',zIndex:999,marginTop:20,width:80,alignItems:'center',justifyContent:'center'}}><Text style={this.state.dir1 == '体育'?{color:'#017bd1'}:{color:'#333'}}>体育</Text></TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>

          {this.state.seconddir && 
          <TouchableWithoutFeedback>
          <View style={[this.state.thirddir?{width:100}:{width:100},{alignItems:'center',backgroundColor:"#f8f8f8"}]}>
          {this.state.seconddir.map(item => {
                  return (
                    <TouchableOpacity onPress={()=> this.selectsecondDir(item.title)} style={{marginTop:20,width:80,alignItems:'center',justifyContent:'center'}}>
                      <Text style={this.state.dir2 == item.title?{color:'#017bd1'}:{color:'#333'}}>{item.title}</Text>
                    </TouchableOpacity>
                  )
          })}
          </View>
          </TouchableWithoutFeedback>
          }

          {this.state.thirddir && 
          <TouchableWithoutFeedback>
          <View style={{flex:1,backgroundColor:'white',alignItems:'center',paddingHorizontal:10,paddingBottom:10}}>
            <FlatList
              extraData={this.state.dir3}
              showsVerticalScrollIndicator = {false}
              data={this.state.thirddir}
              renderItem={
                ({ item }) => {
                  return (
                    <TouchableOpacity onPress={()=> this.selectthirdDir(item)} style={{marginTop:20}}>
                      <Text style={this.state.dir3 == item.title?{color:'#017bd1'}:{color:'#333'}}>{item.title}</Text>
                    </TouchableOpacity>
                  )
                }
              }
              ItemSeparatorComponent={this._separator}
            />
          </View>
          </TouchableWithoutFeedback>
          }
        </View>
        </View>
        </TouchableWithoutFeedback>

      <Header title='写帖子' isLeftTitle={false} rightBtn={this.rightBtn()} />
      {(!this.state.user || !this.state.user.phone) &&
        <View style={{width:width,backgroundColor:'#fd676a',alignItems:'center',paddingVertical:5}}>
          <Text style={{color:'white',fontSize:12,fontWeight:'bold'}}>{forbidtext}</Text>
        </View>
      }
      <View style={{zIndex:99}}>
      <TouchableOpacity  onPress={()=>{if(this.state.dirchooseVisible == 'flex') {this.setState({dirchooseVisible:'none',dirchooseposition:"relative"})} else {this.setState({dirchooseVisible:'flex',dirchooseposition:"absolute"})}}} 
        style={{borderBottomWidth:0.5,width:width,borderBottomColor:'#eee',paddingHorizontal:20,height:40,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={{color:'#333',marginRight:10,flex:1}} numberOfLines={1} ellipsizeMode='tail'>{this.state.choosendir}</Text>
          <Image source={down} style={{width:20,height:12}}></Image>
        </TouchableOpacity>
      </View>

      <WebView 
        ref={(webview) => {
            this.inweb = webview
        }}
        dataDetectorTypes='none'
        onLoadEnd={this.onLoadEnd}
        source={{uri:baseurl + 'demo.html',headers: { 'Cache-Control':'no-cache'}}}
        originWhitelist={['*']}
        style={{flex:1,backgroundColor:'rgba(255, 255, 255, 0.0)'}}
        mixedContentMode='always'
        onMessage={async(e) => {
          let data = e.nativeEvent.data
          try {
            data = decodeURIComponent(decodeURIComponent(e.nativeEvent.data))
          } catch(e) {

          }
            
            /*if(Platform.OS === 'ios') {
              data = decodeURIComponent(decodeURIComponent(e.nativeEvent.data))
            } else {

            }*/

            let obj = JSON.parse(data)
            if(obj.type == 'format_btn') {
                let array = obj.data
                let format_btns = this.state.format_btns
                for(let i = 0;i < array.length;i++) {
                    format_btns[i].color = array[i] == 0 ? this.config.format_inactive_color : this.config.format_active_color
                }
                if(array[3] == 1) {
                    format_btns[0].color = this.config.format_unable_color
                    format_btns[1].color = this.config.format_unable_color
                    format_btns[2].color = this.config.format_unable_color
                }
                this.setState({
                    format_btns:format_btns
                })
            } else if(obj.type == 'warning') {
              this.setState({
                uploading:false
              })
              Alert.alert(obj.data);
              return;
            } else if(obj.type == 'uploading') {
              this.setState({uploading:true,uploadingText:'正在上传中...'})
            } else if(obj.type == 'save_success') {
              let that = this;
              setTimeout(() => {
                that.props.navigation.goBack()
              },1000)
              
            } else if(obj.type == 'draft_success') {
              const toastOpts = {
                data: '已保存草稿',
                textColor: '#ffffff',
                backgroundColor: Colors.TextColor,
                duration: 1000, //1.SHORT 2.LONG
                position: WToast.position.BOTTOM, // 1.TOP 2.CENTER 3.BOTTOM
              }
              WToast.show(toastOpts)

              /*const drafts = await AsyncStorage.getItem('drafts_' + this.state.user.id);
              if(drafts != null) {
                let json = JSON.parse(drafts);
                json.push(obj.data)
                AsyncStorage.setItem('drafts_' + this.state.user.id,JSON.stringify(json))
              } else {
                let json = [];
                json.push(obj.data)
                AsyncStorage.setItem('drafts_' + this.state.user.id,JSON.stringify(json))
              }*/
            }
            
          }}
      >
      </WebView>

        <Animated.View style={{marginBottom:this.state.keyboardHeight,flexDirection:'row',backgroundColor:'white',borderTopColor:'#eee',borderTopWidth:0.5,height:45}}>
            <ScrollView style={{width:width,height:45}} horizontal={true}>
            {this.state.format_btns[0].color == this.config.format_unable_color &&
            <View onPress={()=> {this.formatClick(0)}} style={[styles.format_btn]}>
                <Feather name='bold' size={20} color={this.state.format_btns[0].color}/>
            </View>
            }
            {this.state.format_btns[0].color != this.config.format_unable_color &&
            <TouchableOpacity onPress={()=> {this.formatClick(0)}} style={[styles.format_btn]}>
                <Feather name='bold' size={20} color={this.state.format_btns[0].color}/>
            </TouchableOpacity>
            }

            {this.state.format_btns[1].color == this.config.format_unable_color &&
            <View onPress={()=> {this.formatClick(1)}} style={[styles.format_btn]}>
                <Feather name='italic' size={20} color={this.state.format_btns[1].color}/>
            </View>
            }
            {this.state.format_btns[1].color != this.config.format_unable_color &&
            <TouchableOpacity onPress={()=> {this.formatClick(1)}} style={[styles.format_btn]}>
                <Feather name='italic' size={20} color={this.state.format_btns[1].color}/>
            </TouchableOpacity>
            }

            {this.state.format_btns[2].color == this.config.format_unable_color &&
            <View onPress={()=> {this.formatClick(2)}} style={[styles.format_btn]}>
                <Feather name='underline' size={20} color={this.state.format_btns[2].color}/>
            </View>
            }
            {this.state.format_btns[2].color != this.config.format_unable_color &&
            <TouchableOpacity onPress={()=> {this.formatClick(2)}} style={[styles.format_btn]}>
                <Feather name='underline' size={20} color={this.state.format_btns[2].color}/>
            </TouchableOpacity>
            }
           
            <TouchableOpacity onPress={()=> {this.formatClick(3)}} style={[styles.format_btn]}>
                <Icon name='format-header-increase' size={26} color={this.state.format_btns[3].color}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> {this.formatClick(4)}} style={[styles.format_btn]}>
                <Entypo name='quote' style={{marginTop:Platform.OS === 'ios'?-5:0,transform: [{rotateZ: "180deg"}]}} size={21} color={this.state.format_btns[4].color}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> {this.formatClick(5)}} style={[styles.format_btn]}>
                <Feather name='image' size={22} color={this.state.format_btns[5].color}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> {this.formatClick(6)}} style={[styles.format_btn]}>
              <Feather name='corner-up-left' size={23} color={this.state.format_btns[5].color}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> {this.formatClick(7)}} style={[styles.format_btn]}>
              <Feather name='corner-up-right' size={23} color={this.state.format_btns[5].color}/>
            </TouchableOpacity>
            </ScrollView>
        </Animated.View>
        
        {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}
      </View>
    );
  }
}

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

const styles = StyleSheet.create({
    format_btn:{
        width:45,
        height:45,
        justifyContent:'center',
        alignItems:'center'
    },
  shadow: {
    ...Platform.select({
      ios: {
        /* shadowColor: 'black',
        
        shadowOffset: { height: -3 },
        shadowOpacity: 0.7,
        shadowRadius: 3, */
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
          width: 0,
          height: 0.5
        },
        shadowRadius: 5,
        shadowOpacity: 1
      },
      android: {

      },
    })
  }
});