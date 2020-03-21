import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  Image,
} from 'react-native';
import { withNavigation } from 'react-navigation';

import {Colors} from '../constants/iColors';
const {width,height} =  Dimensions.get('window');
import { baseimgurl, baseurl } from '../utils/Global';
import { Request } from "../utils/request";
import Datetime from '../components/Datetime';

class ThumbArticle extends React.PureComponent {
  constructor(props) {
    super(props);
    
    this.article = this.props.article;
    this.getArticleDone = !!this.article.username ? true : false
    this.audioPlayBgs = [
        require('../images/u448_3.png'),
        require('../images/u448_2.png'),
        require('../images/u448.png')
      ]
      this.audioPlayBgsIndex = 2;
      this.interval = null;

    this.state = {
        audioPlayBg:this.audioPlayBgs[2],
    }
  }
  static defaultProps = {
  }
  
  
  componentDidMount() {
   
  }
  componentWillUnmount() {
    
  } 

  getArticle = async() => {
    if(this.getArticleDone) {
      return;
    }
    try {
      const result = await Request.post('getArticleByIdForApp',{
        articleid:this.article.id
      });
      if(result.code == 1) {
        this.article = result.data;
        this.getArticleDone = true;
      }
    } catch (error) {
      console.log(error)
    }
  }

  goArticleDetail = async() => {
    await this.getArticle();
    this.props.navigation.navigate('ArticleScreen',{article:this.article});
  }


  render() {
   
    return (
        <TouchableOpacity onPress={this.goArticleDetail}>
            {this.article.category == 1 &&
            <View style={[this.props.style,{paddingLeft:5,height:60,paddingVertical:5,backgroundColor:'#f7f7f7',display:'flex',flexDirection:'row'}]}>
                {this.article.pic != '' &&
                <Image style={{width:50,height:50}} source={{uri:baseimgurl + this.article.pic}}></Image>
                }
                <View style={{paddingLeft:10,paddingRight:15,flex:1,display:'flex',justifyContent:'center'}}>
                    <Text numberOfLines={2} ellipsizeMode={'tail'} style={{lineHeight:20,fontSize:14,color:'black'}}>{this.article.title}</Text>
                </View>
            </View>
            }
            {this.article.category == 2 &&
            <View style={[this.props.style,{paddingLeft:5,height:60,paddingVertical:5,backgroundColor:'#f7f7f7',display:'flex',alignItems:'center',flexDirection:'row'}]}>
                <Image source={this.state.audioPlayBg} style={{display:'none',marginLeft:10,width:30,height:26}}></Image>
                <View style={{paddingLeft:10,paddingRight:15,flex:1,justifyContent:'center'}}>
                    <Text numberOfLines={2} ellipsizeMode={'tail'} style={{lineHeight:20,fontSize:14,color:'black'}}>{this.article.title}</Text>
                </View>
            </View>
            }
        </TouchableOpacity>
    )
  }
}

export default withNavigation(ThumbArticle);
