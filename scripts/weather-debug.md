# Open-Meteo API 天气数据获取调试步骤

## 基本信息

- **目标**: 获取昆岛(昆岛机场VVCS)的天气数据
- **API参考**: https://api.open-meteo.com/v1/forecast?latitude=39.9042&longitude=116.4074&hourly=temperature_2m

## 昆岛信息

- **机场代码**: VVCS
- **纬度**: 8.7325
- **经度**: 106.62889

## 调试步骤

1. **验证API调用**
   - 构造昆岛天气API URL: `https://api.open-meteo.com/v1/forecast?latitude=8.7325&longitude=106.62889&hourly=temperature_2m`
   - 在浏览器中测试此URL，确保能获取数据

2. **扩展天气参数**
   - 添加更多天气指标如湿度、降雨、风速等:
   ```
   https://api.open-meteo.com/v1/forecast?latitude=8.7325&longitude=106.62889&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,winddirection_10m&current=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,winddirection_10m
   ```

3. **集成到WeatherCard组件**
   - 修改WeatherCard.tsx组件，添加API调用逻辑
   - 在组件中添加状态管理，存储API返回的天气数据
   - 确保在组件挂载时获取数据

4. **UI显示实现**
   - 在卡片中直接显示关键天气指标(温度、湿度、风速等)
   - 为每个指标添加适当的图标
   - 确保布局在移动端和桌面端都有良好表现

5. **点击交互**
   - 实现点击卡片跳转到Windy网站的功能
   - 跳转链接: `https://www.windy.com/zh/-%E8%8F%9C%E5%8D%95/menu?rain,8.990,106.170,8`

## 常用天气参数

- `temperature_2m`: 地表2米温度(°C)
- `relativehumidity_2m`: 相对湿度(%)
- `precipitation`: 降水量(mm)
- `windspeed_10m`: 10米高度风速(km/h)
- `winddirection_10m`: 风向(度)
- `weathercode`: 天气状况代码

## 注意事项

- 确保在WeatherCard组件中处理API调用错误
- 添加加载状态指示器
- 考虑添加数据刷新按钮或自动定时刷新功能
- 确认Open-Meteo API的使用限制和条款 