mapboxgl.accessToken = 'pk.eyJ1IjoieWx4cyIsImEiOiJjbHVpMzJjamkwMDdxMmltdjBsZTlwd2k4In0.ozzRwxTuSpzrh2ZRWhTszA'; // 使用您的Mapbox访问令牌

// 导入 initial 函数和 dijkstra 算法的两个变体
import { initial } from './initial.js';          // 从 'initial.js' 文件导入 initial 函数，此函数可能用于初始化或配置应用的起始状态
import { dijkstra_cnt, dijkstra_time } from './dijkstra.js';  // 从 'dijkstra.js' 文件导入两个 Dijkstra 算法的变体，一个用于计算最少换乘次数，一个用于计算最短时间

// 执行 initial 函数，并将返回的结果存储在变量 g 中
let g = initial();                             // 变量 g 可能包含地图、网络或其他全局配置的初始化数据

// 定义一个 GeoJSON 对象，用于存储地理路径数据
let geoPath = {
    "type": "FeatureCollection",               // 指定 GeoJSON 对象的类型为 FeatureCollection，这是一种用来包含多个地理要素的集合
    "features": []                             // 初始化一个空的要素数组，这里将用来存储地理数据的具体要素，如线路、点等
};

// 添加重置按钮的点击事件监听
document.getElementById('re').addEventListener('click', function(){
    // 重置全局变量g到初始状态，假设initial()是一个返回初始设置的函数
    g = initial();
    
    // 隐藏结果容器div
    document.querySelector('.result-container').style.display = 'none';
    // 隐藏添加站点的窗口
    document.querySelector('.adds').style.display = 'none';
    // 清空添加站点输入框的内容
    document.getElementById('adds_in').value = '';
    // 设置地图上的route-arrows图层为不可见
    map.setLayoutProperty('route-arrows', 'visibility', 'none');

    // 移除所有选中状态的按钮或元素的'selected'类
    document.querySelectorAll('.selected').forEach(b => {
        b.classList.remove('selected');
    });
    // 隐藏添加线路的窗口
    document.querySelector('.addl').style.display = 'none';

    // 清空添加线路表单内的输入框内容
    document.getElementById('addl_in').value = '';
    document.getElementById('siteCount').value = '';
    document.getElementById('maxSpeed').value = '';
    // 隐藏时刻表添加窗口
    document.querySelector('#addtime').style.display = 'none';

    // 再次确认结果容器是隐藏的（可能为重复代码，用于确保容器被隐藏）
    document.querySelector('.result-container').style.display = 'none';
    // 重置地图上的点数据
    map.getSource('point').setData(g.point);
    // 使地图飞行到指定的视角，即北京的经纬度及相关视图设置
    map.flyTo({
        center: [116.3848, 39.9042],
        zoom: 11.6,
        pitch: 40,
        bearing: 0,
        essential: true
    });
});

// 获取页面中ID为'close_button'的元素并添加点击事件监听器
document.getElementById('close_button').addEventListener('click', function(){
    // 当点击按钮时执行以下函数

    // 选择CSS类名为'result-container'的元素并将其display样式设置为'none'，从而隐藏结果容器
    document.querySelector('.result-container').style.display = 'none';

    // 调用Mapbox GL JS的API方法setLayoutProperty，设置名为'route-arrows'的图层的可见性为'none'，即隐藏该图层
    map.setLayoutProperty('route-arrows', 'visibility', 'none');
});

// 创建一个新的Mapbox地图实例
const map = new mapboxgl.Map({
    container: 'map', // 指定地图容器的HTML元素的ID，这里是一个具有id="map"的div元素
    style: 'mapbox://styles/ylxs/cluv8pcn5001m01r77kxdcd32', // 设置地图的样式，这是一个Mapbox Studio中自定义的样式URL
    center: [116.3848, 39.9042], // 设置地图的初始中心点，这里使用的是北京的经纬度坐标
    zoom: 11.6, // 设置地图的初始缩放级别，较高的缩放级别可以让地图显示更详细的街道信息
    pitch: 40 // 设置地图的初始倾斜角度，使得地图有更多的三维视觉效果
  });  

// 事件监听器：当地图加载完成后执行以下函数
map.on('load', function () {
    // 添加GeoJSON数据源用于路线
    map.addSource('route', {
        'type': 'geojson',  // 指定数据类型为GeoJSON
        'data': geoPath     // 使用geoPath变量作为数据源
    });

    // 添加箭头图层，用于在路线上显示方向箭头
    map.addLayer({
        'id': 'route-arrows',   // 图层ID，用于标识图层
        'type': 'symbol',       // 图层类型为符号，常用于显示图标或标签
        'source': 'route',      // 指定数据源为之前添加的'route'
        'layout': {
            'symbol-placement': 'line',     // 置放于线型图层上
            'text-field': '▶',              // 使用三角形箭头符号作为文本字段
            'text-size': 24,                // 设置文本大小为24
            'text-keep-upright': false,     // 允许文本随线条方向旋转
            'symbol-spacing': 1,            // 符号间距为1单位
            'text-allow-overlap': true,     // 允许文本重叠
            'icon-allow-overlap': true      // 允许图标重叠
        },
        'paint': {
            'text-color': '#000',           // 设置箭头颜色为黑色
            'text-halo-color': '#FFF',      // 设置文本边框颜色为白色
            'text-halo-width': 2            // 设置边框宽度为2像素
        }
    });

    // 再次添加GeoJSON数据源用于点
    map.addSource('point', {
        'type': 'geojson',  // 指定数据类型为GeoJSON
        'data': g.point     // 使用g.point变量作为数据源，其中存储站点信息
    });

    // 创建一个图层来展示GeoJSON数据中的点，并定义其样式
    map.addLayer({
        'id': 'bj-point',  // 图层ID
        'type': 'circle',  // 图层类型为圆形
        'source': 'point', // 数据源为'point'
        'paint': {
            // 根据属性line_siz设置圆圈的颜色
            'circle-color': [
                'match',          // 使用match表达式来匹配line_siz属性
                ['get', 'line_siz'],  // 获取line_siz属性
                0, '#ffffff',     // 如果line_siz为0，则颜色为白色
                1, '#ffffff',     // 如果line_siz为1，颜色也为白色
                '#fff78a'         // 默认颜色
            ],
            'circle-opacity': [
                'case',          // 使用case表达式来决定透明度
                ['any', ['==', ['get', 'line_siz'], 0], ['==', ['get', 'status'], '建设中']],
                // 如果line_siz为0或status为'建设中'，透明度为0
                0,
                1                // 其他情况透明度为1
            ],
            'circle-radius': 6,     // 圆的半径为6单位
            'circle-stroke-width': 1,  // 圆的边框宽度为1单位
            'circle-stroke-color': '#000000'  // 边框颜色为黑色
        }
    });
});

// 监听地图的点击事件
map.on('click', (event) => {
    // 使用 queryRenderedFeatures 方法查询点击位置的特征，这里指定查询 'bj-point' 图层
    const features = map.queryRenderedFeatures(event.point, {
      layers: ['bj-point']
    });
  
    // 如果没有找到任何特征，直接返回不执行后续代码
    if (!features.length) {
      return;
    }
  
    // 获取查询到的第一个特征，即用户点击的第一个站点
    const feature = features[0];
  
    // 创建一个新的弹出窗口，设置偏移以避免遮挡标记
    const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates); // 设置弹出窗口的位置为特征的坐标
  
    // 构建弹出窗口的HTML内容，包括站点名称和状态
    let htmlContent = `<h3>${feature.properties.station_name}</h3>`; // 显示站点名称
    htmlContent += `<span>${feature.properties.status}</span>`; // 显示站点状态
  
    // 检查并处理 lines 数组，添加每条线路信息到 HTML 字符串中
    if (feature.properties.lines && feature.properties.lines.length > 0) {
      let flag = 0; // 标志变量，用于跟踪字符串解析状态
      // 遍历线路数组中的每一个元素
      for (let i = 0; i < feature.properties.lines.length; i++) {
          let line = feature.properties.lines[i];
          // 根据字符进行状态转换和内容提取
          if(line == '('){
            flag = 2;
          }else if(line == ','){
            flag = 0;
          }else if(flag == 0 && line == '"'){
            flag = -1;
            continue;
          }else if(flag == -2 && line == '"'){
              flag = 2;
          }
          // 根据当前的flag状态决定如何处理字符
          if(flag >= 0) continue;
          if(flag == -1){
            htmlContent += `<span><br>${line}</span>`; // 添加新的线路信息，并换行显示
            flag = -2;
          }else{
            htmlContent += `<span>${line}</span>` // 继续添加当前线路信息
          }
      }
    }
    // 设置弹出窗口的HTML内容并将其添加到地图上显示
    popup.setHTML(htmlContent)
      .addTo(map);
  });  

// 定义一个自动完成功能的函数
function autocomplete(inp, arr) {
    var currentFocus; // 用于跟踪当前聚焦的项目

    // 当输入框中的值改变时触发的事件
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value; // 获取输入框的当前值
        closeAllLists(); // 关闭已经打开的所有自动完成列表
        if (!val) { return false;} // 如果输入框为空，则不显示任何东西
        currentFocus = -1; // 重置当前聚焦的项目
        a = document.createElement("DIV"); // 创建一个新的DIV元素作为自动完成项的容器
        a.setAttribute("id", this.id + "autocomplete-list"); // 设置DIV的ID
        a.setAttribute("class", "autocomplete-items"); // 设置DIV的类名
        this.parentNode.appendChild(a); // 将这个新的DIV添加到输入框的父节点下
        for (i = 0; i < arr.length; i++) { // 遍历预定义的自动完成数组
            // 检查数组中的元素是否以输入框中的字符开始
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV"); // 创建一个新的DIV用于每个匹配的元素
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>"; // 高亮显示匹配的部分
                b.innerHTML += arr[i].substr(val.length); // 添加非高亮的部分
                b.addEventListener("click", function(e) { // 为每个项添加点击事件
                    inp.value = this.innerText; // 点击时，将输入框的值设置为选中的项的文本
                    closeAllLists(); // 关闭列表
                });
                a.appendChild(b); // 将项添加到列表中
            }
        }
    });

    // 定义一个函数，用于关闭所有自动完成列表
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items"); // 获取所有自动完成项容器
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) { // 如果点击的元素不是列表项或输入框
                x[i].parentNode.removeChild(x[i]); // 移除该自动完成列表
            }
        }
    }

    // 监听整个文档的点击事件，以关闭自动完成列表
    document.addEventListener("click", function (e) {
        closeAllLists(e.target); // 调用关闭列表的函数
    });
}

// 定义一个自动完成功能的函数
function _autocomplete(inp, arr) {
    var currentFocus;  // 用于跟踪当前聚焦的自动完成项

    // 监听输入框的输入事件
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;  // 获取当前输入值
        closeAllLists();  // 在每次输入时关闭所有已打开的自动完成列表
        if (!val) { return false;}  // 如果输入为空，直接返回
        currentFocus = -1;  // 重置当前聚焦的项

        // 创建一个DIV来作为自动完成的项的容器
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autolist-items");
        this.parentNode.appendChild(a);  // 将这个DIV添加为输入框的同级元素

        // 遍历自动完成的数组
        for (i = 0; i < arr.length; i++) {
            // 如果数组中的项的前缀与输入匹配（不区分大小写）
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");  // 创建一个新的DIV用来显示匹配的项
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";  // 匹配的部分用粗体显示
                b.innerHTML += arr[i].substr(val.length);  // 非匹配的部分正常显示
                // 为每个匹配的项添加点击事件
                b.addEventListener("click", function(e) {
                    inp.value = this.innerText;  // 将输入框的值设置为点击项的文本
                    closeAllLists();  // 关闭列表
                });
                a.appendChild(b);  // 将每个匹配的项添加到列表中
            }
        }
    });

    // 定义一个函数，用于关闭所有自动完成列表，除非指定元素是当前输入框
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autolist-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);  // 移除非当前输入框的自动完成列表
            }
        }
    }

    // 添加点击事件监听器到文档，点击任何地方关闭自动完成列表
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

// 计算GeoJSON数据的边界
function calculateBounds(geojson) {
    // 初始化边界值，使用极限值来确保任何实际坐标都会更新这些边界
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

    // 遍历GeoJSON中的所有特征（feature），通常是点、线或多边形等地理数据
    for(let feature of geojson.features){
        // 遍历每个特征的坐标，对于点来说是单个坐标，对于线和多边形则是坐标数组
        for(let coord of feature.geometry.coordinates){
            let lng = coord[0]; // 提取经度值
            let lat = coord[1]; // 提取纬度值

            // 检查并更新最小经度
            if (lng < minLng) minLng = lng;
            // 检查并更新最大经度
            if (lng > maxLng) maxLng = lng;
            // 检查并更新最小纬度
            if (lat < minLat) minLat = lat;
            // 检查并更新最大纬度
            if (lat > maxLat) maxLat = lat;
        }
    }
    // 返回计算得到的地理边界，格式为[[西南角的经纬度], [东北角的经纬度]]
    return [[minLng, minLat], [maxLng, maxLat]]; 
}

// updata_path 函数用于更新地图上的路径表示并调整视角以确保新路径可见
function updata_path() {
    // 设置路线箭头图层为可见状态
    map.setLayoutProperty('route-arrows', 'visibility', 'visible');

    // 获取名为 'route' 的数据源，并用最新的 geoPath 数据更新它
    // geoPath 应该包含表示地图上路径的 GeoJSON 数据
    map.getSource('route').setData(geoPath);

    // 调用 calculateBounds 函数计算 geoPath 的边界
    // 这个函数返回一个包含西南角和东北角坐标的数组
    const bounds = calculateBounds(geoPath);

    // 使用 map.fitBounds 方法根据计算出的边界调整地图视角
    // 包含一定的内边距设置以确保路径在视窗中完全可见
    map.fitBounds(bounds, {
        padding: {top: 20, bottom: 20, left: 380, right: 480},
    });
}

// 添加路径函数：在地图上绘制从起点到终点的直线
function add_path(start, end){
    // 定义变量存储起点和终点的地理坐标
    let s, e;

    // 遍历地点集合中的所有特征，寻找匹配的起点和终点
    g.point.features.forEach(function(feature) {
        // 如果特征的站点名称与起点名称相符，并且站点状态为"运营中"，则记录其坐标作为起点
        if (feature.properties.station_name == start && feature.properties.status == "运营中") {
            s = feature.geometry.coordinates;
        }
        // 如果特征的站点名称与终点名称相符，并且站点状态为"运营中"，则记录其坐标作为终点
        if (feature.properties.station_name == end && feature.properties.status == "运营中") {
            e = feature.geometry.coordinates;
        }
    });

    // 将起点和终点坐标添加到地理路径集合中，形成一条新的线段特征
    geoPath.features.push({
        "type": "Feature", // GeoJSON特征的类型
        "properties": {},  // 此特征的属性（此处为空）
        "geometry": {
            "type": "LineString", // 几何类型为线型
            "coordinates": [
                s, // 起点的经纬度坐标
                e  // 终点的经纬度坐标
            ]
        }
    });
}

// 函数 toHtml 根据路径查询结果生成HTML展示内容
function toHtml(res){
    // 初始化一个空的GeoJSON FeatureCollection
    geoPath = {
        "type": "FeatureCollection",
        "features": []
    };

    let html, cost; // 定义变量用于存储HTML内容和计算的费用

    // 根据行驶的距离计算费用
    if(res.distance <= 6000){
        cost = 3;
    } else if(res.distance <= 12000){
        cost = 4;
    } else if(res.distance <= 22000){
        cost = 5;
    } else if(res.distance <= 32000){
        cost = 6;
    } else {
        cost = 6;
        let d = res.distance - 32000; // 距离超过32000米后的额外距离
        if(d % 20000){
            d = Math.floor(d / 20000) + 1; // 每超过20000米增加一点费用
        }else{
            d /= 20000;
        }
        cost += d; // 将额外费用加到基本费用上
    }
    cost = Math.floor(cost); // 确保费用为整数

    // 将时间从分钟转换为小时和分钟
    let min = Math.round(res.time);
    let hour = Math.floor(min / 60);
    min %= 60;

    // 距离转换为公里或保留为米
    let d = res.distance / 1000;
    let df = Math.floor(d);
    if(df) html = `<h3>距离：${d}公里<h3>`;
    else html = `<h3>距离：${res.distance}米<h3>`;

    // 添加时间信息到HTML
    if(hour) html += `<h3>时间：${hour}小时${min}分钟<h3>`;
    else html += `<h3>时间：${min}分钟<h3>`;

    // 添加费用信息到HTML
    html += `<h3>费用：¥${cost}<h3>`;

    // 获取当前时间，用于计算预计到达时间
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // 初始化一个标记变量，用于标识当前路线
    let li = "-1";
    let tl = res.list; // 路线列表

    // 遍历路线列表，为每个路径添加HTML内容和更新地理路径
    for(let i = 0; i < tl.length - 1; i++){
        add_path(tl[i].name, tl[i + 1].name); // 更新地理路径
        let l = tl[i].line;
        let le = tl[i + 1].line;
        let col = g.color[l];
        let cole = g.color[le];
        if(g.mp_in[le]) le = g.mp_in[le];
        if(g.mp_in[l]) l = g.mp_in[l];

        // 处理换乘逻辑，显示不同颜色的圆点和线路信息
        if(le != li){
            if(li != -1) html += `<div class="color-dot" style="background-color:${col};"></div><span>${tl[i].name}</span><br>……<br><br>`;
            html += `<div class="color-dot" style="background-color:${cole};"></div><span>${tl[i].name}</span>--<div class = "color-tex" style="background-color:${cole};">${le}</div><br>`;
            li = le;
        }else html += `<div class="color-dot" style="background-color:${col};"></div><span>${tl[i].name}</span><br>`;

        // 当到达列表末尾，处理到达时间
        if(i == tl.length - 2){
            i += 1;
            let m = Math.round(res.time) + minutes;
            let h = Math.floor(m / 60);
            m %= 60;
            h += hours;
            h %= 24;
            let hs = h.toString().padStart(2, '0');
            let ms = m.toString().padStart(2, '0');
            html += `<div class="color-dot" style="background-color:${cole};"></div><span>${tl[i].name}</span><br><br>预计到达时间：${hs}:${ms}`;
            break;
        }
    }
    updata_path(); // 调用更新地图路径的函数
    return html; // 返回生成的HTML内容
}

// 给删除地铁线路表单添加事件监听器
document.getElementById('delet_line').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单的默认提交行为，即阻止页面刷新

    // 获取用户输入的地铁线路名称
    let line = document.getElementById('delete').value;
    // 查找该线路在地铁线路数组中的索引
    let index = g.line.indexOf(line);
    // 使用映射关系转换线路名称，用于内部处理
    line = g.mp[line];

    // 检查线路名称是否存在
    if (index >= 0) {
        // 使用 splice() 方法从地铁线路数组中删除指定索引处的线路
        g.line.splice(index, 1);

        // 遍历所有站点，从站点的线路列表中删除这条线路
        for(let station in g.sjson){
            let lines = g.sjson[station].lines;
            for(let i in lines){
                if(lines[i] == line){
                    lines.splice(i, 1);  // 从线路列表中删除
                    g.sjson[station].line_siz--;  // 更新该站点的线路数量
                }
            }
        }

        // 更新地图上的地点特征，以反映线路的删除
        for(let ii in g.point.features){
            let lines = g.point.features[ii].properties.lines;
            for(let i in lines){
                if(lines[i] == line){
                    lines.splice(i, 1);  // 从特征的线路列表中删除
                    g.point.features[ii].properties.line_siz--;  // 更新特征的线路数量
                }
            }
        }

        // 更新地图的点数据源，以显示最新的地图数据
        map.getSource('point').setData(g.point);

        // 显示确认消息，通知用户线路已被删除
        confirm(`已删除${line}`);
    } else {
        // 如果未找到线路，提示用户输入正确的地铁线路名称
        alert("请输入正确的地铁线路名称");
    }
});

// 定义用于存储路径计算结果的变量
let res_cnt;
let res_time;

// 添加事件监听器，处理查询路径表单提交事件
document.getElementById('routeForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表单默认提交行为，避免页面刷新

    // 从表单中获取起点和终点站的名称
    let startStation = document.getElementById('start').value;
    let endStation = document.getElementById('end').value;

    // 检查起点和终点是否相同，如果相同则弹出警告并返回
    if(endStation == startStation){
        alert("起点和终点应为不同站点");
        return;
    }

    // 调用 dijkstra_time 和 dijkstra_cnt 函数计算最短时间路径和最少换乘路径
    res_time = dijkstra_time(startStation, endStation, g);
    res_cnt = dijkstra_cnt(startStation, endStation, g);

    // 检查路径计算结果，如果返回-1表示无法到达终点
    if(res_cnt == -1 || res_time == -1){
        alert("无法通过地铁到达终点");
        return;
    } else if(res_cnt == 0 || res_time == 0){
        alert("请输入正确的地铁站名称");
        return;
    }
    if(res_cnt.time < res_time.time) res_cnt.time = res_time.time;
    
    // 显示结果容器
    document.querySelector('.result-container').style.display = 'block';

    // 初始化显示状态，将最短时间按钮设为选中状态
    minTimeButton.classList.add("selected");
    minTransfersButton.classList.remove("selected");
    
    // 显示最短时间的路径结果
    document.getElementById('routeDetails').innerHTML = toHtml(res_time);
});

// 获取最短时间和最少换乘的按钮
const minTimeButton = document.getElementById("minTime");
const minTransfersButton = document.getElementById("minTransfers");

// 添加最短时间按钮的点击事件监听
minTimeButton.addEventListener("click", function() {
    // 设置最短时间按钮为选中状态，移除最少换乘按钮的选中状态
    minTimeButton.classList.add("selected");
    minTransfersButton.classList.remove("selected");
    
    // 显示最短时间路径的详细信息
    document.getElementById('routeDetails').innerHTML = toHtml(res_time);
});

// 添加最少换乘按钮的点击事件监听
minTransfersButton.addEventListener("click", function() {
    // 设置最少换乘按钮为选中状态，移除最短时间按钮的选中状态
    minTransfersButton.classList.add("selected");
    minTimeButton.classList.remove("selected");
    
    // 显示最少换乘路径的详细信息
    document.getElementById('routeDetails').innerHTML = toHtml(res_cnt);
});

// 定义变量用于存储点击地图时获取的经纬度信息
let lngLat = undefined;

// 定义处理右键点击地图事件的函数
function handleRightClick(e) {
    // 获取鼠标位置的经纬度
    lngLat = e.lngLat;

    // 显示添加地铁站的界面
    document.querySelector('.adds').style.display = 'block';
}

// 监听“添加地铁站”按钮的点击事件
document.getElementById('add_station').addEventListener('click', function() {
    // 弹出提示，告知用户通过右键点击地图来添加站点
    alert("右键地图添加站点");
    // 在地图上设置一个一次性的右键（上下文菜单）事件监听器，
    // 当用户下次右键点击地图时，会触发 handleRightClick 函数
    map.once('contextmenu', handleRightClick);
});

// 监听“添加地铁线路”按钮的点击事件
document.getElementById('add_line').addEventListener('click', function() {
    // 显示添加地铁线路的表单，让用户可以输入新线路的详细信息
    document.querySelector('.addl').style.display = 'block';
});

// 监听“取消”按钮的点击事件，此按钮位于添加站点的弹出窗口中
document.getElementById('cancelButton').addEventListener('click', function() {
    // 隐藏添加站点的窗口
    document.querySelector('.adds').style.display = 'none';
    // 清空添加站点输入框中的文本
    document.getElementById('adds_in').value = '';
});

// 监听 'adds_form'添加地铁站 表单的提交事件
document.getElementById('adds_form').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表单默认的提交行为，即防止页面刷新

    // 获取用户输入的站点名称
    let name = document.getElementById('adds_in').value;
    // 检查站点名称是否已存在于站点列表中
    let index = g.station.indexOf(name);
    if(index >= 0){
        // 如果名称已存在，提示用户并中止添加
        alert("请勿输入重复的名称");
        return;
    }
    // 将新站点名称添加到站点列表
    g.station.push(name);
    // 向地图数据点集中添加新的站点信息
    g.point.features.push({
        "type": "Feature",
        "properties": {
            "station_name": name, // 站点名称
            "lines": [], // 该站点所属的地铁线列表，初始为空
            "status": "\u8fd0\u8425\u4e2d", // 站点状态，这里默认为"运营中"
            "line_siz": 0 // 该站点所属的地铁线数量，初始为0
        },
        "geometry": {
            "type": "Point", // GeoJSON点类型
            "coordinates": [ // 地理坐标，使用之前定义的lngLat对象
                lngLat.lng,
                lngLat.lat
            ]
        }
    });
    // 初始化该站点在站点间关系数据结构中的位置
    g.sjson[name] = {
        "edge": [], // 与该站点直接连接的其他站点列表，初始为空
        "lines": [], // 该站点所属的线路列表，初始为空
        "line_siz": 0 // 该站点所属的线路数量，初始为0
    };
    // 更新地图上的点数据源以显示新添加的站点
    map.getSource('point').setData(g.point);
    // 隐藏添加站点的弹出窗口
    document.querySelector('.adds').style.display = 'none';
    // 清空输入框以便下一次添加
    document.getElementById('adds_in').value = '';
});

// 监听取消按钮的点击事件，用于取消添加线路的操作
document.getElementById('cancel1').addEventListener('click', function() {
    // 隐藏添加线路的窗口
    document.querySelector('.addl').style.display = 'none';
    // 清空添加线路表单中的所有输入字段
    document.getElementById('addl_in').value = '';
    document.getElementById('siteCount').value = '';
    document.getElementById('maxSpeed').value = '';
});

// 获取站点数量输入框元素
let siteCountInput = document.getElementById('siteCount');
// 获取站点输入框容器元素
let stationInputsContainer = document.getElementById('stationInputs');

// 为站点数量输入框添加change事件监听器
siteCountInput.addEventListener('change', function() {
  // 当站点数量发生变化时，首先清空站点输入框容器的内容
  stationInputsContainer.innerHTML = '';

  // 解析输入框中的站点数量为整数
  let siteCount = parseInt(siteCountInput.value);

  // 如果输入的站点数量超过1000，则显示警告并终止函数执行
  if (siteCount > 1000) {
    alert("站点数量不能多于1000");
    return;
  }

  // 创建一个新的div元素用于容纳生成的输入框
  let Div = document.createElement('div');

  // 循环生成指定数量的站点输入框
  for (let i = 1; i <= siteCount; i++) {
    // 创建站点名称标签
    let sta = '站点' + i + ':';
    let staText = document.createTextNode(sta); // 创建文本节点
    let stationNameInput = document.createElement('input'); // 创建输入框
    let staDiv = document.createElement('div'); // 创建包裹输入框的div元素
    let listDiv = document.createElement('div'); // 创建自动完成列表的div

    // 配置自动完成列表的属性
    listDiv.id = "autocomplete-list-station" + i;
    listDiv.className = "autolist-items";

    // 配置输入框div的类名
    staDiv.className = "autolist";
    // 设置输入框的id和类型
    stationNameInput.id = "station" + i;
    stationNameInput.type = 'text';
    stationNameInput.required = true;
    stationNameInput.style.width = "100px";

    // 将标签和输入框添加到包裹div
    staDiv.appendChild(staText);
    staDiv.appendChild(stationNameInput);
    staDiv.appendChild(listDiv);
    Div.appendChild(staDiv);
    
    // 如果不是最后一个输入框，则添加距离输入框
    if (i != siteCount) {
        let distanceInput = document.createElement('input');
        let mText = document.createTextNode("m——>");
        let fText = document.createTextNode("——");
        distanceInput.id = "distance" + i;
        distanceInput.type = 'text';
        distanceInput.placeholder = '距离';
        distanceInput.required = true;
        distanceInput.style.width = "50px";
        distanceInput.pattern = "[0-9]*"; // 只接受数字输入
        Div.appendChild(fText);
        Div.appendChild(distanceInput);
        Div.appendChild(mText);
    } else if (i & 1) {
        // 如果站点数量是奇数，则将当前div添加到容器中
        stationInputsContainer.appendChild(Div);
    }
    if (!(i & 1)) {
        // 如果是偶数索引，添加当前div到容器并开始新的div
        stationInputsContainer.appendChild(Div);
        Div = document.createElement('div');
    }
  }
  // 为所有生成的站点输入框应用自动完成功能
  for (let i = 1; i <= siteCount; i++) {
    _autocomplete(document.getElementById("station" + i), g.station);
  }
});

// 监听文档加载完成的事件，确保DOM完全加载后执行代码
document.addEventListener("DOMContentLoaded", function() {
    // 调用 autocomplete 函数，传入起点站的输入框元素和可用站点的数组
    // 该函数增强输入框，提供自动完成的功能，让用户能快速选择起点站
    autocomplete(document.getElementById("start"), g.station);

    // 调用 autocomplete 函数，传入终点站的输入框元素和可用站点的数组
    // 同样提供自动完成的功能，帮助用户快速选择终点站
    autocomplete(document.getElementById("end"), g.station);

    // 调用 autocomplete 函数，传入用于删除操作的输入框元素和可用地铁线路的数组
    // 为删除地铁线路的输入框提供自动完成的功能，让用户可以快速选择并删除指定的地铁线路
    autocomplete(document.getElementById("delete"), g.line);
});

// 获取页面上显示首站和末站名称的元素
let first = document.getElementById('first');
let last = document.getElementById('last');
// 初始化变量
let f, l;
let stations = [];  // 存储站点名称
let distances = []; // 存储站间距离
let times = [];     // 存储站间时间
let newline, count;

// 添加事件监听，当地铁线路添加表单提交时触发
document.getElementById('addl_form').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表单默认的提交行为，即防止页面刷新

    // 获取用户输入的地铁线路名称、站点数量和最高时速
    let name = document.getElementById('addl_in').value;
    count = document.getElementById('siteCount').value;
    let speed = document.getElementById('maxSpeed').value;
    newline = name;

    // 检查地铁线路名称是否已经存在
    if(g.mp[name] || g.mp_in[name]){
        alert("请勿输入重复的地铁线路名称");
        return;
    }

    // 将新线路名称添加到全局地铁线路列表中
    g.line.push(name);

    // 收集并验证所有站点的名称
    for(let i = 1; i <= count; i++){
        let station = document.getElementById('station' + i).value;
        let index = g.station.indexOf(station);
        if(index < 0){
            alert("请输入正确的地铁站名称");
            return;
        }
        stations[i - 1] = station;
        document.getElementById('station' + i).value = '';
    }

    // 收集所有站点间的距离
    for(let i = 1; i < count; i++){
        let distance = document.getElementById('distance' + i).value;
        if(distance < 0){
            alert("请输入正确的站间距");
            return;
        }
        distances[i - 1] = distance;
        document.getElementById('distance' + i).value = '';
    }

    // 根据站点和距离计算并设置站点间的时间和相关数据
    for(let i = 0; i < count - 1; i++){
        let n = stations[i];
        g.sjson[n].lines.push(name);
        g.sjson[n].line_siz++;
        times[i] = distances[i] * 7.2 / speed;
        let to = stations[i + 1];
        g.sjson[n].edge.push({
            "station": to,
            "line": name,
            "distance": distances[i],
            "speed": speed,
            "time": times[i],
            "directions": 1
        });
    }

    // 对线路的反向进行同样的设置
    for(let i = count - 1; i > 0; i--){
        let n = stations[i];
        let to = stations[i - 1];
        g.sjson[n].edge.push({
            "station": to,
            "line": name,
            "distance": distances[i - 1],
            "speed": speed,
            "time": distances[i - 1] * 7.2 / speed,
            "directions": 2
        });
    }

    // 更新地图上的点数据
    for(let i = 0; i < count; i++){
        let feature = g.point.features.find(feature => feature.properties.station_name == stations[i]);
        feature.properties.lines.push(name);
        feature.properties.line_siz++;
    }

    // 更新全局变量和状态
    g.mp[name] = name;
    g.mp_in[name] = name;
    g.color[name] = "#000000";
    map.getSource('point').setData(g.point);

    // 显示首站和末站
    first.textContent = f = stations[0];
    last.textContent = l = stations[count - 1];

    // 隐藏添加线路表单，显示添加时间表单
    document.querySelector('.addl').style.display = 'none';
    document.getElementById('maxSpeed').value = '';
    document.getElementById('addl_in').value = '';
    document.getElementById('siteCount').value = '';
    document.querySelector('#addtime').style.display = 'block';
});

// 获取各个时间网格的DOM元素，这些网格将用于显示时间选择按钮
let grid11 = document.getElementById('timeGrid11');
let grid21 = document.getElementById('timeGrid21');
let grid12 = document.getElementById('timeGrid12');
let grid22 = document.getElementById('timeGrid22');

// 初始化四个时间数组，用于存储每个时间点的选中状态（0或1）
let arr11 = new Array(2400).fill(0);
let arr21 = new Array(2400).fill(0);
let arr12 = new Array(2400).fill(0);
let arr22 = new Array(2400).fill(0);

// 当页面内容加载完成后执行以下函数
document.addEventListener('DOMContentLoaded', function() {
    // 循环处理每个小时（0-23小时）
    for (let hour = 0; hour < 24; hour++) {
        // 创建一个新的DIV容器用于存放每个小时的分钟按钮
        let Div = document.createElement('div');
        // 将小时数格式化为两位数字，并添加冒号
        let hstring = hour.toString().padStart(2, '0') + ":";
        // 创建一个包含小时文本的节点
        let hText = document.createTextNode(hstring);
        // 将小时文本节点添加到DIV容器中
        Div.appendChild(hText);

        // 循环处理每个小时中的每分钟（0-59分钟）
        for (let minute = 0; minute < 60; minute++) {
            // 创建一个按钮，用于选择特定的分钟
            let button = document.createElement('button');
            button.className = 'timeButton';
            // 设置按钮文本，显示两位格式的分钟数
            button.textContent = `${minute.toString().padStart(2, '0')}`;

            // 为按钮添加点击事件处理函数
            button.onclick = function(event) {
                event.preventDefault();  // 阻止按钮的默认行为
                // 切换按钮的选中状态，并更新相应的时间数组
                let isSelected = button.classList.toggle('selected');
                // 根据选中状态设置时间数组中对应分钟的值
                arr11[hour * 100 + minute] = isSelected ? 1 : 0;
            };

            // 将按钮添加到小时的DIV容器中
            Div.appendChild(button);
        }
        // 将完成的小时DIV添加到相应的时间网格中
        grid11.appendChild(Div);
    }
    // 以下循环与上面类似，处理其他三个时间网格的时间按钮创建和事件绑定
    // 重复上述步骤，但是将相应的操作应用于arr12, arr21, 和arr22数组以及grid12, grid21, 和grid22网格
    // 这些代码片段确保每个时间点都可以独立选择，并反映在对应的时间数组中

    for (let hour = 0; hour < 24; hour++) {
        let Div = document.createElement('div');
        let hstring = hour.toString().padStart(2, '0') + ":";
        let hText = document.createTextNode(hstring);
        Div.appendChild(hText);
        for (let minute = 0; minute < 60; minute++) {
            let button = document.createElement('button');
            button.className = 'timeButton';
            button.textContent = `${minute.toString().padStart(2, '0')}`;
            button.onclick = function(event) {
                event.preventDefault();
                let isSelected = button.classList.toggle('selected');
                arr12[hour * 100 + minute] = isSelected ? 1 : 0;
            };
            Div.appendChild(button);
        }
        grid12.appendChild(Div);
    }

    for (let hour = 0; hour < 24; hour++) {
        let Div = document.createElement('div');
        let hstring = hour.toString().padStart(2, '0') + ":";
        let hText = document.createTextNode(hstring);
        Div.appendChild(hText);
        for (let minute = 0; minute < 60; minute++) {
            let button = document.createElement('button');
            button.className = 'timeButton';
            button.textContent = `${minute.toString().padStart(2, '0')}`;
            button.onclick = function(event) {
                event.preventDefault();
                let isSelected = button.classList.toggle('selected');
                arr21[hour * 100 + minute] = isSelected ? 1 : 0;
            };
            Div.appendChild(button);
        }
        grid21.appendChild(Div);
    }

    for (let hour = 0; hour < 24; hour++) {
        let Div = document.createElement('div');
        let hstring = hour.toString().padStart(2, '0') + ":";
        let hText = document.createTextNode(hstring);
        Div.appendChild(hText);
        for (let minute = 0; minute < 60; minute++) {
            let button = document.createElement('button');
            button.className = 'timeButton';
            button.textContent = `${minute.toString().padStart(2, '0')}`;
            button.onclick = function(event) {
                event.preventDefault();
                let isSelected = button.classList.toggle('selected'); 
                arr22[hour * 100 + minute] = isSelected ? 1 : 0;
            };
            Div.appendChild(button);
        }

        grid22.appendChild(Div);
    }
});

// 添加点击事件监听器，当“取消”按钮被点击时触发
document.getElementById('cancel2').addEventListener('click', function() {
    // 移除所有具有 'selected' 类的元素的 'selected' 类，通常这些是被选中的时间按钮
    document.querySelectorAll('.selected').forEach(b => {
        b.classList.remove('selected');
    });
    // 隐藏添加时刻表的窗口
    document.querySelector('#addtime').style.display = 'none';
    // 将用于存储时间选择状态的数组重置为0，表示没有时间被选中
    arr11.fill(0), arr12.fill(0), arr21.fill(0), arr22.fill(0);
});

// 创建一个新的时间表结构，用于存储地铁发车时间
function create_time(f, k){
    // 如果对应线路的时间表不存在，则初始化
    if(!g.tjson[f]) g.tjson[f] = {};
    if(!g.tjson[f][newline]) g.tjson[f][newline] = {}
    g.tjson[f][newline][k] = {
        "工作日": {},
        "双休日": {}
    };
}

// 更新首站的指定线路和方向的时间表，添加工作日和双休日的发车时间
function updata_time1(f, k){
    create_time(f, k);  // 确保时间表结构已经初始化
    // 遍历每个小时
    for (let hour = 0; hour < 24; hour++) {
        // 初始化每个小时的时间表
        g.tjson[f][newline][k]["工作日"][hour] = [];
        g.tjson[f][newline][k]["双休日"][hour] = [];
        // 遍历每分钟，检查并记录被选中的分钟作为发车时间
        for (let minute = 0; minute < 60; minute++) {
            if(arr11[hour * 100 + minute]){
                g.tjson[f][newline][k]["工作日"][hour].push(minute);
            }
            if(arr12[hour * 100 + minute]){
                g.tjson[f][newline][k]["双休日"][hour].push(minute);
            }
        }
    }
}

// 更新末站的指定线路和方向的时间表，添加工作日和双休日的发车时间，和updata_time1类似
function updata_time2(f, k){
    create_time(f, k);
    for (let hour = 0; hour < 24; hour++) {
        g.tjson[f][newline][k]["工作日"][hour] = [];
        g.tjson[f][newline][k]["双休日"][hour] = [];
        for (let minute = 0; minute < 60; minute++) {
            if(arr21[hour * 100 + minute]){
                g.tjson[f][newline][k]["工作日"][hour].push(minute);
            }
            if(arr22[hour * 100 + minute]){
                g.tjson[f][newline][k]["双休日"][hour].push(minute);
            }
        }
    }
}

// 更新时刻表，将时间添加到目标站点的时刻表中
function updata(n, to, k, time){
    // 获取源站点n在工作日的时刻表
    let nd = g.tjson[n][newline][k]["工作日"];
    // 获取目标站点to在工作日的时刻表，准备进行更新
    let td = g.tjson[to][newline][k]["工作日"];

    // 初始化目标站点的时刻表，确保它是空的
    for(let hour = 0; hour < 24; hour++) td[hour] = [];

    // 遍历源站点的时刻表，并计算新的到达时间，添加到目标站点的时刻表中
    for(let h in nd){
        let hou = nd[h];
        for(let m of hou){
            let t = m + time;  // 计算新的到达时间
            if(t < 60){
                td[h].push(t);  // 如果不跨越小时，直接添加
            }else{
                td[(Number(h) + 1) % 24].push(t % 60);  // 如果跨越小时，处理跨越逻辑
            }
        }
    }

    // 重复上述过程，处理双休日的时刻表
    nd = g.tjson[n][newline][k]["双休日"];
    td = g.tjson[to][newline][k]["双休日"];
    for(let hour = 0; hour < 24; hour++) td[hour] = [];
    for(let h in nd){
        let hou = nd[h];
        for(let m of hou){
            let t = m + time;
            if(t < 60){
                td[h].push(t);
            }else{
                td[(Number(h) + 1) % 24].push(t % 60);
            }
        }
    }
}

// 添加时刻表的表单提交事件处理
document.getElementById('addtime').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表单默认的提交行为，避免页面刷新

    // 更新起始站点和终点站点的时刻表
    updata_time1(f, 1);
    updata_time2(l, 2);

    // 对每一段路线（从一站到下一站），调用updata函数更新时刻表
    for(let i = 1; i < count; i++){
        let n = stations[i - 1];
        let to = stations[i];
        let t = times[i - 1];
        create_time(to, 1);  // 创建新的时刻表项
        updata(n, to, 1, t); // 更新时刻表
    }
    // 处理反向路线的时刻表更新
    for(let i = count - 2; i >= 0; i--){
        let n = stations[i + 1];
        let to = stations[i];
        let t = times[i];
        create_time(to, 2);
        updata(n, to, 2, t);
    }

    // 清除所有选中的按钮状态
    document.querySelectorAll('.selected').forEach(b => {
        b.classList.remove('selected');
    });
    // 隐藏时刻表添加窗口
    document.querySelector('#addtime').style.display = 'none';
    // 重置所有时间选择数组
    arr11.fill(0), arr12.fill(0), arr21.fill(0), arr22.fill(0);
});
