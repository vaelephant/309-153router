#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网站访问统计报告脚本
用于定时生成访问统计报告并发送到钉钉

使用方法：
1. 配置钉钉 webhook 地址
2. 配置数据文件路径（需与 Next.js API 中的路径一致）
3. 设置定时任务运行此脚本
"""

import requests
import json
import time
from datetime import datetime, timedelta
import os
from pathlib import Path

# 钉钉 webhook 地址（请替换为你的实际地址）
DINGDING_WEBHOOK = "https://oapi.dingtalk.com/robot/send?access_token=1df6c04d3ee215b4901eac33ec59487d0dfd430e9d96c49e1295837024f848d2"

# 数据文件路径（需与 Next.js API 中的路径一致）
# 默认路径：web/data/pageViews.json
def get_data_file_path():
    """获取数据文件路径"""
    # 如果设置了环境变量，使用环境变量
    if os.getenv('ANALYTICS_DATA_FILE'):
        return Path(os.getenv('ANALYTICS_DATA_FILE'))
    
    # 否则使用脚本所在目录的父目录下的 data/pageViews.json
    script_dir = Path(__file__).parent
    return script_dir.parent / 'data' / 'pageViews.json'

def get_analytics_data():
    """读取并处理访问统计数据"""
    try:
        data_file = get_data_file_path()
        
        if not data_file.exists():
            print(f"数据文件不存在: {data_file}")
            return None
        
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 获取今天和昨天的日期
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)

        # 初始化统计数据
        stats = {
            "today": {"views": 0, "visitors": set()},
            "yesterday": {"views": 0, "visitors": set()},
            "popular_pages": {}
        }

        # 处理访问数据
        for view in data.get('views', []):
            view_date = datetime.fromisoformat(view['timestamp'].replace('Z', '+00:00')).date()
            
            if view_date == today:
                stats["today"]["views"] += 1
                stats["today"]["visitors"].add(view.get('ipAddress', ''))
            elif view_date == yesterday:
                stats["yesterday"]["views"] += 1
                stats["yesterday"]["visitors"].add(view.get('ipAddress', ''))

            # 统计热门页面
            if view_date in [today, yesterday]:
                path = view.get('path', '/')
                if path not in stats["popular_pages"]:
                    stats["popular_pages"][path] = 0
                stats["popular_pages"][path] += 1

        # 获取热门页面排序
        popular_pages = sorted(
            stats["popular_pages"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        return {
            "today_views": stats["today"]["views"],
            "today_visitors": len(stats["today"]["visitors"]),
            "yesterday_views": stats["yesterday"]["views"],
            "yesterday_visitors": len(stats["yesterday"]["visitors"]),
            "popular_pages": popular_pages
        }
    except Exception as e:
        print(f"Error reading analytics data: {e}")
        return None

def format_analytics_report(data, site_url="https://www.optrouter.com"):
    """格式化统计报告"""
    if not data:
        return "❌ 无法获取访问统计数据"

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    message = "\n📊 optrouter网站访问日报\n"
    message += f"📅 统计时间：{current_time}\n"
    message += "=" * 38 + "\n\n"

    message += "📈 今日数据\n"
    message += "-" * 28 + "\n"
    message += f"• 访问量：{data['today_views']}\n"
    message += f"• 独立访客：{data['today_visitors']}\n\n"

    message += "📊 昨日数据\n"
    message += "-" * 28 + "\n"
    message += f"• 访问量：{data['yesterday_views']}\n"
    message += f"• 独立访客：{data['yesterday_visitors']}\n\n"

    message += "🔥 热门页面 (48小时)\n"
    message += "-" * 28 + "\n"
    if data['popular_pages']:
        for page, views in data['popular_pages']:
            message += f"• {page}: {views} 次访问\n"
    else:
        message += "• 暂无数据\n"

    message += "\n" + "=" * 38 + "\n"
    message += "📌 数据来源：网站访问日志\n"
    message += f"🔗 详细统计：{site_url}/superadmin/site-analytics"

    return message

def send_to_dingding(message):
    """发送消息到钉钉"""
    if not DINGDING_WEBHOOK or "YOUR_ACCESS_TOKEN" in DINGDING_WEBHOOK:
        print("⚠️  钉钉 webhook 未配置，跳过发送")
        print("报告内容：")
        print(message)
        return
    
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "msgtype": "text",
        "text": {
            "content": "【网站流量信息播报】" + message
        }
    }
    
    try:
        response = requests.post(DINGDING_WEBHOOK, headers=headers, data=json.dumps(payload), timeout=10)
        if response.status_code == 200:
            print("✅ 统计报告发送成功")
        else:
            print(f"❌ 发送失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"❌ 发送失败: {e}")

def main():
    """主函数"""
    print("📊 正在生成访问统计报告...")
    analytics_data = get_analytics_data()
    if analytics_data:
        # 从环境变量获取网站URL，或使用默认值
        site_url = os.getenv('SITE_URL', 'https://optrouter.com')
        message = format_analytics_report(analytics_data, site_url)
        send_to_dingding(message)
    else:
        print("❌ 无法生成统计报告")

if __name__ == "__main__":
    main()
