import React, { Component } from 'react';
import {ScrollView,Animated,DeviceEventEmitter,TextInput,NativeModules,StatusBar,FlatList,Dimensions,Modal,TouchableOpacity,TouchableWithoutFeedback,View,StyleSheet,Platform,Text, Alert} from 'react-native';

import ScrollableTabView,{ScrollableTabBar, DefaultTabBar } from 'react-native-scrollable-tab-view';
import ICommentTabBar from '../../components/ICommentTabBar/ICommentTabBar';
import {BoxShadow} from 'react-native-shadow'
const {width,height} =  Dimensions.get('window');
import Article from '../../components/Article'
import PredictArticle from '../../components/PredictArticle';
import TabBtn from '../../components/TabBtn';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';
import {Colors} from '../../constants/iColors';
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Recommend from '../../components/home/Recommend';
import News from '../../components/home/News';
import Focus from '../../components/home/Focus';
export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    
    this.subtab_tiyu_index = 0;
    this.subtab_caijing_index = 0;
    this.subtab_hot_index = 0;

    this.subtab_tiyu = [{
      title:'足球',
      selected:true,
      list:[{
        title:'周一004 意甲 卡利亚里VS拉齐奥 2019.12.17 03:45',
        id:1
        },{
        title:'周二001 世俱杯 多哈萨德VS突尼斯希望 2019.12.17 22:30',
        id:2
        },{
        title:'周二002 世俱杯 弗拉门戈VS利雅得希拉尔 2019.12.18 01：30',
        id:3
        },{
        title:'周二003 德甲 云达不来梅VS美因茨 2019.12.18 01:30',
        id:4
        },{
          title:'周一004 意甲 卡利亚里VS拉齐奥 2019.12.17 03:45',
          id:5
          },{
          title:'周二001 世俱杯 多哈萨德VS突尼斯希望 2019.12.17 22:30',
          id:6
          },{
          title:'周二002 世俱杯 弗拉门戈VS利雅得希拉尔 2019.12.18 01：30',
          id:7
          },{
          title:'周二003 德甲 云达不来梅VS美因茨 2019.12.18 01:30',
          id:8
          }]
    },{
      title:'篮球',
      selected:false,
      list:[{
        title:'123周一004 意甲 卡利亚里VS拉齐奥 2019.12.17 03:45',
        id:1
        },{
        title:'123周二001 世俱杯 多哈萨德VS突尼斯希望 2019.12.17 22:30',
        id:2
        },{
        title:'123周二002 世俱杯 弗拉门戈VS利雅得希拉尔 2019.12.18 01：30',
        id:3
        },{
        title:'123周二003 德甲 云达不来梅VS美因茨 2019.12.18 01:30',
        id:4
        }]
    }
    ]

    this.subtab_caijing = [{
      title:'沪深',
      selected:true,
      list:null
    }
    ]
    this.subtab_hot = [{
      title:'国内',
      selected:true,
      list:null
    },{
      title:'国外',
      selected:false,
      list:null
    },{
      title:'社区管理',
      selected:false,
      list:null
    }
    ],
    this.state = {
      user:null,
      _leftTabUnderline: new Animated.Value(27),
      _widthTabUnderline: new Animated.Value(24),

      issuetop:0,
      issueVisible:false,
      
      subtab_tiyu:[],
      subtab_caijing:[],
      subtab_hot:[],

      dirs:[],
      seldir:null,
      selsubdir:null
    }
  }

  
 
  async componentWillMount() {
    
    this.getDirs();
    //初始化数据
    const userstr = await AsyncStorage.getItem('user');
    if(userstr != null && userstr != '') {
      const json = JSON.parse(userstr);
      let user = await this.getUserInfo(json.id);
      if(user) {
        this.setState({user:user})
        AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})

        this.getFocuslist(json.id);
        this.getRemarklist(json.id);
        this.getUplist(json.id);
      //this.getFriends(json.id);
      } else {
        await AsyncStorage.removeItem('user');
      }
      
    } else {
    }
  }

  getFriends = async(id) => {
    try {
      const result = await Request.post('getFriends',{
        userid:id
      });
      const friends = result.data;
      AsyncStorage.setItem('friendList_' + id, JSON.stringify(friends), function (error) {})
    } catch (error) {
      console.log(error)
    }
  }

  getRemarklist = async(userid) => {

      try {
        const result = await Request.post('getMyremarks',{
          userid:userid
        });
        console.log(result.data)
        AsyncStorage.setItem('myremarklist_' + userid, JSON.stringify(result.data), function (error) {})
      } catch (error) {
        console.log(error)
      }
  }

  getUplist = async(id) => {
    try {
      const result = await Request.post('getUpedObjects',{
        userid:id,
      });
      if(result.code == 1) {
        const myUpedarticles = result.data.myUpedarticles
        const myUpedcomments = result.data.myUpedcomments
        const myUpedreplys = result.data.myUpedreplys
      
        AsyncStorage.setItem('myUpedarticles_' + this.state.user.id, JSON.stringify(myUpedarticles), function (error) {})
        AsyncStorage.setItem('myUpedcomments_' + this.state.user.id, JSON.stringify(myUpedcomments), function (error) {})
        AsyncStorage.setItem('myUpedreplys_' + this.state.user.id, JSON.stringify(myUpedreplys), function (error) {})

      }
    } catch (error) {
    }
  }

  getFocuslist = async(id) => {
      try {
        const result = await Request.post('getFocusList',{
          id:id
        });
        const focuslist = result.data;
        AsyncStorage.setItem('focuslist_' + id, JSON.stringify(focuslist), function (error) {})
      } catch (error) {
        console.log(error)
      }
    
  }

  getDirs = async() => {
    try {
      const result = await Request.post('getDirs',{
        id:2
      });
      if(result.code == 1) {
        const dirs = result.data;
        AsyncStorage.setItem('dirs',JSON.stringify(dirs)); //不增加userid后缀
        let subtab_caijing = null;
        let subtab_hot = null;
        let subtab_tiyu = null;
        for(let i = 0;i < dirs.length;i++) {
          let dir = dirs[i];//资讯 财经
          if(dir.title == '财经') {
            dir.subdirs[0].selected = true;
            for(let j = 0;j < dir.subdirs.length;j++) {
              let subdir = dir.subdirs[j] //
              subdir.subdirs.unshift({
                title: "不限",
                id:subdir.id
              })
            }
          } else if(dir.title == '资讯') {
            dir.subdirs.unshift({
              title: "不限",
              id:dir.id
            })
          }
        }

        this.setState({
          dirs:dirs,
          seldir:dirs[0],
          selsubdir:dirs[0].subdirs[0],
          subtab_caijing,
          subtab_hot,
          subtab_tiyu
        },()=> {
        })
        //AsyncStorage.setItem('subtab_caijing',JSON.stringify(subtab_caijing)); //不增加userid后缀
        //AsyncStorage.setItem('subtab_hot',JSON.stringify(subtab_hot)); //不增加userid后缀
        //AsyncStorage.setItem('subtab_tiyu',JSON.stringify(subtab_tiyu)); //不增加userid后缀
      } else {

      }
      
      
    } catch (error) {
      console.log(error)
    }
  }

  getUserInfo = async(id) => {
    try {
      const result = await Request.post('getUserInfo',{
        id:id
      });
      return result.data;
    } catch (error) {
      console.log(error)
    }
    return null;
  }

  componentDidMount = async() => {
    //AsyncStorage.removeItem('reportCommentList');
    //AsyncStorage.removeItem('reportList');
  }
  selectdir = (item) => {
    this.setState({seldir:item})
    for(let i = 0;i < item.subdirs.length;i++) {
      if(item.subdirs[i].selected) {
        this.setState({selsubdir:item.subdirs[i]})
        break;
      }
    }
  }

  selectsubdir =(item) => {
    let seldir = this.state.seldir;

    if(seldir.title == '资讯') {
      this.props.navigation.navigate('CategoryArticles',{dir:this.state.seldir,subdir:item,lastdir:null})
      return;
    } else {
      let selsubdir = null;
      for(let i = 0;i < seldir.subdirs.length;i++) {
        seldir.subdirs[i].selected = false;
        if(seldir.subdirs[i].title == item.title) {
          seldir.subdirs[i].selected = true;
          selsubdir = seldir.subdirs[i];
        }
      }
      this.setState({
        seldir:seldir,
        selsubdir:selsubdir
      })
    }
    
  }

  
  
  issue = () => {
    this.props.navigation.navigate('CreateAritcle',{subtab_caijing:this.state.subtab_caijing,subtab_tiyu:this.state.subtab_tiyu,subtab_hot:this.state.subtab_hot})
  }

  search = () => {
    this.props.navigation.navigate('Search')
  }
  

  render() {
    let search = require('../../images/home/search.png')
    let issue = require('../../images/home/split.png')
    return (

      <View ref='homewrap' style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
      
      <StatusBar translucent={true} backgroundColor='rgba(0,0,0,0)' barStyle={'dark-content'} />
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        <View ref="issue" style={{position:'absolute',right:0,top:3+(isIphoneX?44:STATUSBAR_HEIGHT),zIndex:99,height:46,backgroundColor:'white',paddingHorizontal:10,flexDirection:'row',alignItems:'center',justifyContent:"space-between"}}>
          <View style={{flexDirection:'row'}}>
          <TouchableOpacity onPress={this.search} style={{width:40,height:38,paddingTop:5,justifyContent:'flex-start',alignItems:'center'}}>
            <Feather name='search' size={22} color={'black'}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.issue} style={{marginLeft:0,width:0,height:38,paddingTop:5,justifyContent:'flex-start',alignItems:'center'}}>
            <Entypo name='text' size={24} color={'black'}/>
          </TouchableOpacity>
          </View>
        </View>
        
        
        <ScrollableTabView
          onChangeTab={(obj) => {
            //DeviceEventEmitter.emit('someone_play', { id: -1});<News></News>
          }}
          initialPage={0}
          tabBarBackgroundColor='white'
          tabBarUnderlineStyle={{borderRadius:20,height:2.5,backgroundColor:'black'}}
          tabBarTextStyle={{}}
          renderTabBar={() => <ICommentTabBar style={{width:width,borderBottomWidth:0.5,borderBottomColor:'#f5f5f5'}}/>}
        >
        <View tabLabel='推荐' style={{flex:1}}>
          <Recommend ref="recommend"></Recommend>
        </View>
        <View tabLabel='榜单'>
          <View style={{flexDirection:'row',marginTop:10,paddingLeft:5,justifyContent:"center"}}>
          {this.state.dirs.length > 0 && this.state.dirs.map(item => {
            return (<TouchableOpacity onPress={()=>{this.selectdir(item)}} style={{ height: 45,alignItems: 'center',justifyContent: 'center',width:60}}><Text style={[this.state.seldir.title == item.title ? {color:'black',fontSize:17}:{color:'#999',fontSize:17},{fontWeight:'bold'}]}>{item.title}</Text></TouchableOpacity>)
          })}
          </View>

          <View style={{flexDirection:'row',flexWrap:"wrap",paddingLeft:15,marginTop:10}}>
          {this.state.seldir && this.state.seldir.subdirs.map(item => {
            return (<TabBtn style={{width:(width - 90)/5,marginBottom:15}} title={item.title} selected={item.selected} onPressed={() => this.selectsubdir(item)}></TabBtn>)
          })}
          </View>


          {this.state.seldir && this.state.seldir.title == '财经' && this.state.selsubdir &&
          <FlatList
              style={{ marginTop: 0,backgroundColor:'white'}}
              data={this.state.selsubdir.subdirs}
              renderItem={
                ({ item }) => {
                  return(<TouchableOpacity onPress={()=>{this.props.navigation.navigate('CategoryArticles',{dir:this.state.seldir,subdir:this.state.selsubdir,lastdir:item})}} style={styles.subsubtab}><Text style={{fontSize:14,color:'#222'}}>{item.title}</Text></TouchableOpacity>)
                }
              }
              ItemSeparatorComponent={this._separator}
            />
          }
        </View>

        <View tabLabel='关注' style={{flex:1}}>
          <Focus></Focus>
        </View>
        
        </ScrollableTabView>



      <Modal
      animationType={"none"}
      transparent={true}
      visible={this.state.issueVisible}
      >
        <TouchableWithoutFeedback onPress={() => (this.setState({ issueVisible: false }))}>
        <View  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)' }}>
        <View style={[{ marginTop:isIphoneX?86:62,marginLeft:width - 109,width: 100, borderRadius: 6, zIndex: 99, backgroundColor: '#222'}]}>
        <View
        style={{ 
        marginLeft:72,         
        marginTop: px(-20),
        width: 0,
        height: 0,
        borderColor: 'transparent',
        borderLeftWidth: px(14),
        borderRightWidth: px(14),
        borderBottomWidth: px(20),
        borderBottomColor: '#222',
      }}
      />
      <TouchableOpacity
        style={{ height: 40, justifyContent: 'center', alignItems: 'center', borderBottomColor: '#666', borderBottomWidth: 0.2 }}
        onPress={() => (this.setState({ issueVisible: false }), this.props.navigation.navigate('CreateAritcle',{subtab_caijing:this.state.subtab_caijing,subtab_tiyu:this.state.subtab_tiyu,subtab_hot:this.state.subtab_hot}))}
      >
      <Text style={{color:'white',}}>文字贴</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ height: 40, justifyContent: 'center', alignItems: 'center'}}
        onPress={() => (this.setState({ issueVisible: false }), this.props.navigation.navigate('CreateVoiceArticle',{subtab_caijing:this.state.subtab_caijing,subtab_tiyu:this.state.subtab_tiyu,subtab_hot:this.state.subtab_hot}))}
      >
      <Text style={{color:'white',}}>语音贴</Text>
      </TouchableOpacity>
      </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  subsubtab:{
    paddingHorizontal:20,paddingVertical:15,width:width,borderColor:'#eee',borderBottomWidth:0.5
  }
})

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
})