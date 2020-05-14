import {log, logWarm, logErr} from './logs';
import {getToken} from './user';
import md5 from 'md5';
import AsyncStorage from '@react-native-community/async-storage';
import {baseurl} from './Global'
class Request {

  /**
    * 检测返回状态码
    * @param {*} status 
    * @param {*} res 
    */
  async _checkStatus(status, res, url) {
    if (status !== 200) {
      throw new Error('请求失败，请检查网络');
    }
  }
  requet_app = null
  /**
     * 内部实现网络请求
     * @param {*} url 
     * @param {*} options 
     */
    async _request(url, options, type) {
      url = url.indexOf('http') == 0 ? url : baseurl + url;
      //url = encodeURI(url);
      //console.log(url)
      let res = await fetch(url, options);
     
      this._checkStatus(res.status, res, url)
      let json = await this._jsonFactory(res, url, options)
      return json;
      
  }


  /**
    * 处理json数据
    * @param {*} res 
    * @param {*} url 
    */

  async _jsonFactory(res, url, options) {
    let json;
    let txt = '';
    try {
        txt = await res.text();
    } catch (e) {
        log('未拿到返回字符串', { url: url, txt: txt });
       //  throw new Error('数据格式错误');
    }
    try {
        json = JSON.parse(txt);
    } catch (e) {
        logErr('返回数据格式错误', { url: url, txt: txt });
        // throw new Error('数据格式错误');
    }
    log("请求返回", json, url, options);
    return json;
  }

  async post(url,data) {
    const body = this._getFormData(data);
    let headers = {'Content-Type':"application/x-www-form-urlencoded"}
    return this._request(url, {
      method: 'POST',
      headers: Object.assign(headers),
      timeout: 10000,
      body: body
    }, 'json')
  }

  async post3(url,data,type) {
    let json;
    url = url.indexOf('http') == 0 ? url : baseurl + url;
    let body;
    if(type!= null && type == 'formdata') {
      body = data
    } else {
      body = this._getFormData(data);
    }
    let option = {
      method: 'POST',
      timeout: 10000,
      body: body
    }
    let res = await fetch(url, option);
    let txt = '';
    try {
        txt = await res.text();
    } catch (e) {
        log('未拿到返回字符串', { url: url, txt: txt,option:option});
    }
    try {
      json = JSON.parse(txt);
  } catch (e) {
      logErr('返回数据格式错误', { url: url, txt: txt });
  }
    return json;
  }

  async post2(url,data) {
    let option = {
      method: 'POST',
      timeout: 10000,
      body: data
    }
    let res = await fetch(url, option);
    let txt = '';
    try {
        txt = await res.text();
    } catch (e) {
        log('未拿到返回字符串', { url: url, txt: txt,option:option});
    }
    return txt;
  }

  _getFormData(data) {
    let formData = [];
    for (let key in data) {
      let value = data[key];
      console.log(value)
      if(value) {
        value = value.toString().replace(/&/g,'%26');
      }
      
      formData.push(key + "=" + value);
    }
    formData = formData.join("&");
    return formData
  }

  _getToken() {
    const ts = new Date().getTime();
    const token = md5(ts + 'salt');
    return {ts, token}
  }
}

exports.Request = new Request();