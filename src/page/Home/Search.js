import React, { Component } from 'react';
import {Alert,Image,TextInput,FlatList,StatusBar,NativeModules,PanResponder,ActivityIndicator,Keyboard,View,StyleSheet,Platform,Text,WebView,Dimensions,TouchableOpacity,TouchableWithoutFeedback,Animated} from 'react-native';
const { width, height } = Dimensions.get('window');
import Header from '../../components/Header';
import {px,isIphoneX} from '../../utils/px';
import AsyncStorage from '@react-native-community/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { ScrollView } from 'react-native-gesture-handler';
const { StatusBarManager } = NativeModules;
import {baseurl,baseimgurl} from '../../utils/Global'
import { Request } from '../../utils/request';

import PersonSearch from '../../components/PersonSearch';
import Article from '../../components/Article';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
import Colors from '../../constants/iColors';
export default class Search extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };
  constructor(props) {
    super(props);
    
    this.pagecount = 15;

    //article params
    this.endid = 99999999999;
    this.end = false;
    this.flaglistloading = false;
    this.reportList = {}
    ////////
    
    ////people params
    this.peopleendid = 99999999999;
    this.peopleend = false;
    this.peopleflaglistloading = false;
    this.focuslist = []
    ///////
    this.state = {
        user:null,
        index:1,
        searchtext:'',
        isLoading:false,
        ////article params
        articlesList:[],

        ///people params
        personList:[],
        isPersonLoading:false

    }
  }
  

  

  componentWillMount = async() => {

  }

  componentDidMount= async() => {
    const user = await AsyncStorage.getItem('user');
    if(user != null && user != '') {
      const json = JSON.parse(user);
      this.setState({user:json})
      const focuslist = await AsyncStorage.getItem('focuslist_' + json.id);
      if(focuslist != null) {
        const json = JSON.parse(focuslist);
        this.focuslist = json;
      }
    }

    const reportListstr = await AsyncStorage.getItem('reportList');
    if(reportListstr) {
      this.reportList = JSON.parse(reportListstr)
    }
  }

  componentWillUnmount() {
    
  }

  searchPeople = async(refresh) => {
    if(refresh) {
      this.peopleendid= 99999999999
    }

    this.setState({
      isPersonLoading:true
    })
      try {
          const result = await Request.post('personsForPageUser',{
            text:this.state.searchtext,
            pagecount:this.pagecount,
            peopleendid:this.peopleendid,
          });
          if(result.code == 1) {
              let personList = null;
              if(refresh) {
                personList = []
              } else {
                personList = this.state.personList
              }
              personList = personList.concat(result.data)
              setTimeout(()=>{
                this.setState({
                  personList:personList,
                  isPersonLoading:false
                })
              },500)
             
              if(result.data.length < this.pagecount) {
                  this.peopleend = true
              } else {
                this.peopleendid = result.data[result.data.length - 1].id
              }
          }
        } catch (error) {
          console.log(error)
        }
  }

  _personOnEndReached = async() => {
    if(this.peopleflaglistloading) {
      return;
    }
    if(this.peopleend) {
      return;
    }
    this.peopleflaglistloading = true;
    await this.searchPeople(false);
    this.peopleflaglistloading = false;
  }



  searchArticle = async(refresh) => {
    if(refresh) {
      this.endid= 99999999999
    }

    this.setState({
      isLoading:true
    })

      try {
          const result = await Request.post('articlesForPage',{
            text:this.state.searchtext,
            pagecount:this.pagecount,
            endid:this.endid,
            direction:'next'
          });
          if(result.code == 1) {
              let articles = null;
              if(refresh) {
                articles = []
              } else {
                articles = this.state.articlesList
              }
               
              for(let i = 0;i < result.data.length;i++) {
                  if(this.reportList[result.data[i].id] == 1) {
                    continue;
                  }
                  let article = result.data[i]
                  article.type = 1 //1 ：article 2:predict article
                  articles.push(article)
              }
              setTimeout(()=>{
                this.setState({
                  articlesList:articles,
                isLoading:false
                })
              },500)
              if(result.data.length < this.pagecount) {
                  this.end = true
              } else {
                this.endid = result.data[result.data.length - 1].id
              }
          }
        } catch (error) {
          console.log(error)
        }
  }

  _onEndReached = async() => {
    if(this.flaglistloading) {
      return;
    }
    if(this.end) {
      return;
    }
    this.flaglistloading = true;
    await this.searchArticle(false);
    this.flaglistloading = false;
  }

  search = () => {
    this.setState({
      articlesList:[],
      personList:[]
    })
    if(this.state.searchtext == '') {
      return;
    }
    this.searchArticle(true);
    this.searchPeople(true);
  }

  changeIndex = (index) => {
    this.setState({
      index:index
    })
  }

  render() {
    return (
      <View style={{flex: 1,flexDirection:'column',backgroundColor: 'white'}}>
      {Platform.OS === 'ios' && <View style={topStyles.topBox}></View>}
      {Platform.OS !== 'ios'&& <View style={topStyles.androidTop}></View>}
      
      <View style={{position:'relative',marginHorizontal:15}}>
      <TextInput value={this.state.searchtext} onChangeText = {(searchtext) => this.setState({searchtext})} placeholder="搜索" onSubmitEditing={this.search}  style={{color:'black',fontSize:15,width:width - 30,backgroundColor:"#f5f5f5",height:40,borderRadius:5,paddingLeft:40}}></TextInput>
      <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{width:40,height:40,position:'absolute',top:0,left:0,alignItems:'center',justifyContent:'center'}}>
        <AntDesign name='arrowleft' size={22} color={'black'}/>
      </TouchableOpacity>
      </View>
      
      <View style={{marginHorizontal:15,height:40,flexDirection:'row',borderBottomWidth:0.5,borderBottomColor:'#f5f5f5'}}>
        <TouchableOpacity onPress={()=> {this.changeIndex(1)}} style={[this.state.index == 1?{borderBottomColor:"black",borderBottomWidth:2}:{},{width:40,alignItems:"center"}]}><Text style={{marginTop:15,color:'black'}}>用户</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=> {this.changeIndex(2)}}  style={[this.state.index == 2?{borderBottomColor:"black",borderBottomWidth:2}:{},{marginLeft:20,width:40,alignItems:"center"}]}><Text style={{marginTop:15,color:'black'}}>帖子</Text></TouchableOpacity>
      </View>
     
       {
          this.state.isPersonLoading && this.state.index == 1 && (
            <View style={{ flex: 1, padding: 50 }}>
              <ActivityIndicator />
            </View>
          )
        } 


       {
          this.state.isLoading && this.state.index == 2 && (
            <View style={{ flex: 1, padding: 50 }}>
              <ActivityIndicator />
            </View>
          )
        }
        
       
    {this.state.index == 1 && 
          <View style={{flex:1}}>
             <FlatList
              style={{ marginTop: 0,flex:1}}
              data={this.state.personList}
              onEndReachedThreshold={0.2}
              onEndReached={this._personOnEndReached}
              renderItem={
                ({ item }) => {
                  return (<PersonSearch user={this.state.user} focuslist={this.focuslist} person={item}></PersonSearch>)
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              
            />
            </View>
        }

      {this.state.index == 2 && 
          <View style={{flex:1}}>
             <FlatList
              style={{ marginTop: 0,flex:1 }}
              data={this.state.articlesList}
              onEndReachedThreshold={0.2}
              onEndReached={this._onEndReached}
              renderItem={
                ({ item }) => {
                  if(item.type == 1) {
                    return (<Article report={this.report} article={item}></Article>)
                  } else if(item.type == 2) {
                    return (<PredictArticle dir={this.dir} predict={item.predict} userpredict={item.userpredict}></PredictArticle>)
                  }
                }
              }
              
              ItemSeparatorComponent={this._separator}
              keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
              
            />
            </View>
        }



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
