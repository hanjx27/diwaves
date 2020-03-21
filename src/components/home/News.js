import React from 'react';
import {TouchableOpacity,Alert,FlatList,Dimensions,Text,View,ActivityIndicator,Modal,TouchableWithoutFeedback} from 'react-native';

import Article from '../Article'
import Article_comment from '../Article_comment';
import PredictArticle from '../PredictArticle';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {px, isIphoneX} from '../../utils/px';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import {Colors} from '../../constants/iColors';
const {width,height} =  Dimensions.get('window');

class News extends React.Component {

    constructor(props) {
        super(props);
        
        this.pagecount = 10;
    
        this.dir = props.navigation.getParam('dir');
  

        this.articleids = []
        this.index = 0;

        this.dir = props.dir
        
        this.canAction = false;

        this.state = {
          articlesList:[],
          reportVisible:false,
          sort:'最新',
          end:1
        }
        this.reportarticleid = -1;
        this.reportList = {}

        this.changeDir = this.changeDir.bind(this);
        this.user = null

        this.flaglistloading = false;
      }

    componentDidMount = async() =>{
      const reportListstr = await AsyncStorage.getItem('reportList');

      if(reportListstr) {
        this.reportList = JSON.parse(reportListstr)
      }
  
      const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
            const json = JSON.parse(user);
            this.user = json;
        }
      
        await this.loadArticleIds();
        await this.loadArticles();
    }

    changeDir = async(dir) => {
      this.dir = dir;
      this.articleids = []
      this.index = 0;
      this.setState({
        articlesList:[],
        isLoading:true,
      },async() => {
        this.flaglistloading = true;
        await this.loadArticleIds();
        await this.loadArticles(true);
        this.flaglistloading = false;
      })
     
    }

    loadArticleIds = async() => {
      const result = await Request.post('articleIDsForApp',{
        dir:!!this.dir ?this.dir.id:'',
        sort:this.state.sort
      });
      if(result.code == 1) {
          this.articleids = result.data
          if(this.articleids.length > 0) {
            if(this.index == this.articleids.length) {
              this.setState({
                end:2
              })
            }
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
              }

              for(let i = 0;i < ids.length;i++) {
                let article = result.data[ids[i]];
                if(this.reportList[article.id] == 1) {
                  continue;
                }
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
    


    report = (articleid) => {
      this.reportarticleid = articleid;
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
          userid:!!this.user?this.user.id:'',
          articleid:this.reportarticleid,
          text:text,
          commentid:-1
        });
        if(result.code == 1) {
          let articlesList = this.state.articlesList;
          for(let i = 0;i < articlesList.length;i++) {
            if(articlesList[i].id == this.reportarticleid) {
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
              duration: 700, //1.SHORT 2.LONG
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
    return (
      <View style={{flex:1}}>
      <View style={{marginTop:10,height:30,width:width,flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:50,height:30}} onPress={()=> {this.changeSort('最新')}}>
          <Text style={[this.state.sort =='最新'?{color:Colors.TextColor}:{color:"black"},{fontSize:16}]} >最新</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:10}}>/</Text>
        </View>
        
        <TouchableOpacity style={{alignItems:'center',justifyContent:"center",width:50,height:30}} onPress={()=> {this.changeSort('最热')}}>
          <Text style={[this.state.sort =='最热'?{color:Colors.TextColor}:{color:"black"},{fontSize:16}]}>最热</Text>
        </TouchableOpacity>
      </View>
      
      {
           <FlatList
            refreshing={false}
            style={{ marginTop: 0 }}
            data={this.state.articlesList}
            onEndReachedThreshold={0.2}
            onEndReached={this._onEndReached}
            onRefresh={this.refresh} 
            renderItem={
              ({ item }) => {
                return (<Article report={this.report} article={item}></Article>)
              }
            }
            ListEmptyComponent={()=> {return(<View style={{paddingVertical:7,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>暂无内容哦</Text></View>)}}
            ListFooterComponent={()=> {
              if(this.state.end == 3) {
                return(<View style={{paddingVertical:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>没有更多内容啦</Text></View>)
              } else if(this.state.end == 2){
                return(<View style={{paddingVertical:10,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>加载中...</Text></View>)
              } else {
                return(<View></View>)
              }
            }}
            ItemSeparatorComponent={this._separator}
            keyExtractor={(item, index) => item.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
          />
      }


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
    )
  }
}

export default withNavigation(News);
