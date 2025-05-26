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
    timeout: 9000, // 设置9秒超时，留1秒给Netlify处理
  });
}

export async function POST(request: Request) {
  let text = '';
  let analysisData = null;
  
  try {
    // 检查是否有 API key
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    console.log('Responses API - API Key check:', {
      hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
      hasOpenaiKey: !!process.env.OPENAI_API_KEY,
      keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'not found'
    });
    
    if (!apiKey) {
      console.warn('API key not configured, returning fallback response');
      return NextResponse.json({
        responses: {
          mild: "我需要一些时间来思考这个问题。",
          firm: "这个话题我们需要换个时间讨论。",
          analytical: "让我们先冷静下来，理性地看待这个情况。"
        }
      });
    }

    const requestBody = await request.json();
    text = requestBody.text;
    analysisData = requestBody.analysis;
    console.log('Generating responses for:', text);
    console.log('Based on analysis:', analysisData);
    
    // 在这里初始化 OpenAI 客户端
    const openai = createOpenAIClient();
    console.log('OpenAI client created successfully');
    
    // 第二阶段：快速生成回应
    const prompt = `针对PUA话语生成3种回应：

原文：${text}
PUA程度：${analysisData.severity}/10
技巧：${analysisData.puaTechniques.join(', ')}

JSON格式，每个回应40-60字：
{
  "responses": {
    "mild": "温和回应",
    "firm": "坚定回应", 
    "analytical": "理性回应"
  }
}`;

    console.log('Calling DeepSeek API for responses...');
    
    // 使用 Promise.race 来实现更严格的超时控制
    const apiCall = openai.chat.completions.create({
      messages: [{ 
        role: "user",
        content: prompt
      }],
      model: "deepseek-chat",
      temperature: 0.3, // 适度创造性
      max_tokens: 300, // 减少token
      top_p: 0.7, // 平衡质量和速度
      stream: false,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API call timeout')), 6000); // 6秒超时
    });

    const completion = await Promise.race([apiCall, timeoutPromise]) as any;
    
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
      if (!parsedResponse.responses ||
          !parsedResponse.responses.mild ||
          !parsedResponse.responses.firm ||
          !parsedResponse.responses.analytical) {
        throw new Error('响应格式不完整');
      }
      
      console.log('Returning successful responses');
      return NextResponse.json(parsedResponse);
    } catch (e) {
      console.error('解析API响应失败:', e, '原始响应前100字符:', response?.substring(0, 100));
      return NextResponse.json({
        responses: {
          mild: "我理解你的观点，但我有自己的考虑。",
          firm: "我不同意这种说法，每个人的情况不同。",
          analytical: "这种方式不太合适，我们可以换个角度讨论。"
        }
      });
    }
  } catch (error: any) {
    console.error('调用API失败:', error.message);
    
    // 根据错误类型返回不同的消息
    if (error.message && error.message.includes('timeout')) {
      return NextResponse.json({
        responses: {
          mild: "抱歉，生成回应需要更多时间，请稍后重试。",
          firm: "系统繁忙，请稍后再试。",
          analytical: "当前网络较慢，建议稍后重新生成回应。"
        }
      });
    }
    
    return NextResponse.json({
      responses: {
        mild: "我需要时间考虑这个问题。",
        firm: "这个话题我们稍后再讨论。",
        analytical: "让我们换个方式来处理这个情况。"
      }
    });
  }
} 