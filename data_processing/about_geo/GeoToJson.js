const fs = require('fs');

// 读取geojson文件
fs.readFile('point.geojson', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    // 解析geojson文件内容为JSON对象
    const json = JSON.parse(data);

    // 将JSON对象转换回字符串形式
    const jsonString = JSON.stringify(json, null, 2);

    // 写入到新的文件中
    fs.writeFile('point.json', jsonString, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('JSON data has been written to file successfully.');
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});