const _data = {
    "地铁1号线八通线(环球度假区--福寿岭)": 75,
    "地铁2号线内环(积水潭--积水潭)": 80,
    "地铁4号线大兴线(天宫院--安河桥北)": 90,
    "地铁5号线(天通苑北--宋家庄)": 80,
    "地铁6号线(金安桥--潞城)": 100,
    "地铁7号线(环球度假区--北京西站)": 80,
    "地铁8号线(朱辛庄--瀛海)": 80,
    "地铁9号线(国家图书馆--郭公庄)": 80,
    "地铁10号线内环(巴沟--巴沟)": 80,
    "地铁11号线(新首钢--模式口)": 100,
    "地铁13号线(西直门--东直门)": 75,
    "地铁14号线(张郭庄--善各庄)": 75,
    "地铁15号线(俸伯--清华东路西口)": 80,
    "地铁16号线(宛平城--北安河)": 80,
    "地铁17号线(嘉会湖--十里河)": 100,
    "地铁17号线北段(工人体育场--未来科学城北)": 100,
    "地铁19号线(牡丹园--新宫)": 120,
    "地铁昌平线(西土城--昌平西山口)":100,
    "地铁房山线(阎村东--东管头南)":100,
    "地铁亦庄线(宋家庄--亦庄火车站)":80,
    "首都机场线(3号航站楼--北新桥)":110,
    "地铁燕房线(阎村东--燕山)":80,
    "S1线(石厂--苹果园)":100,
    "西郊线(香山--巴沟)":70,
    "北京大兴国际机场线(草桥--大兴机场)":160,
    "亦庄T1线(定海园--屈庄(奔驰南))":80
    }

const { log } = require('console');
const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\47987\\Desktop\\Subway\\about_station\\station.json', 'utf8');
const json = JSON.parse(data);
// console.dir(json, { depth: null }); // Node.js环境下，展开所有层级
// console.log(JSON.stringify(obj, null, 2)); // 美化输出，以更易读的方式展示
for(it in json){
    for(i in json[it].edge){
      let _i = json[it].edge[i];
      for(ii in _data){
        
        if(ii == _i.line){
          // console.log(_data[ii]);
          json[it].edge[i].speed = _data[ii];
        }
      }
      // console.log(_data[JSON.stringify(_i.line)]);
      json[it].edge[i].time = parseFloat((_i.distance / (_i.speed * 5 / 36)).toFixed(9));
  }
  // console.log(json[it]);
}


const outputData = json;

const outputPath = 'C:\\Users\\47987\\Desktop\\Subway\\about_station\\_station.json';

const jstring = JSON.stringify(outputData, null, 2);
// 将数据写入到文件
fs.writeFile(outputPath, jstring, 'utf8', (err) => {
  if (err) {
    console.error('写入文件时出错：', err);
    return;
  }
  
  console.log('输出已成功写入到文件：', outputPath);
  // console.log(outputData);
})