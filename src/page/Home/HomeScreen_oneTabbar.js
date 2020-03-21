import React, { Component } from 'react';
import {Image,TextInput,NativeModules,StatusBar,FlatList,Dimensions,Modal,TouchableOpacity,TouchableWithoutFeedback,TouchableHighlight,View,StyleSheet,Platform,Text} from 'react-native';

import ScrollableTabView,{ScrollableTabBar } from 'react-native-scrollable-tab-view';
import {BoxShadow} from 'react-native-shadow'
const {width,height} =  Dimensions.get('window');
import Article from '../../components/Article'
import PredictArticle from '../../components/PredictArticle';
import TabBtn from '../../components/TabBtn';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import {px, isIphoneX} from '../../utils/px';
import {Colors} from '../../constants/iColors';
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
      issuetop:0,
      issueVisible:false,
      NewsList:[{
        id:1,
        username:'寒江雪',
        createtime:'1小时前',
        title:'标题标题 考题标题标题 考题标题标题 考题标题',
        content:'内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内内容内容内容内容内容内容内容内内容内容内容内容内容内容内容内',
        imgUrl:'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=112809600,2383491534&fm=26&gp=0.jpg',
        view:111,
        comment:12,
        subject:"财经/深沪财经",
        type:1,
        audiolength:40,
        audiopath:"http://www.baidu.com",
        category:1 //1:帖子  2：预测
      },{
        id:3,
        title:'1月8日上证指数1A0001日线预测',
        predate:'2020/01/07',
        preresult:'3104.8   +21.39  +0.69%',
        preup:true,
        predicttable:{
          bigup:1,
          up:20,
          flat:1,
          down:1,
          bigdown:1
        },
        category:2 //1:帖子  2：预测
      },{
        id:3,
        username:'寒江雪',
        createtime:'1小时前',
        title:'标题标题 考题',
        content:'内容内容内容内容内容',
        view:111,
        comment:12,
        subject:"财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪财经/深沪",
        type:2,
        audiolength:40,
        audiopath:"http://www.baidu.com",
        category:1 //1:帖子  2：预测
      }],
      subtab_tiyu:this.subtab_tiyu,
      subtab_caijing:this.subtab_caijing,
      subtab_hot:this.subtab_hot

    }
  }

  

  componentWillMount() {

  }

  componentDidMount = () => {
    this._navListener = this.props.navigation.addListener("didFocus", () => {
            StatusBar.setBarStyle("dark-content"); //状态栏文字颜色
            StatusBar.setBackgroundColor("#ffffff"); //状态栏背景色
    });
      
  }

  componentWillUnmount() {
    this._navListener.remove();
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
    this.refs.issue.measure((a, b, c, d, e, f) => {
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
    });
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
    //let issue = require('../../images/home/issue5.png')
    let issue = require('../../images/home/issue/issue_active.png')
    return (

      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#f7f7f7' }}>
      
      <StatusBar translucent={true} backgroundColor='white' barStyle={'dark-content'} />
        
        {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
        {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

        <View ref="issue" style={{zIndex:99,height:38,backgroundColor:'white',paddingHorizontal:10,flexDirection:'row'}}>
          <TextInput
            placeholder = {'搜索感兴趣的内容'} 
            placeholderTextColor = {'#888'}
            underlineColorAndroid = {'transparent'}
            style={{ paddingLeft:40,height:38,flex:1,backgroundColor:'#eaeaea',borderRadius:5,marginRight:10}}
            />

        <TouchableOpacity onPress={this.issue} style={{width:40,height:38,justifyContent:'center',alignItems:'center'}}>
          <Image source={issue} style={{width:28,height:28,}}></Image>
        </TouchableOpacity>
        
        <Image source={search} resizeMode='stretch' style={{top:9,left:20,position:'absolute',width:18,height:18}}></Image>

        </View>  
        <ScrollableTabView
          initialPage={0}
          tabBarBackgroundColor='white'
          tabBarUnderlineStyle={{borderRadius:10,backgroundColor:'#017bd1'}}
          tabBarTextStyle={{fontSize:16}}
          renderTabBar={() => <ScrollableTabBar style={{borderBottomWidth:0.5,borderBottomColor:'#eee'}}/>}
        >
          <FlatList
             tabLabel='推荐'
              style={{ marginTop: 0 }}
              data={this.state.NewsList}
              renderItem={
                ({ item }) => {
                  if(item.category == 1) {
                    return (<Article article={item}></Article>)
                  } else if(item.category == 2) {
                    return (<PredictArticle predict={item}></PredictArticle>)
                  }
                }
              }
              ItemSeparatorComponent={this._separator}
            />
          <Text tabLabel='关注'>favorite</Text>
          <Text tabLabel='榜单'>project</Text>
          <View tabLabel='热点'>
          <View style={{flexDirection:"row",backgroundColor:"white",paddingVertical:10}}>
              {this.state.subtab_hot.map(item => {
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_hot(item.title)}></TabBtn>
                  )
                })}
          </View>
          </View>
          <View tabLabel='财经'>
              <View style={{flexDirection:"row",backgroundColor:"white",paddingVertical:10}}>
              {this.state.subtab_caijing.map(item => {
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_caijing(item.title)}></TabBtn>
                  )
              })}
              </View>
          </View>
          <View tabLabel='体育'>
              <View style={{flexDirection:"row",backgroundColor:"white",paddingVertical:10}}>
                {this.state.subtab_tiyu.map(item => {
                  return (
                    <TabBtn title={item.title} selected={item.selected} onPressed={() => this.select_tiyu(item.title)}></TabBtn>
                  )
                })}
              </View>
              <FlatList
              style={{ marginTop: 7,backgroundColor:'white'}}
              data={this.state.subtab_tiyu[this.subtab_tiyu_index].list}
              renderItem={
                ({ item }) => {
                  return(<TouchableOpacity style={{paddingHorizontal:10,paddingVertical:12,width:width,borderColor:'#eee',borderBottomWidth:0.5}}><Text style={{fontSize:14}}>{item.title}</Text></TouchableOpacity>)
                }
              }
              ItemSeparatorComponent={this._separator}
            />
              <View></View>
          </View>
        </ScrollableTabView>



      <Modal
      animationType={"none"}
      transparent={true}
      visible={this.state.issueVisible}
      >
        <TouchableWithoutFeedback onPress={() => (this.setState({ issueVisible: false }))}>
        <View  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)' }}>
        <View style={[{ marginTop:isIphoneX?86:42,marginLeft:width - 110,width: 100, borderRadius: 6, zIndex: 99, backgroundColor: '#222'}]}>
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
        onPress={() => (this.setState({ issueVisible: false }), this.props.navigation.navigate('CreateAritcle',{subtab_caijing:this.subtab_caijing,subtab_tiyu:this.subtab_tiyu,subtab_hot:this.subtab_hot}))}
      >
      <Text style={{color:'white',}}>文字贴</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ height: 40, justifyContent: 'center', alignItems: 'center'}}
        onPress={() => (this.setState({ issueVisible: false }), this.props.navigation.navigate('CreateVoiceArticle',{subtab_caijing:this.subtab_caijing,subtab_tiyu:this.subtab_tiyu,subtab_hot:this.subtab_hot}))}
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