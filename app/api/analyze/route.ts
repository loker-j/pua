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
    timeout: 8000, // 设置8秒超时
  });
}

export async function POST(request: Request) {
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

    const { text } = await request.json();
    console.log('Analyzing text:', text);
    
    // 在这里初始化 OpenAI 客户端
    const openai = createOpenAIClient();
    console.log('OpenAI client created successfully');
    
    // 简化的 prompt 以减少响应时间
    const prompt = `分析以下话语的PUA程度并生成回应建议。

话语：${text}

请返回JSON格式：
{
  "category": "workplace|relationship|family|general",
  "severity": 1-10的数字,
  "puaTechniques": ["识别的PUA技巧"],
  "analysis": "简要分析",
  "responses": {
    "mild": "温和回应",
    "firm": "坚定回应", 
    "analytical": "理性回应"
  }
}`;

    console.log('Calling DeepSeek API with timeout...');
    
    // 使用 Promise.race 来实现更严格的超时控制
    const apiCall = openai.chat.completions.create({
      messages: [{ 
        role: "user",
        content: prompt
      }],
      model: "deepseek-chat",
      temperature: 0.3, // 降低温度以获得更一致的响应
      max_tokens: 800,   // 限制响应长度
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API call timeout')), 7000);
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
      if (!parsedResponse.category || 
          !parsedResponse.severity || 
          !parsedResponse.analysis ||
          !parsedResponse.responses) {
        throw new Error('响应格式不完整');
      }
      
      // 确保数据格式正确
      const validCategories = ['workplace', 'relationship', 'family', 'general'];
      if (!validCategories.includes(parsedResponse.category)) {
        parsedResponse.category = 'general';
      }
      
      parsedResponse.severity = Math.min(Math.max(1, Number(parsedResponse.severity)), 10);
      parsedResponse.puaTechniques = parsedResponse.puaTechniques || [];
      
      // 确保 responses 对象完整
      if (!parsedResponse.responses.mild) parsedResponse.responses.mild = "我需要时间考虑这个问题。";
      if (!parsedResponse.responses.firm) parsedResponse.responses.firm = "我不同意这种说法。";
      if (!parsedResponse.responses.analytical) parsedResponse.responses.analytical = "让我们理性地讨论这个问题。";
      
      console.log('Returning successful response');
      return NextResponse.json(parsedResponse);
    } catch (e) {
      console.error('解析API响应失败:', e, '原始响应前100字符:', response?.substring(0, 100));
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: ['解析失败'],
        analysis: "AI分析完成，但响应格式解析失败",
        responses: {
          mild: "我理解你的想法，但我需要一些时间考虑。",
          firm: "这个问题我们需要好好讨论，但不是用这种方式。",
          analytical: "让我们先冷静下来，理性地分析一下这个情况。"
        }
      });
    }
  } catch (error: any) {
    console.error('调用API失败:', error.message);
    
    // 根据错误类型返回不同的消息
    if (error.message && error.message.includes('timeout')) {
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: ['超时'],
        analysis: "AI分析超时，请稍后重试",
        responses: {
          mild: "抱歉，分析需要更多时间，请稍后重试。",
          firm: "系统繁忙，请稍后再试。",
          analytical: "当前网络较慢，建议稍后重新分析。"
        }
      });
    }
    
    return NextResponse.json({
      category: 'general',
      severity: 5,
      puaTechniques: ['API错误'],
      analysis: "API 服务暂时不可用",
      responses: {
        mild: "抱歉，我现在需要一些时间思考。",
        firm: "这个问题我们稍后再讨论。",
        analytical: "让我们稍后用更合适的方式继续这个对话。"
      }
    });
  }
}