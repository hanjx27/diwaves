import React, { Component } from 'react';
import {Animated,DeviceEventEmitter,TextInput,NativeModules,StatusBar,FlatList,Dimensions,Modal,TouchableOpacity,TouchableWithoutFeedback,View,StyleSheet,Platform,Text, Alert} from 'react-native';

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
      list:[]
    },{
      title:'篮球',
      selected:false,
      list:[]
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
      subtab_hot:[]

    }
  }

  
 
  async componentWillMount() {
    
    this.getDirs();

     //this.getUserInfo(2);
    //this.getFocuslist(2);
    //this.getFocuslist(json.id);


    //初始化数据
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.getUserInfo(json.id);
      this.getFocuslist(json.id);
    } else {
      
    }
  }


  getFocuslist = async(id) => {

    const focusliststr = await AsyncStorage.getItem('focuslist_' + id);
    if(focusliststr == null) {
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
    
  }

  getDirs = async() => {
    try {
      const result = await Request.post('getDirs',{
        id:2
      });
      if(result.code == 1) {
        const dirs = result.data;
        let subtab_caijing = null;
        let subtab_hot = null;
        let subtab_tiyu = null;
        for(let i = 0;i < dirs.length;i++) {
          const dir = dirs[i];
          let subtab = []
          for(let j = 0;j < dir.subdirs.length;j++) {
            let subdir = dir.subdirs[j];
            subtab.push({
              id:subdir.id,
              title:subdir.title,
              selected:j == 0?true:false,
              list:subdir.subdirs
            })
            if(dir.title == '新闻') {
              subtab_hot = subtab
            } else if(dir.title == '财经') {
              subtab_caijing = subtab
            } else if(dir.title == '体育') {
              subtab_tiyu = subtab
            }
          }
        }
        this.setState({
          subtab_caijing,
          subtab_hot,
          subtab_tiyu
        })
        AsyncStorage.setItem('subtab_caijing',JSON.stringify(subtab_caijing)); //不增加userid后缀
        AsyncStorage.setItem('subtab_hot',JSON.stringify(subtab_hot)); //不增加userid后缀
        AsyncStorage.setItem('subtab_tiyu',JSON.stringify(subtab_tiyu)); //不增加userid后缀
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
      const user = result.data;
      this.setState({user:user})
      AsyncStorage.setItem('user', JSON.stringify(user), function (error) {})
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount = () => {
    this._navBlurListener = this.props.navigation.addListener("didBlur", () => {
      DeviceEventEmitter.emit('someone_play', { id: -1});
    })
    /*this._navListener = this.props.navigation.addListener("didFocus", () => {
    });*/
  }

  componentWillUnmount() {
    //this._navListener.remove();
    this._navBlurListener.remove();
  }
  select_hot = (title) => {
    let subtab_hot = this.state.subtab_hot;
    
    for(let i = 0;i < subtab_hot.length;i++) {
      subtab_hot[i].selected = false;
      if(subtab_hot[i].title == title) {
        subtab_hot[i].selected = true;
        this.subtab_hot_index = i;
      }
    }
    this.setState({
      subtab_hot:subtab_hot
    })

    this.news.changeDir(subtab_hot[this.subtab_hot_index]);
  }
  select_caijing = (title) => {
    let subtab_caijing = this.state.subtab_caijing;
    
    for(let i = 0;i < subtab_caijing.length;i++) {
      subtab_caijing[i].selected = false;
      if(subtab_caijing[i].title == title) {
        subtab_caijing[i].selected = true;
        this.subtab_caijing_index = i;
      }
    }
    this.setState({
      subtab_caijing:subtab_caijing
    })
  }
  select_tiyu =  (title) => {
    let subtab_tiyu = this.state.subtab_tiyu;
    
    for(let i = 0;i < subtab_tiyu.length;i++) {
      subtab_tiyu[i].selected = false;
      if(subtab_tiyu[i].title == title) {
        subtab_tiyu[i].selected = true;
        this.subtab_tiyu_index = i;
      }
    }
    this.setState({
      subtab_tiyu:subtab_tiyu
    })
  }
  
  issue = () => {
    /*this.refs.issue.measure((a, b, c, d, e, f) => {
      this.setState((prevState) => {
        if (d + f === prevState.height && c === prevState.issuetop) {
          return {
            issueVisible: !prevState.issueVisible
          }
        } else {
          return {
            issueVisible: !prevState.issueVisible,
            issuetop: d + f,
          }
        }
      })
    });*/
    this.props.navigation.navigate('CreateAritcle',{subtab_caijing:this.state.subtab_caijing,subtab_tiyu:this.state.subtab_tiyu,subtab_hot:this.state.subtab_hot})
  }

  search = () => {
    this.props.navigation.navigate('Search')
  }
  

  render() {
    const shadowOpt = {
      width:(width-70)/3,
      height:60,
      color:"#aaa",
      border:2,
      radius:2,
      opacity:0.2,
      x:1,
      y:1,
      style:{marginTop:10}
    }
    let search = require('../../images/home/search.png')
    let issue = require('../../images/home/split.png')
    
    return (

      <View ref='homewrap' style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
      
      <StatusBar translucent={true} backgroundColor='rgba(0,0,0,0)' barStyle={'dark-content'} />
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        <View ref="issue" style={{position:'absolute',right:0,top:isIphoneX?44:STATUSBAR_HEIGHT,zIndex:99,height:50,backgroundColor:'white',paddingHorizontal:10,flexDirection:'row',alignItems:'center',justifyContent:"space-between"}}>
          <View style={{flexDirection:'row'}}>
          <TouchableOpacity onPress={this.search} style={{width:40,height:38,paddingTop:5,justifyContent:'flex-start',alignItems:'center'}}>
            <Feather name='search' size={22} color={'black'}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.issue} style={{marginLeft:5,width:0,height:38,paddingTop:5,justifyContent:'flex-start',alignItems:'center'}}>
            <Entypo name='text' size={24} color={'black'}/>
          </TouchableOpacity>
          </View>
        </View>
        
        
        <ScrollableTabView
          onChangeTab={(obj) => {
            //DeviceEventEmitter.emit('someone_play', { id: -1});
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
        <View tabLabel='榜单' style={{flex:1}}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity><Text>新闻</Text></TouchableOpacity>
            <TouchableOpacity><Text>财经</Text></TouchableOpacity>
          </View>
          <News></News>
        </View>
        <View tabLabel='关注' style={{flex:1}}>
          <Focus></Focus>
        </View>
        {false &&  <View tabLabel='新闻' style={{flex:1}}>
            <View style={{flexDirection:"row",backgroundColor:"white",paddingTop:15,paddingLeft:15}}>
              {this.state.subtab_hot.map(item => {
                  if(item.title == '体育') {
                    return (<View></View>)
                  }
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_hot(item.title)}></TabBtn>
                  )
                })}
            </View>
            {this.state.subtab_hot.length > 0 &&
              <News onRef={(ref)=>{ this.news = ref}}  dir={this.state.subtab_hot[0]}></News>
            }
          </View>
          }
          {false &&  <View tabLabel='财经'>
              <View style={{flexDirection:"row",backgroundColor:"white",paddingVertical:15,paddingLeft:15}}>
              {this.state.subtab_caijing.map(item => {
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_caijing(item.title)}></TabBtn>
                  )
              })}
              </View>
              {this.state.subtab_caijing.length > 0 && this.state.subtab_caijing[this.subtab_caijing_index].list != null &&
              <FlatList
              style={{ marginTop: 0,backgroundColor:'white'}}
              data={this.state.subtab_caijing[this.subtab_caijing_index].list}
              renderItem={
                ({ item }) => {
                  return(<TouchableOpacity onPress={()=>{this.props.navigation.navigate('CategoryArticles',{dir:item})}} style={styles.subsubtab}><Text style={{fontSize:14,color:'#222'}}>{item.title}</Text></TouchableOpacity>)
                }
              }
              ItemSeparatorComponent={this._separator}
            />
              }
          </View>
          }
          
          {false && <View tabLabel='体育'>
              <View style={{flexDirection:"row",backgroundColor:"white",paddingVertical:15,paddingLeft:15,borderBottomColor:"#eee",borderBottomWidth:0.5}}>
                {this.state.subtab_tiyu.map(item => {
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_tiyu(item.title)}></TabBtn>
                  )
                })}
              </View>
              {this.state.subtab_tiyu.length > 0 && this.state.subtab_tiyu[this.subtab_tiyu_index].list != null &&
              <FlatList
              style={{ marginTop: 0,backgroundColor:'white'}}
              data={this.state.subtab_tiyu[this.subtab_tiyu_index].list}
              renderItem={
                ({ item }) => {
                  return(<TouchableOpacity onPress={()=>{this.props.navigation.navigate('CategoryArticles',{dir:item})}} style={styles.subsubtab}><Text style={{color:'#222',fontSize:14}}>{item.title}</Text></TouchableOpacity>)
                }
              }
              ItemSeparatorComponent={this._separator}
            />
              }
              <View></View>
            </View>  }
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
    paddingHorizontal:15,paddingVertical:15,width:width,borderColor:'#eee',borderBottomWidth:0.5
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