// const { log } = require('console');
const fs = require('fs');
const t_data = fs.readFileSync('C:\\Users\\47987\\Desktop\\Subway\\about_time\\time.json', 'utf8');
const t_json = JSON.parse(t_data);
let newt = t_json;

const s_data = fs.readFileSync('C:\\Users\\47987\\Desktop\\Subway\\about_time\\f_station.json', 'utf8');
const s_json = JSON.parse(s_data);
let news = s_json;

// let sta = [
//     "草桥",
//     "大兴新城",
//     "大兴机场"
// ]

//检查
// for(i in s_json){
//     let 
// }


//完善f_station.json
// for(let i = 0; i < sta.length - 1; i++){
//     // if(!news[sta[i]]){
//     //     console.log(sta[i]);
//     //     break;
//     // }
//     let e = news[sta[i]].edge;
//     let flag = 0;
//     for(let j in e){
//         let to = e[j].station;
//         // console.log(sta[i + 1]);
//         if(to == sta[i + 1]){
//             flag = 1;
//             // console.log(sta[i + 1]);
//             if(news[sta[i]].edge[j].directions) console.error(sta[i], news[sta[i]]);
//             else news[sta[i]].edge[j].directions = 1;
//             // news[sta[i]].edge[j].directions = 1;
//         }
//     }
//     if(flag === 0) console.error(flag, sta[i], news[sta[i]])
// }
// for(let i = sta.length - 1; i > 0; i--){
//     // if(!news[sta[i]]){
//     //     console.log(sta[i]);
//     //     break;
//     // }
//     let e = news[sta[i]].edge;
//     let flag = 0;
//     for(let j in e){
//         let to = e[j].station;
//         // console.log(sta[i + 1]);
//         if(to == sta[i - 1]){
//             flag = 1;
//             // console.log(sta[i + 1]);
//             if(news[sta[i]].edge[j].directions) console.error(sta[i], news[sta[i]]);
//             else news[sta[i]].edge[j].directions = 2;
//             // if(sta[i] == "清河站") console.log(sta[i - 1]), console.log(news[sta[i]].edge[j])
//             // news[sta[i]].edge[j].directions = 2;
//         }
//     }
//     if(flag === 0) console.error(flag, sta[i], news[sta[i]])
// }

// const outputData = news;

// const outputPath = 'C:\\Users\\47987\\Desktop\\Subway\\about_time\\f_station.json';

// const jstring = JSON.stringify(outputData, null, 2);
// // 将数据写入到文件
// fs.writeFile(outputPath, jstring, 'utf8', (err) => {
//   if (err) {
//     console.error('写入文件时出错：', err);
//     return;
//   }
  
//   console.log('输出已成功写入到文件：', outputPath);
//   // console.log(outputData);
// })

// 检验
// for(i in s_json){
//     let e = s_json[i].edge;
//     for(j in e){
//         if(!e[j].directions){
//             console.log(i, s_json[i]);
//         }
//     }
// }



// 生成t_station.json文件
for (let station in t_json) {
    // console.log(`Station:`, station);
    const lines = t_json[station];
    for (let line in lines) {
        // console.log(`  Line: ${line}`);
        const directions = lines[line];
        for (let Id in directions) {
            // console.log(`    Direction ID: ${Id}`);
            let s = station;
            let to = station;
            let flag = 0;
            // let tttttttttttttttt = 0;
            while(to){
                flag = 0;
                let e = s_json[s].edge;
                for(let i in e){
                    // if(e[i].station == "大兴新城"){
                    //     console.log(e[i].line, line, e[i].directions, Id);
                    // }
                    if(e[i].line == line && e[i].directions == Id){
                        // console.log(e[i]);
                        flag = 1;
                        to = e[i].station; 
                        let ns, time = e[i].time / 60;
                        const dayTypes = t_json[s][line][Id];
                        if(!newt[to]) newt[to] = {};
                        if(!newt[to][line]) newt[to][line] = {};
                        if(!newt[to][line][Id]) ns = newt[to][line][Id] = {};
                        else{
                            // console.log(to, newt[to]);
                            flag = 0;
                            break;
                        }
                        for (let dayType in dayTypes) {
                            // console.log(`      Day Type: ${dayType}`);
                            ns[dayType] = {};
                            const hours = dayTypes[dayType];
                            let hh = "";
                            let h0 = [], h1 = [];
                            for (let hour in hours) {
                                for (let m of hours[hour]){
                                    let min = m + time;
                                    // if(tttttttttttttttt == 0) console.log(m, min);
                                    if(min >= 60){
                                        min -= 60;
                                        // if(tttttttttttttttt == 0) console.log("a1", h1);
                                        h1.push(min);
                                        // if(tttttttttttttttt == 0) console.log("b1", h1);
                                    }else{
                                        // if(tttttttttttttttt == 0) console.log("a0", h0);
                                        h0.push(min);
                                        // if(tttttttttttttttt == 0) console.log("b0", h0);
                                    }
                                    if(h0.length > 0){
                                        ns[dayType][hour] = [];
                                        ns[dayType][hour] = h0;
                                    }
                                }
                                h0 = h1;
                                h1 = [];
                                hh = hour;
                            }
                            if(hh == "21"){hh = "22";}else if(hh == "22"){hh = "23";}else if(hh == "23"){hh = "0";}else if(hh == "0"){hh = "1";}
                            else if(hh == "1"){hh = "2";}else if(hh == "2"){hh = "3";}else if(hh == "3"){hh = "4";}else if(hh == "4"){hh = "5";}
                            else if(hh == "5"){hh = "6";}else if(hh == "6"){hh = "7";}
                            if(h0.length > 0){
                                ns[dayType][hh] = [];
                                ns[dayType][hh] = h0;
                            }
                        }
                        // if(tttttttttttttttt == 0) console.log(ns);
                        // tttttttttttttttt = 1;
                        newt[to][line][Id] = ns;
                    }
                }
                if(flag == 0) break;
                s = to;
            }
            // const dayTypes = directions[Id];
            // for (let dayType in dayTypes) {
            //     // console.log(`      Day Type: ${dayType}`);
            //     const hours = dayTypes[dayType];
            //     for (let hour in hours) {
            //         // console.log(`        Hour: ${hour}, Times: ${hours[hour].join(', ')}`);
            //     }
            // }
        }
    }
}

const outputData = newt;

const outputPath = 'C:\\Users\\47987\\Desktop\\Subway\\about_time\\t_station.json';

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