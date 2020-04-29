import React, { Component } from 'react';
import {ActivityIndicator,DeviceEventEmitter,FlatList,StatusBar,NativeModules,PanResponder,SafeAreaView,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,Modal,TouchableWithoutFeedback,Animated, Alert} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import AsyncStorage from '@react-native-community/async-storage';

import { Request } from '../../utils/request';
import Article from '../../components/Article'
import PredictArticle from '../../components/PredictArticle';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import { Colors } from '../../constants/iColors';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

export default class CategoryArticles extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);

    this.reportarticleid = -1;
    this.pagecount = 10;
    
    this.title = props.navigation.getParam('title');
    this.dir = props.navigation.getParam('dir');
    this.subdir = props.navigation.getParam('subdir');
    this.lastdir = props.navigation.getParam('lastdir');

    this.articleids = []
    this.index = 0;

    this.reportList = {}

    this.state = {
       item:null,
       articlesList:[],
       user:null,
       isLoading:true,
       predict:null,
       userpredict:null,

       reportVisible:false,
       sort:'最热',
       end:1
    }

    this.flaglistloading = false;
  }
  
  componentWillMount = async() => {
    const user = await AsyncStorage.getItem('user');
    if(!!user) {
      this.setState({
        user:JSON.parse(user)
      })
    }

    const reportListstr = await AsyncStorage.getItem('reportList'); //不登录也可以投诉 因此reportlist 不用增加userid后缀
    if(reportListstr) {
      this.reportList = JSON.parse(reportListstr)
    }
    
    if(this.lastdir.title.indexOf('上证' >= 0) || this.lastdir.title.indexOf('深证' >= 0) || this.lastdir.title.indexOf('创业板指' >= 0)) {
      await this.loadPredict('日线');
    }
    await this.loadArticleIds();
    if(this.articleids.length > 0) {
      if(this.index == this.articleids.length) {
        this.setState({
          end:2
        })
      }
    }
    await this.loadArticles();
  }

  loadArticleIds = async() => {
    console.log(this.lastdir)
    const result = await Request.post('articleIDsForApp',{
      dir:this.lastdir.id,
      sort:this.state.sort
    });
    if(result.code == 1) {
        this.articleids = result.data
        if(this.articleids.length > 0) {
          this.setState({
            end:2
          })
        } else {
          this.setState({
            end:1
          })
        }
    }
  }

  loadArticles = async(refresh)=> {
    if(this.index == this.articleids.length) {
      return;
    }
    let ids = [];
    let count = 0;
    
    for(this.index;this.index < this.articleids.length;this.index++) {
      ids.push(this.articleids[this.index])
      count++;
      if(count == this.pagecount) {
        this.index++;
        break;
      }
    }

    try {
        const result = await Request.post('articlesForAPP',{
          ids:JSON.stringify(ids)
        });
        if(result.code == 1) {
            let articles = []
            if(!refresh) {
              articles = this.state.articlesList
            } else {
              if(this.state.articlesList.length > 0 && this.state.articlesList[0].type ==2 ) {
                articles.push(this.state.articlesList[0])
              }
            }
            const reportListstr = await AsyncStorage.getItem('reportList'); //不登录也可以投诉 因此reportlist 不用增加userid后缀
            if(reportListstr) {
              this.reportList = JSON.parse(reportListstr)
            }

            for(let i = 0;i < ids.length;i++) {
              let article = result.data[ids[i]];
              if(this.reportList[article.id] == 1) {
                continue;
              }
              article.type = 1 //1 ：article 2:predict article
              articles.push(article)
            }

            this.setState({
              articlesList:articles,
              isLoading:false
            })

            if(this.index == this.articleids.length) {
              this.setState({
                end:3
              })
            }
        }
      } catch (error) {
        console.log(error)
      }
  }

  changepredicttype = async(type) => {
    try {
      const result = await Request.post('loadPredict',{
        userid:!!this.state.user?this.state.user.id:'',
        dir:this.lastdir.id,
        type:type
      });
      if(result.code == 1) {
        if(result.data.predict) {
          let articlesList = this.state.articlesList;
          if(articlesList.length > 0 && articlesList[0].type == 2) {
            articlesList.splice(0,1);
          }

          let articlelistnew = [];
          result.data.type = 2;
          result.data.id = result.data.predict.id;
          articlelistnew.push(result.data)
          articlelistnew = articlelistnew.concat(articlesList)
          this.setState({
            articlesList:articlelistnew
          })
        }
        
      }
    } catch (error) {
      console.log(error)
    }
  }

  loadPredict = async(type) => {
    try {
      const result = await Request.post('loadPredict',{
        userid:!!this.state.user?this.state.user.id:'',
        dir:this.lastdir.id,
        type:type
      });
      if(result.code == 1) {
        if(result.data.predict) {
          result.data.type = 2;
          result.data.id = result.data.predict.id;
          let articlesList = [];
          articlesList.push(result.data)
          this.setState({
            articlesList:articlesList
          })
        }
        
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount = () => {
  }


  componentWillUnmount() {
    DeviceEventEmitter.emit('someone_play', { id: -1});
  }

  changeSort = async(sort) => {
    if(sort == this.state.sort) {
      return;
    }
    
    this.articleids = []
    this.index = 0;

    this.setState({
      sort:sort
    },async() => {
      this.flaglistloading = true;
      await this.loadArticleIds();
      await this.loadArticles(true);
      this.flaglistloading = false;
    })
    
  }
  


  refresh = async()=> {
    console.log('refresh')
    
    this.articleids = []
    this.index = 0;

    this.flaglistloading = true;
    await this.loadArticleIds();
    await this.loadArticles(true);
    this.flaglistloading = false;
  }

  _onEndReached = async() => {
    console.log('end reach')
    if(this.flaglistloading) {
      return;
    }
    if(this.index == this.articleids.length) {
      return;
    }
    this.flaglistloading = true;
    await this.loadArticles(false);
    this.flaglistloading = false;
  }

  report = (articleid,title,publishuserid) => {

    this.reportarticleid = articleid;
    this.reportarticletitle = title;
    this.publishuserid = publishuserid;
    this.setState({
      reportVisible:true
    })
  }

  reportArticle = async(text) => {
    if(this.reportarticleid == -1) {
      return;
    }

    this.reportList[this.reportarticleid] = 1;
    AsyncStorage.setItem('reportList', JSON.stringify(this.reportList), function (error) {})

    try {
      const result = await Request.post('addReport',{
        userid:!!this.state.user?this.state.user.id:'',
        objid:this.reportarticleid,
        title:this.reportarticletitle,
        publishuserid:this.publishuserid,
        type:1,
        text:text
      });
      if(result.code == -2) {
        Alert.alert('您已被封禁')
        return;
      }
      if(result.code == 1) {
        let articlesList = this.state.articlesList;
        for(let i = 0;i < articlesList.length;i++) {
          if(articlesList[i].type == 1 && articlesList[i].id == this.reportarticleid) {
            articlesList.splice(i,1);
            break;
          }
        }
        this.setState({
          reportVisible:false,
          articlesList:articlesList
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

  
  render() {
    let title = this.title != null ? this.title : (this.dir.title + '/' + this.subdir.title + (this.lastdir.title != '不限'?('/' +  this.lastdir.title):''))
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}

      <Header title={title} />

      <View style={{marginTop:10,flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:30}} onPress={()=> {this.changeSort('最热')}}>
          <Text style={[this.state.sort =='最热'?{color:Colors.TextColor}:{color:"black"},{fontSize:16}]}>最热</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:55,height:30}} onPress={()=> {this.changeSort('最新')}}>
          <Text style={[this.state.sort =='最新'?{color:Colors.TextColor}:{color:"black"},{fontSize:16}]} >最新</Text>
        </TouchableOpacity>
      </View>

        {
          <View style={{flex:1}}>
             <FlatList
              refreshing={false}
              style={{ marginTop: 0,flex:1 }}
              data={this.state.articlesList}
              onEndReachedThreshold={0.2}
              onEndReached={this._onEndReached}
              onRefresh={this.refresh} 
              renderItem={
                ({ item }) => {
                  if(item.type == 1) {
                    return (<Article hideDir={true} report={this.report} article={item}></Article>)
                  } else if(item.type == 2) {
                    return (<PredictArticle changetype={this.changepredicttype} dir={this.lastdir} dirname={title} predict={item.predict} userpredict={item.userpredict}></PredictArticle>)
                  }
                }
              }
              ListEmptyComponent={()=> {return(<View style={{paddingVertical:7,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>暂无内容哦</Text></View>)}}
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              ListFooterComponent={()=> {
                if(this.state.end == 3) {
                  return(<View style={{paddingVertical:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>没有更多内容啦</Text></View>)
                } else if(this.state.end == 2){
                  return(<View style={{paddingVertical:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>加载中...</Text></View>)
                } else {
                  return(<View></View>)
                }
              }}
            />
            </View>
        }

        {Platform.OS === 'ios' && <View style={topStyles.footerBox}></View>}

        
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
