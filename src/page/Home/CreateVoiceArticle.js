import React, { Component } from 'react';
import {ToastAndroid,Alert,Image,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,ActivityIndicator,TouchableWithoutFeedback,Animated,BackHandler} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView, TextInput } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import { Request } from '../../utils/request';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Colors from '../../constants/iColors';
import Sound from 'react-native-sound';
import {BoxShadow} from 'react-native-shadow'
///由于试听时需要调用record的stop函数，试听后不能断电续录，因此试听后重置文件
////本期先不做断点继录，如果有需要，可以每次试听后录新文件，上传到后台后合并所有音频文件
export default class CreateVoiceArticle extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  
  constructor(props) {
    super(props);
    this.lock = 0;
    
   
    this.sound = null;
    this.subtab_caijing = this.props.navigation.getParam('subtab_caijing');
    this.subtab_tiyu = this.props.navigation.getParam('subtab_tiyu');
    this.subtab_hot = this.props.navigation.getParam('subtab_hot');

    this.state = {
        dirchooseVisible:'none',
        dirchooseposition:'relative',
        dir1:'',
        dir2:'',
        dir3:'',
        choosendir:'选择发布目录',
        choosendirid:null,
        seconddir: null,
        thirddir:null,

        recordstate:0, // 0:未开始  1:录制中  2:暂停   3:结束 本次没有暂停
        currentTime: 0,//

        currentMinute:"00",
        currentSecond:'00',
        currentMillisecond:'.00',

        play: 0, // 0：未播放  1:播放中  2:暂停

        duration: 0,//总时长
        hasPermission: undefined,
        recordtext:'开始',
        title:'',

        user:null,

        uploading:false
    }
  }

  componentWillMount() {
    
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress = () => {
    this._quitRandom();
    return false;
  }
  componentDidMount= async() => {
    
    const user = await AsyncStorage.getItem('user');
    this.setState({
      user:JSON.parse(user)
    })

    let dirs = RNFetchBlob.fs.dirs;
    if(!await RNFS.exists(dirs.DocumentDir + "/Music/")) {
      console.log('no dir')
      await RNFS.mkdir(dirs.DocumentDir + "/Music/");
    }

    this.audioname = new Date().getTime() + ".aac";
    this.audioPath = dirs.DocumentDir + "/Music/" + this.audioname;
    

    /*let url = 'http://www.hongtongtech.com/IComment/upload/1579708624584.aac';
    let whoosh = new Sound(url, Sound.MAIN_BUNDLE, err => {
      if(err) {
        return console.log(err)
      }
      whoosh.play(success =>{
        if(success) {
          console.log('远程文件播放成功')
        }else {
          console.log('远程文件播放失败')
        }
      })
    })*/

    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        AudioRecorder.requestAuthorization().then((isAuthorised) => {
            this.setState({hasPermission: isAuthorised});

            if (!isAuthorised) return;
          
            console.log(this.audioPath)
            try {
            let prepared = AudioRecorder.prepareRecordingAtPath(this.audioPath, {
              SampleRate: 22050,
              Channels: 1,
              AudioQuality: "Low",
              AudioEncoding: "aac"
            });
            } catch(e) {
              Alert.alert(e)
            }
            

            AudioRecorder.onProgress = (data) => {
                
                let currentTime = data.currentTime + "";
                let index = currentTime.indexOf('.')
                let currentMillisecond = currentTime.substring(index,index + 2) + parseInt(Math.random()*9);

                this.setState({currentTime: Math.floor(data.currentTime),currentMillisecond:currentMillisecond});

            };

            AudioRecorder.onFinished = (data) => {
                console.log("data" + JSON.stringify(data));
                if (Platform.OS === 'ios') {
                    //this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
                }
            };
        });
  }

  record = async() => {
    
    if (!this.state.hasPermission) {
      ToastAndroid.show("无法录音，请授予权限", ToastAndroid.SHORT);
      console.log('Can\'t record, no permission granted!');
      return;
    }

    if (this.state.recordstate == 3) { //点击了结束，重置录音文件   本次录音完成不可点击，重录按钮调用的是reset方法
      
      AudioRecorder.prepareRecordingAtPath(this.audioPath2, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac"
      });
      try {
        const filePath = await AudioRecorder.startRecording();
        this.setState({recordstate:1,recordtext:"正在录制",currentTime: 0});
      } catch (error) {
        Alert.alert(
          '录音设备被占用',
          '请重试',
          [
            {text: '确定'},
          ],
          { cancelable: false }
        )
      }
    } else if(this.state.recordstate == 0) { //未开始，点击开始
      try {
        let that = this;
        const filePath = await AudioRecorder.startRecording();
        
        this.setState({recordstate:1,recordtext:"正在录制",currentTime: 0});
      } catch (error) {
        Alert.alert(
          '有其他设备正在使用录音',
          '请重试',
          [
            {text: '确定'},
          ],
          { cancelable: false }
        )
      }
    } else if(this.state.recordstate == 1) { //正在录制，点击结束
      try {
        await AudioRecorder.stopRecording();
        this.setState({recordstate:3,recordtext:"录制已暂停"});
      } catch (error) {
        console.error(error);
      }
    }/*else if(this.state.recordstate == 1) { //正在录制，点击暂停
      try {
        await AudioRecorder.pauseRecording();
        this.setState({recordstate:2,recordtext:"录制已暂停"});
      } catch (error) {
        console.error(error);
      }
    } else if(this.state.recordstate == 2) { //已暂停，点击开始
      try {
        await AudioRecorder.resumeRecording();
        this.setState({recordstate:1,recordtext:"正在录制"});
      } catch (error) {
        console.error(error);
      }
    }*/
  }
  
  uploadAudio = async() => {
    if(this.lock == 1)
      return null;

    if(this.state.recordstate != 3) {
      Alert.alert(
        '尚未录制完成',
        '',
        [
          {text: '确定'},
        ],
        { cancelable: false }
      )
      return null;
    }
    this.lock = 1;

    let formData = new FormData();
    let file = {uri: "file://" + this.audioPath, type: 'multipart/form-data', name: this.audioname};   
    formData.append("multipartFiles",file);

    try {
      const result = await Request.post3('uploadFile',formData,'formdata');
      //console.log(result)
      this.lock = 0;

      return result;
    } catch (error) {
      console.log(error)
      this.lock = 0;
      Alert.alert(
        '请求后台服务失败，请重试',
        '',
        [
          {text: '确定'},
        ],
        { cancelable: false }
      )
      return null;
    }
  }

  reset = async() => {
    if(this.state.recordstate == 0) {
      return;
    }
    if(this.state.play != 0 && this.sound != null) { //正在播放或者暂停
      this.sound.stop();
      this.sound.release();
      this.sound = null;
      this.setState({play:0})
    }
    if(this.state.recordstate == 1) {
      Alert.alert('正在录音', '确认重置吗？',
        [
            {
                text: "是", onPress: async() => {
                  try {
                    AudioRecorder.stopRecording()
                    AudioRecorder.prepareRecordingAtPath(this.audioPath, {
                      SampleRate: 22050,
                      Channels: 1,
                      AudioQuality: "Low",
                      AudioEncoding: "aac"
                    });
                    this.setState({recordstate:0,currentTime: 0,currentMillisecond:".00"});
                  } catch (error) {
                    console.error(error);
                  }
                }
            },
            {text: "否"}
        ])
    } else if(this.state.recordstate == 3) {
      Alert.alert('已经录音', '确认重置吗？',
        [
            {
                text: "是", onPress: async() => {
                  try {
                    AudioRecorder.prepareRecordingAtPath(this.audioPath, {
                      SampleRate: 22050,
                      Channels: 1,
                      AudioQuality: "Low",
                      AudioEncoding: "aac"
                    });
                    this.setState({recordstate:0,currentTime: 0,currentMillisecond:".00"});
                  } catch (error) {
                    console.error(error);
                  }
                }
            },
            {text: "否"}
        ])
    }
  }


  playCallBack = async(success) => {
    if(success) {
      this.sound.release();
      this.sound = null;
      this.setState({play:0});
      console.log('play success call')
    }else {
      console.log('播放失败')
    }
  }
  listen = async() => {
    /*let dirs = RNFetchBlob.fs.dirs;
    const path = this.audioPath;
    const play_path = dirs.DocumentDir + "/Music/" + new Date().getTime() + ".aac";
    RNFS.copyFile(path,play_path)
        .then((result) => {
            console.log("复制path路径文件",result);
        })
        .catch((err) => {
            console.log(err.message);
        })
      
    try {
      await AudioRecorder.stopRecording();
      this.setState({recordstate:3,recordtext:"录音结束"});
    } catch (error) {
      console.error(error);
    }*/
    /*if (this.state.recordstate == 1 || this.state.recordstate == 2) {
      try {
        await AudioRecorder.stopRecording();
        this.setState({recordstate:3,recordtext:"录音结束"});
      } catch (error) {
        console.error(error);
      }
    }*/
    if(this.state.play == 0) {
      this.sound = new Sound(this.audioPath, null, err => {
        if(err) {
          //Alert.alert(JSON.stringify(err))
          return console.log(JSON.stringify(err))
        }
        this.setState({play:1});
        this.sound.play(success =>{
          this.playCallBack(success);
        })
      })
    } else if(this.state.play == 1){ //播放中
      this.sound.pause();
      this.setState({play:2});
    } else if(this.state.play == 2){ //暂停中
      this.sound.play(success => {
        this.playCallBack(success);
      });
      this.setState({play:1});
    }
  }
  
  gobackfunction = async() => {
    if(this.sound != null) {
      try {
        this.sound.release();
        this.sound = null;
      } catch (error) {
        console.error(error);
      }
    }
    if(this.state.recordstate == 1) {
      try {
        await AudioRecorder.stopRecording();
      } catch (error) {
        console.error(error);
      }
    }
    this.props.navigation.goBack()
  }

  _quitRandom = async() => {
    if(this.sound != null) {
      try {
        this.sound.release();
        this.sound = null;
      } catch (error) {
        console.error(error);
      }
    }
  if (this.state.recordstate == 0) {
      return;
  } else if(this.state.recordstate == 1) {
    try {
      await AudioRecorder.stopRecording();
    } catch (error) {
      console.error(error);
    }
  }
}

selectfirstDir=(title)=> {
  
  let seconddir = null;
  let thirddir = null;
  if(title == '热点') {
    seconddir = this.subtab_hot;
  } else if(title == '财经') {
    seconddir = this.subtab_caijing;
  } else if(title == '体育') {
    seconddir = this.subtab_tiyu;
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
  
  if(this.state.dir1 == '热点') {
    this.setState({
      dir2:title,
      dirchooseposition:"relative",
      dirchooseVisible:'none',
      choosendir:this.state.dir1 + '/' + title,
      choosendirid:null
    })
  } else {
    let thirddir = null;
    for(let i = 0;i < this.state.seconddir.length;i++) {
      if(title == this.state.seconddir[i].title) {
        thirddir = this.state.seconddir[i].list;
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
  
  issue = async() => {
    if(this.state.user == null) {
      Alert.alert('去登录') // 跳转登录页面
      return;
    }

    if(!this.state.choosendirid) {
      Alert.alert('请选择发表目录')
      return;
    }

    if(this.state.title == '') {
      Alert.alert('请输入标题');
      return;
    }

    if(this.state.recordstate == 0) {
      Alert.alert('您尚未录音');
      return;
    }
    if(this.state.recordstate == 1) {
      Alert.alert('正在录音中，请先结束录音');
      return;
    }

    this.setState({
      uploading:true
    })

    const result = await this.uploadAudio();
    console.log(result)
    if(result != null && result.path) {
      try {
        const result2 = await Request.post('addArticle',{
          userid:this.state.user.id,
          title:this.state.title,
          content:'',
          dir:this.state.choosendirid,
          dirname:this.state.choosendir,
          pic:'',
          category:2,
          audiolength:this.state.currentTime,
          audiopath:result.path,
          contenttext:''
        });
        this.props.navigation.goBack()
      } catch (error) {
        Alert.alert('error' + result2)
      }
    } else {
      Alert.alert('error' + result)
    }

    this.setState({
      uploading:false
    })
  }



  rightBtn = () => {
    return (
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <TouchableOpacity onPress={this.issue} style={{marginLeft:10}}>
        <Image style={{width:28,height:28}} source={require('../../images/home/issue/issue_active.png')}></Image>
      </TouchableOpacity>
    </View>
    )
  }

  render() {
    let down = require('../../images/home/issue/u84.png')
    let play = require('../../images/home/issue/play.png')
    let play_pause = require('../../images/home/issue/play_pause.png')

    let play_red = require('../../images/home/issue/play_red.png')
    let pause_red = require('../../images/home/issue/pause_red.png')

    let reset = require('../../images/home/issue/reset.png')
    let reset_red = require('../../images/home/issue/reset_red.png')
    const shadowOpt = {
      width:width,
      height:px(90),
      color:"#a1a1a1",
      border:6,
      radius:2,
      opacity:0.2,
      x:2,
      y:2
    }

    console.log(this.state.uploading)
    return (
      <View style={{height:height,flexDirection:'column',backgroundColor: 'white'}}>

        <View style={{display:this.state.uploading?'flex':'none',position:this.state.uploading?'absolute':'relative',zIndex:9999,width:width,height:height,alignItems:'center',justifyContent:"center"}}>
          <View style={{width:px(200),height:px(200),borderRadius:5,backgroundColor:"rgba(0,0,0,0.8)",alignItems:'center',justifyContent:"center"}}>
            <ActivityIndicator  color='white'/>
            <Text style={{marginTop:5,color:'white',fontSize:11}}>正在发布中...</Text>
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
            <TouchableOpacity onPress={() => this.selectfirstDir('体育')} style={{zIndex:999,marginTop:20,width:80,alignItems:'center',justifyContent:'center'}}><Text style={this.state.dir1 == '体育'?{color:'#017bd1'}:{color:'#333'}}>体育</Text></TouchableOpacity>
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

      <Header title='语音贴' gobackfunction={() => {this.gobackfunction()}} isLeftTitle={true} rightBtn={this.rightBtn()} />
      <View style={{zIndex:99}}>
        <TouchableOpacity  onPress={()=>{if(this.state.dirchooseVisible == 'flex') {return false;this.setState({dirchooseVisible:'none',dirchooseposition:"relative"})} else {this.setState({dirchooseVisible:'flex',dirchooseposition:"absolute"})}}} 
        style={{borderBottomWidth:0.5,width:width,borderBottomColor:'#eee',paddingHorizontal:20,height:40,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={{color:'#333',marginRight:10,flex:1}} numberOfLines={1} ellipsizeMode='tail'>{this.state.choosendir}</Text>
          <Image source={down} style={{width:20,height:12}}></Image>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput value={this.state.title} onChangeText = {(title) => this.setState({title})} placeholder="请输入标题" style={{marginTop:20,height:50,width:width - 30,marginLeft:15,fontSize:20,fontWeight: 'bold',borderBottomColor:'#fc431d',borderBottomWidth:2}}>

        </TextInput>
      </View>

        {//录音界面
        }
      <View style={{flex:1,justifyContent:'center',alignItems:'center',paddingBottom:50}}> 

          <Text style={{transform: [{scaleY:1.1}],fontSize:45,color:'#444',fontWeight:'normal',marginBottom:20}}>
          {(Math.floor(this.state.currentTime / 60) <= 9 ? "0" + Math.floor(this.state.currentTime / 60):Math.floor(this.state.currentTime / 60)) +
            ":" +
            (this.state.currentTime % 60 <= 9 ? "0" + this.state.currentTime % 60:this.state.currentTime % 60)
            +this.state.currentMillisecond
            }
            </Text>
          <View style={{}}>

            {this.state.recordstate == 3 &&  //录音完成不可点击
            <View style={{backgroundColor:'#eee',width:60,height:60,borderRadius:30,borderColor:'#d3d3d3',borderWidth:1,opacity:0.3}}>
              <View style={{backgroundColor:"#f2443e",width:42,height:42,borderRadius:21,marginTop:8,marginLeft:8}}></View>
            </View>
            }
            {this.state.recordstate != 3 &&
            <TouchableOpacity onPress={() => this.record()} style={{backgroundColor:'#eee',width:60,height:60,borderRadius:30,borderColor:'#d3d3d3',borderWidth:1,alignItems:"center",justifyContent:'center'}}>
              {(this.state.recordstate == 0 || this.state.recordstate == 2) && <View style={{backgroundColor:"#f2443e",width:42,height:42,borderRadius:21}}></View>}
              {this.state.recordstate == 1 && <Image resizeMode='stretch' style={{width:28,height:28}}source={play_pause}></Image>}
            </TouchableOpacity>
            }
           
          </View>
      </View>
      
      <BoxShadow setting={shadowOpt}>
      <View style={{backgroundColor:'white',width:width,height:px(90),flexDirection:'row'}}>
        <View style={{flex:1}}>
            {this.state.play == 0 && this.state.recordstate == 3 &&  //录音完成 未试听
            <TouchableOpacity style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}} onPress={() => this.listen()}>
              <Image resizeMode='stretch' style={{width:21,height:21}}source={play_red}></Image>
              <Text style={{marginLeft:10,fontWeight:'bold',fontSize:15,color:'#333' }}>试听</Text>
            </TouchableOpacity>
            }
            {this.state.play == 1 &&  //正在播放
            <TouchableOpacity style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}} onPress={() => this.listen()}>
              <Image resizeMode='stretch' style={{width:21,height:21}}source={pause_red}></Image>
              <Text style={{marginLeft:10,fontWeight:'bold',fontSize:15,color:'#333'}}>试听</Text>
            </TouchableOpacity>
            }
            {this.state.play == 2 &&  //暂停
              <TouchableOpacity style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}} onPress={() => this.listen()}>
                <Image resizeMode='stretch' style={{width:21,height:21}}source={play_red}></Image>
                <Text style={{marginLeft:10,fontWeight:'bold',fontSize:15,color:'#333'}}>试听</Text>
              </TouchableOpacity>
            }
            {this.state.recordstate != 3 &&  //未录音或录音未完成，不能点击
            <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center',opacity:0.5}}>
              <Image resizeMode='stretch' style={{width:21,height:21}}source={play_red}></Image>
              <Text style={{marginLeft:10,fontWeight:'bold',fontSize:15,color:'#333'}}>试听</Text>
            </View>
            }
        </View>
        <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'center',flex:1,borderLeftColor:'#eee',borderLeftWidth:0.5}} onPress={() => this.reset()}>
              <Image resizeMode='stretch' style={{width:19,height:19}}source={reset_red}></Image>
              <Text style={{marginLeft:10,fontWeight:'bold',color:'#333',fontSize:15}}>重录</Text>
        </TouchableOpacity>
      </View>
      </BoxShadow>

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
  footerBox:{
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 34 : 0
  },
  topBox: {
    backgroundColor:'white',
    width: px(750),
    height: isIphoneX ? 44 : 20
  },
})
