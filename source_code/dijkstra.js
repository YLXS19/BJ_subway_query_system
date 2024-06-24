class PriorityQueue {
    constructor() {
        this.heap = [];  // 使用数组来实现堆结构，堆中存储所有队列元素
    }

    // 向优先队列中添加元素
    enqueue(value) {
        this.heap.push(value);  // 把新元素添加到数组的末尾
        this.bubbleUp();  // 调用 bubbleUp 方法调整堆，确保堆的结构正确
    }

    // 辅助方法，用于调整堆结构，确保最小的元素位于堆顶
    bubbleUp() {
        let i = this.heap.length - 1;  // 新加入元素的索引位置
        while (i > 0) {
            let x = this.heap[i];  // 当前节点
            let fi = Math.floor((i - 1) / 2);  // 当前节点的父节点的索引
            let father = this.heap[fi];  // 父节点
            if (father.t <= x.t) break;  // 如果父节点的值小于或等于当前节点的值，则不需要调整
            this.heap[i] = father;  // 将父节点下移
            this.heap[fi] = x;  // 将当前节点移至父节点的位置
            i = fi;  // 更新当前索引为父节点索引，继续向上调整
        }
    }

    // 从优先队列中移除元素（移除堆顶元素）
    dequeue() {
        if (this.heap.length === 1) return this.heap.pop();  // 如果堆中只有一个元素，直接移除并返回

        const top = this.heap[0];  // 堆顶元素，即最小值
        this.heap[0] = this.heap.pop();  // 将堆中最后一个元素移到堆顶
        this.sinkDown(0);  // 调用 sinkDown 方法调整堆，确保新的堆顶是正确的最小值
        return top;  // 返回原堆顶元素
    }

    // 辅助方法，用于调整堆结构，确保新的堆顶元素是最小的
    sinkDown(index) {
        let left = 2 * index + 1;  // 左子节点的索引
        let right = 2 * index + 2;  // 右子节点的索引
        let smallest = index;  // 假设当前节点是最小的
        const length = this.heap.length;

        // 检查左子节点的值是否更小
        if (left < length && this.heap[left].t < this.heap[smallest].t) {
            smallest = left;  // 更新最小值索引为左子节点
        }
        // 检查右子节点的值是否更小
        if (right < length && this.heap[right].t < this.heap[smallest].t) {
            smallest = right;  // 更新最小值索引为右子节点
        }
        if (smallest !== index) {
            // 如果最小值的索引发生变化，交换当前节点与最小节点
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            this.sinkDown(smallest);  // 递归调整交换后的节点
        }
    }

    // 获取优先队列中的最小值（不移除）
    peek() {
        return this.heap[0] || null;  // 返回堆顶元素，如果堆为空，则返回 null
    }

    // 检查优先队列是否为空
    isEmpty() {
        return this.heap.length === 0;  // 如果堆数组的长度为 0，则队列为空
    }
}

// 表示地铁系统中的一个站点，用于存储站点相关信息和计算路径。
class station {
    constructor(name, t, d, time, ld, list, cnt, pre = null) {
        this.name = name;       // 站点的名称
        this.t = t;             // 优先队列排序的权值
        this.d = d;             // 从起始站到此站的总距离（公里）
        this.time = time;       // 到达此站的实际时间，包括等待和换乘
        this.ld = ld;           // 当前站点的线路和方向信息
        this.list = list;       // 用于存储路径信息的对象
        this.list.time = time;  // 更新路径对象中的时间属性
        this.cnt = cnt;         // 累计换乘次数
        this.pre = pre;         // 前一个站点的引用，用于路径回溯
    }
}

// 定义一个函数 time_wait 来计算地铁站下一班车的等待时间
function time_wait(name, line, direction, _t, g){
    // 获取全局时间表数据
    const t_json = g.tjson;
    // 创建一个新的Date对象获取当前时间
    const now = new Date();
    // 获取当前的小时数
    let hours = now.getHours();  
    // 获取当前的分钟数
    let minutes = now.getMinutes();  
    // 获取当前的秒数
    let seconds = now.getSeconds();  
    // 获取今天是星期几
    let dayOfWeek = now.getDay();
    // 默认设定为双休日
    let daytype = "双休日";
    // 如果是星期一到星期五，设定为工作日
    if(0 < dayOfWeek && dayOfWeek < 6) daytype = "工作日";

    // 获取对应站点、线路、方向和日期类型的时间表
    let data = t_json[name][line][direction][daytype];
    // 计算从现在起，考虑额外时间_t后的实际分钟数
    let now_min = _t + minutes + seconds / 60.0;
    // 计算可能的小时进位
    hours += Math.floor(now_min / 60);
    // 修正分钟数以保持在60分钟以内
    now_min %= 60;

    // 转换小时数为字符串形式，以便在数据中查找
    let h = hours.toString();
    // 如果当前小时有时间表数据
    if(data[h]){
        // 遍历该小时所有的发车分钟
        for(let m of data[h]){
            // 如果发现即将到来的一班车
            if(m + 1 >= now_min){
                // 返回需要等待的分钟数
                return m + 1 - now_min;
            }
        }
    }
    // 如果当前小时内没有合适的车次，则开始查找后续的小时
    for(let i = 1; i <= 24; i++){
        // 计算后续小时并处理跨过午夜的情况
        h = ((hours + i) % 24).toString();
        // 如果该小时有数据
        if(!data[h]) continue;
        // 遍历该小时的发车分钟
        for(let m of data[h]){
            // 返回从现在开始，到该车次的等待时间
            return m + 1 + 60 * i - now_min;
        }
    }
    // 如果24小时内找不到合适的车次，返回-1表示出错
    return -1;
}

// 导出 dijkstra_time 函数，用于计算最短时间路径
export function dijkstra_time(start, end, g) {
    // 从全局图对象 g 中获取站点信息
    const s_json = g.sjson;
    // 如果起始或终点站不存在于数据中，则返回 0
    if(!s_json[start] || !s_json[end]) return 0;

    // 初始化优先队列
    const pq = new PriorityQueue();

    // 遍历起始站点的所有邻接边
    for(let i in s_json[start].edge){
        let e = s_json[start].edge[i];
        let name = e.station;  // 邻接站点名称
        let line = e.line;     // 所在线路
        let t = Number(e.time) / 60.0;  // 转换时间为小时
        let dis = Number(e.distance);  // 距离
        let dir = e.directions.toString();  // 方向
        // 计算等待时间
        let tw = time_wait(start, line, dir, 0, g);
        // 如果等待时间为-1，说明没有可用时间，返回-1
        if(tw == -1) return -1;

        // 检查线路是否在允许的线路列表中
        let ext = 0;
        for(let lin of g.line){
            if (g.mp[lin] == line) ext = 1;
        }
        if(!ext) continue;  // 如果不在允许的线路列表中，跳过此边

        let ld = {line, dir};  // 线路和方向的信息

        // 创建起始站点的状态对象
        let pre = new station(start, 0, 0, 0, 0, {name: start, line}, 0);
        // 创建邻接站点的状态对象
        let v = new station(name, t + tw, dis, t + tw, ld, {name, line}, 0, pre);
        pq.enqueue(v);  // 将邻接站点入队
    }

    let v, u, vis = [{name: start}];  // 访问过的站点列表
    // 如果队列为空，返回-1
    if(pq.isEmpty()) return -1;
    // 当队列不为空时，处理队列中的元素
    while(!pq.isEmpty()){
        v = pq.dequeue();  // 弹出队列中优先级最高（时间最短）的元素
        if(v.name == end) break;  // 如果是终点站，结束循环
        vis.push({name: v.name});  // 标记为已访问
        let ld = v.ld;  // 当前线路和方向

        // 遍历当前站点的所有邻接边
        for(let i in s_json[v.name].edge){
            let e = s_json[v.name].edge[i];
            let name = e.station;
            let line = e.line;
            let t = Number(e.time) / 60.0;
            let dis = Number(e.distance);
            let dir = e.directions.toString();
            let pre = v;

            // 检查线路是否允许
            let ext = 0;
            for(let lin of g.line){
                if (g.mp[lin] == line) ext = 1;
            }
            if(!ext) continue;

            // 检查该站点是否已被访问
            let exists = vis.some(station => station.name === name);
            if(exists) continue;

            // 判断是否为同一线路和方向
            if(ld.line == line && ld.dir == dir){
                let list = {name, line};
                // 同线路同方向，更新状态
                u = new station(name, v.t + 1 + t, v.d + dis, v.time + 1 + t, ld, list, v.cnt, pre);
            }else{
                // 不同线路或方向，计算换乘等待时间
                let tw = time_wait(name, line, dir, v.time + 5, g);
                if(tw == -1) return -1;
                let list = {name, line};
                // 创建新状态，考虑换乘成本
                u = new station(name, v.t + t + tw + 5, v.d + dis, v.time + t + tw + 5, {line, dir}, list, v.cnt + 1, pre);
            }
            pq.enqueue(u);  // 新状态入队
        }
    }

    // 如果没有到达终点站，返回-1
    if(v.name != end) return -1;

    // 准备结果对象，包括路线列表、总距离、总时间和换乘次数
    let result = {};
    result.list = [];
    result.distance = v.d;
    result.time = v.time - 1;
    result.cnt = v.cnt;
    while(v){
        result.list.push(v.list);
        v = v.pre;
    }
    result.list.reverse();  // 反转列表，使起点在前
    return result;
}

// 导出 dijkstra_time 函数，用于计算最少换乘次数路径
export function dijkstra_cnt(start, end, g) {
    // 从全局图结构中获取站点信息
    const s_json = g.sjson;
    // 如果起始站或终点站不存在于数据中，则返回0
    if(!s_json[start] || !s_json[end]) return 0;

    // 创建优先队列来管理待探索的站点
    const pq = new PriorityQueue();

    // 遍历起始站的所有出边
    for(let i in s_json[start].edge){
        let e = s_json[start].edge[i];
        let name = e.station;
        let line = e.line;
        let t = Number(e.time) / 60.0;  // 将时间从秒转换为分钟
        let dis = Number(e.distance);
        let dir = e.directions.toString();
        // 计算在起始站等待的时间
        let tw = time_wait(start, line, dir, 0, g);
        if(tw == -1) return -1;  // 如果没有有效的等待时间，则返回-1

        // 检查是否有有效的线路继续探索
        let ext = 0;
        for(let lin of g.line){
            if (g.mp[lin] == line) ext = 1;
        }
        if(!ext) continue;

        let ld = {line, dir};
        // 初始化前驱节点信息
        let pre = new station(start, 0, 0, 0, 0, {name: start, line}, 0);
        // 创建新站点并计算累计时间和距离
        let v = new station(name, t + tw, dis, t + tw, ld, {name, line}, 0, pre);
        // 将新站点加入优先队列
        pq.enqueue(v);
    }

    let v, u, vis = [{name: start}];
    if(pq.isEmpty()) return -1;  // 如果队列为空，表示没有可探索的路径
    while(!pq.isEmpty()){
        // 从优先队列中取出最优站点
        v = pq.dequeue();
        if(v.name == end) break;  // 如果达到终点站，停止搜索
        vis.push({name: v.name});
        let ld = v.ld;

        // 遍历当前站点的所有出边
        for(let i in s_json[v.name].edge){
            let e = s_json[v.name].edge[i];
            let name = e.station;
            let line = e.line;
            let t = Number(e.time) / 60.0;
            let dis = Number(e.distance);
            let dir = e.directions.toString();
            let pre = v;

            let ext = 0;
            for(let lin of g.line){
                if (g.mp[lin] == line) ext = 1;
            }
            if(!ext) continue;

            // 检查是否已访问过该站点
            let exists = vis.some(station => station.name === name);
            if(exists) continue;

            // 如果沿用当前线路和方向，不增加换乘次数
            if(ld.line == line && ld.dir == dir){
                let list = {name, line};
                u = new station(name, v.t + 1 + t, v.d + dis, v.time + 1 + t, ld, list, v.cnt, pre);
            }else{
                // 否则计算换乘后的等待时间和增加的换乘次数
                let tw = time_wait(name, line, dir, v.time + 5, g);
                if(tw == -1) return -1;
                let list = {name, line};
                // 将换乘次数加权（500000）来增加换乘的成本
                u = new station(name, v.t + t + tw + 500000, v.d + dis, v.time + t + tw + 5, {line, dir}, list, v.cnt + 1, pre);
            }
            // 将新站点加入优先队列
            pq.enqueue(u);
        }
    }

    // 如果未能到达终点站，返回-1
    if(v.name != end) return -1;

    // 构建结果，包括路径、距离、时间和换乘次数
    let result = {};
    result.list = [];
    result.distance = v.d;
    result.time = v.time - 1;
    result.cnt = v.cnt;
    while(v){
        result.list.push(v.list);
        v = v.pre;
    }
    result.list.reverse();  // 将路径反转以显示从起始站到终点站的顺序
    return result;
}
