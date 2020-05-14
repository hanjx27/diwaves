import React from 'react';
import {DeviceEventEmitter,TouchableOpacity,Alert,FlatList,Dimensions,Text,View,ActivityIndicator,Modal,TouchableWithoutFeedback} from 'react-native';

import Article from '../Article'
import Article_comment from '../Article_comment';
import Article_push from '../Article_push';
import PredictArticle from '../PredictArticle';
import { withNavigation } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import {px, isIphoneX} from '../../utils/px';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {WToast,WSnackBar,WModal} from 'react-native-smart-tip'
import {Colors} from '../../constants/iColors';
const {width,height} =  Dimensions.get('window');

class Focus extends React.Component {

    constructor(props) {
        super(props);
        this.myUpedcomments = {}
        this.pagecount = 10;
        this.contentindexs = []
        this.index = 0;

        this.state = {
          contentsList:[], //content_type:1 article 2 comment
          reportVisible:false,
          sort:'最新',
          end:1
        }
        this.reportarticleid = -1;
        this.reportList = {}
        this.reportCommentList = {}
        this.user = null
        this.flaglistloading = false;
    }


    reloadUpsAndReports = async() => {
      const reportListstr = await AsyncStorage.getItem('reportList');
      if(reportListstr) {
        this.reportList = JSON.parse(reportListstr)
      }

      const reportCommentListstr = await AsyncStorage.getItem('reportCommentList');
      if(reportCommentListstr) {
        this.reportCommentList = JSON.parse(reportCommentListstr)
      }

      await this.getUped();
    }
    
    componentDidMount = async() =>{
      this.reportArticleHandler = DeviceEventEmitter.addListener('reportArticle', (data) => {
        let contentsList = this.state.contentsList;
          for(let i = 0;i < contentsList.length;i++) {
            if(contentsList[i].content_type == 1 && contentsList[i].obj.id == data.id) {
              contentsList.splice(i,1);
              break;
            } else if(contentsList[i].content_type == 3 && contentsList[i].obj.article.id == this.reportarticleid) {
              contentsList.splice(i,1);
              break;
            } 
          }
          this.setState({
            contentsList:contentsList
          })
      });

      this.loginHandler = DeviceEventEmitter.addListener("login", async(data) => {
        const user = await AsyncStorage.getItem('user');
        if(user != null && user != '') {
            const json = JSON.parse(user);
            this.user = json;
            this.setState({
              contentsList:[],
              end:1
            },async()=> {
              await this.getUped();
              this.refresh();
            })
        }
      })

      this.logoutHandler = DeviceEventEmitter.addListener('logout', (data) => {
        this.user = null;
        this.index = 0;
        this.contentindexs = []
        this.setState({
          contentsList:[],
          end:1
        })
      });

      const reportListstr = await AsyncStorage.getItem('reportList');
      if(reportListstr) {
        this.reportList = JSON.parse(reportListstr)
      }

      const reportCommentListstr = await AsyncStorage.getItem('reportCommentList');
      if(reportCommentListstr) {
        this.reportCommentList = JSON.parse(reportCommentListstr)
      }
  
      const user = await AsyncStorage.getItem('user');
      if(user != null && user != '') {
        const json = JSON.parse(user);
        this.user = json;
        await this.getUped();
        await this.loadContentIndexs();
        await this.loadContents();
      }
    }

    getUped = async() => {
      if(!this.user) {
        return;
      }
      const myUpedcommentsstr = await AsyncStorage.getItem('myUpedcomments_' + this.user.id);
      if(myUpedcommentsstr != null) {
        Object.assign(this.myUpedcomments, JSON.parse(myUpedcommentsstr));
      } else {
        //初始化点赞数据
        try {
          const result = await Request.post('getUpedObjects',{
            userid:this.state.user.id,
          });
          if(result.code == 1) {
            const myUpedarticles = result.data.myUpedarticles
            const myUpedcomments = result.data.myUpedcomments
            const myUpedreplys = result.data.myUpedreplys
            AsyncStorage.setItem('myUpedarticles_' + this.user.id, JSON.stringify(myUpedarticles), function (error) {})
            AsyncStorage.setItem('myUpedcomments_' + this.user.id, JSON.stringify(myUpedcomments), function (error) {})
            AsyncStorage.setItem('myUpedreplys_' + this.user.id, JSON.stringify(myUpedreplys), function (error) {})
            this.myUpedcomments = myUpedcomments;
          }
        } catch (error) {
        }
      }
    }

    componentWillUnmount = ()=> {
      this.loginHandler.remove();
      this.logoutHandler.remove();
      this.reportArticleHandler.remove();
    }

    loadContentIndexs = async() => {
      const result = await Request.post('focusContentIDsForApp',{
        userid:this.user.id,
        sort:this.state.sort
      });
      if(result.code == 1) {
          this.contentindexs = result.data
          /*if(this.contentindexs.length > 0) {
            this.setState({
              end:2
            })
          }*/
      }
    }
  
    loadContents = async(refresh)=> {
      if(this.index == this.contentindexs.length) {
        return;
      }
      this.setState({
        end:2
      })
      let indexs = [];
      let count = 0;
      for(this.index;this.index < this.contentindexs.length;this.index++) {
        indexs.push(this.contentindexs[this.index])
        count++;
        if(count == this.pagecount) {
          this.index++;
          break;
        }
      }

      try {
          const result = await Request.post('contentsForAPP',{
            indexs:JSON.stringify(indexs)
          });
          if(result.code == 1) {
              let contents = []
              if(!refresh) {
                contents = this.state.contentsList
              }
              await this.reloadUpsAndReports();
              for(let i = 0;i < indexs.length;i++) {
                if(indexs[i].objtype == 1) {
                  try {
                    if(this.reportList[indexs[i].objid] == 1) {
                      continue;
                    }
                    if(!result.data.articles[indexs[i].objid]) {
                      continue;
                    }
                    let content = {}
                    content.content_type = 1;
                    content.obj = result.data.articles[indexs[i].objid]
                    contents.push(content)
                  } catch(e) {
                  }
                  
                } else if(indexs[i].objtype == 2) {
                  try {
                    if(this.reportCommentList[indexs[i].objid] == 1) {
                      continue;
                    }
                    if(!result.data.comments[indexs[i].objid]) {
                      continue;
                    }
                    let content = {}
                    content.content_type = 2;
                    content.obj = result.data.comments[indexs[i].objid]
                    contents.push(content)
                  } catch(e) {

                  }
                 
                } else if(indexs[i].objtype == 3) {//取消了push这个类型，推送放在comment表里了
                  try {
                    if(this.reportList[result.data.pushs[indexs[i].objid].articleid] == 1) { //判断 push 的article是否被举报
                      continue;
                    }
                    if(!result.data.pushs[indexs[i].objid]) {
                      continue;
                    }
                    let content = {}
                    content.content_type = 3;
                    content.obj = result.data.pushs[indexs[i].objid]
                    contents.push(content)
                  } catch(e) {
                  }
                  
                }
              }
              this.setState({
                contentsList:contents
              })
              if(this.index == this.contentindexs.length) {
                this.setState({
                  end:3
                })
              } else {
                this.setState({
                  end:1
                })
              }
          }
        } catch (error) {
          console.log(error)
        }
    }
  
  
    refresh = async()=> {
      if(this.user == null) {
        return;
      }
      this.contentindexs = []
      this.index = 0;
      this.setState({
        contentsList:[],
        end:1
      })
      this.flaglistloading = true;
      await this.loadContentIndexs();
      await this.loadContents(true);
      this.flaglistloading = false;
    }
  
    _onEndReached = async() => {
      if(this.user == null) {
        return;
      }

      if(this.flaglistloading) {
        return;
      }
      if(this.index == this.contentindexs.length) {
        return;
      }
      this.flaglistloading = true;
      await this.loadContents(false);
      this.flaglistloading = false;
    }
    


    report = (articleid,title,publishuserid) => {
      this.reportarticleid = articleid;
      this.reportarticletitle = title;
      this.publishuserid = publishuserid
      this.reportcommentid = -1;
      this.setState({
        reportVisible:true
      })
    }

    report3 = (articleid,title,publishuserid) => { // push的举报，举报文章
      this.reportarticleid = articleid;
      this.reportarticletitle = title;
      this.publishuserid = publishuserid
      this.reportcommentid = -1;
      this.setState({
        reportVisible:true
      })
    }
  
    report2 = (commentid,title,publishuserid) => {
      this.reportcommentid = commentid;
      this.reportcommenttitle = title;
      this.publishuserid = publishuserid;
      this.setState({
        reportVisible:true
      })
    }
  
    reportObj = (text)=> {
      if(this.reportcommentid == -1) {
        this.reportArticle(text);
      } else {
        this.reportComment(text);
      }
    }

    reportComment = async(text) => {
      this.reportCommentList[this.reportcommentid] = 1;
      AsyncStorage.setItem('reportCommentList', JSON.stringify(this.reportCommentList), function (error) {})
  
      try {
        const result = await Request.post('addReport',{
          userid:!!this.user?this.user.id:'',
          objid:this.reportcommentid,
          text:text,
          title:this.reportcommenttitle,
          publishuserid:this.publishuserid,
          type:2
        });
        if(result.code == -2) {
          Alert.alert('您已被封禁')
          return;
        }
        if(result.code == 1) {
          let contentsList = this.state.contentsList;
          for(let i = 0;i < contentsList.length;i++) {
            if(contentsList[i].content_type == 2 && contentsList[i].obj.id == this.reportcommentid) {
              contentsList.splice(i,1);
              break;
            }
          }
          this.setState({
            reportVisible:false,
            contentsList:contentsList
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

    reportArticle = async(text) => {
      if(this.reportarticleid == -1) {
        return;
      }
      this.reportList[this.reportarticleid] = 1;
      AsyncStorage.setItem('reportList', JSON.stringify(this.reportList), function (error) {})
  
      
      try {
        const result = await Request.post('addReport',{
          userid:!!this.user?this.user.id:'',
          objid:this.reportarticleid,
          title:this.reportarticletitle,
          type:1,
          publishuserid:this.publishuserid,
          text:text
        });
        if(result.code == -2) {
          Alert.alert('您已被封禁')
          return;
        }
        if(result.code == 1) {
          let contentsList = this.state.contentsList;
          for(let i = 0;i < contentsList.length;i++) {
            if(contentsList[i].content_type == 1 && contentsList[i].obj.id == this.reportarticleid) {
              contentsList.splice(i,1);
              break;
            } else if(contentsList[i].content_type == 3 && contentsList[i].obj.article.id == this.reportarticleid) {
              contentsList.splice(i,1);
              break;
            } 
          }
          this.setState({
            reportVisible:false,
            contentsList:contentsList
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
    return (
      <View style={{flex:1}}>  
      {
           <FlatList
            refreshing={false}
            style={{ marginTop: 0 }}
            data={this.state.contentsList}
            onEndReachedThreshold={0.2}
            onEndReached={this._onEndReached}
            onRefresh={this.refresh} 
            renderItem={
              ({ item }) => {
                if(item.content_type == 1) {
                  return (<Article report={this.report} article={item.obj}></Article>)
                } else if(item.content_type == 2) {
                  return(<Article_comment report={this.report2} myUpedcomments={this.myUpedcomments} user={this.user} commenthome={item.obj}></Article_comment>)
                } else if(item.content_type == 3) {
                  return(<Article_push report={this.report3} user={this.user} pushhome={item.obj}></Article_push>)
                }
              }
            }
            ListEmptyComponent={()=> {
              if(this.state.end == 1) {return(<View style={{marginTop:15,paddingVertical:7,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:15,color:'#999'}}>暂无内容</Text></View>)}
              else {return(<View></View>)}
            }}
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
            keyExtractor={(item, index) => item.content_type + '&' + item.obj.id} //注意！！！必须添加，内部的purecomponent依赖它判断是否刷新，闹了好久的问题
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

            <TouchableWithoutFeedback onPress={() => this.reportObj('低俗色情')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>低俗色情</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportObj('虚假欺诈')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>虚假欺诈</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportObj('暴恐涉政')}>
            <View style={{marginHorizontal:10,paddingVertical:15,borderBottomWidth:0.4,borderBottomColor:'#e1e1e1'}}>
            <Text style={{color:'black',fontSize:15}}>暴恐涉政</Text>
            </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.reportObj('涉及违禁品')}>
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

export default withNavigation(Focus);
