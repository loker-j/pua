import { NextResponse } from 'next/server';
import OpenAI from "openai";

// 在函数内部初始化 OpenAI 客户端，而不是模块级别
function createOpenAIClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not found. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable.');
  }
  
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
  });
}

export async function POST(request: Request) {
  let text = '';
  
  try {
    // 检查是否有 API key
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    console.log('API Key check:', {
      hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
      hasOpenaiKey: !!process.env.OPENAI_API_KEY,
      keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'not found'
    });
    
    if (!apiKey) {
      console.warn('API key not configured, returning fallback response');
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: ['无法分析'],
        analysis: "API 服务暂时不可用，请稍后再试。",
        responses: {
          mild: "我需要一些时间来思考这个问题。",
          firm: "这个话题我们需要换个时间讨论。",
          analytical: "让我们先冷静下来，理性地看待这个情况。"
        }
      });
    }

    const requestBody = await request.json();
    text = requestBody.text;
    console.log('Analyzing text:', text);
    
    // 在这里初始化 OpenAI 客户端
    const openai = createOpenAIClient();
    console.log('OpenAI client created successfully');
    
    // 第一阶段：极简快速分析
    const prompt = `分析这句话的PUA程度：${text}

简短回答，JSON格式：
{
  "category": "workplace|relationship|family|general",
  "severity": 1-10,
  "puaTechniques": ["技巧名称"],
  "analysis": "简要分析，80字以内"
}`;

    console.log('Calling DeepSeek API...');
    
    // 直接调用API，不设置人为超时
    const completion = await openai.chat.completions.create({
      messages: [{ 
        role: "user",
        content: prompt
      }],
      model: "deepseek-chat",
      temperature: 0.1, // 极低温度，快速准确
      max_tokens: 200, // 大幅减少token
      top_p: 0.5, // 减少采样范围
      stream: false,
    });
    
    console.log('API call successful, processing response...');
    const response = completion.choices[0].message.content;
    console.log('Raw API response length:', response?.length);
    
    try {
      if (!response) {
        throw new Error('API返回了空响应');
      }

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('No JSON found in response:', response);
        throw new Error('未找到JSON格式的响应');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed response successfully');
      
      // 验证必要字段
      if (!parsedResponse.category || 
          !parsedResponse.severity || 
          !parsedResponse.analysis ||
          !parsedResponse.puaTechniques) {
        throw new Error('响应格式不完整');
      }
      
      // 确保数据格式正确
      const validCategories = ['workplace', 'relationship', 'family', 'general'];
      if (!validCategories.includes(parsedResponse.category)) {
        parsedResponse.category = 'general';
      }
      
      parsedResponse.severity = Math.min(Math.max(1, Number(parsedResponse.severity)), 10);
      parsedResponse.puaTechniques = parsedResponse.puaTechniques || [];
      
      console.log('Returning successful response');
      return NextResponse.json(parsedResponse);
    } catch (e) {
      console.error('解析API响应失败:', e, '原始响应前100字符:', response?.substring(0, 100));
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: ['解析失败'],
        analysis: "AI分析完成，但响应格式解析失败"
      });
    }
  } catch (error: any) {
    console.error('调用API失败:', error.message);
    
    // 根据错误类型返回不同的消息
    if (error.message && error.message.includes('timeout')) {
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: ['API超时'],
        analysis: "API响应超时，请稍后重试"
      });
    }
    
    return NextResponse.json({
      category: 'general',
      severity: 5,
      puaTechniques: ['API错误'],
      analysis: "API 服务暂时不可用"
    });
  }
}