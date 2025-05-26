import { NextResponse } from 'next/server';
import OpenAI from "openai";

// 本地分析函数作为备用方案
function localAnalyze(text: string) {
  const lowerText = text.toLowerCase();
  let category = 'general';
  let severity = 5;
  let puaTechniques = [];
  let analysis = '';
  
  // 简单的关键词匹配
  if (lowerText.includes('加班') || lowerText.includes('工作') || lowerText.includes('同事')) {
    category = 'workplace';
  } else if (lowerText.includes('爱') || lowerText.includes('感情') || lowerText.includes('男朋友') || lowerText.includes('女朋友')) {
    category = 'relationship';
  } else if (lowerText.includes('家') || lowerText.includes('父母') || lowerText.includes('妈妈') || lowerText.includes('爸爸')) {
    category = 'family';
  }
  
  // 检测PUA技巧
  if (lowerText.includes('别人都') || lowerText.includes('大家都')) {
    puaTechniques.push('比较操控');
    severity += 2;
    analysis = '通过与他人比较来制造压力和愧疚感';
  }
  
  if (lowerText.includes('如果你真的') || lowerText.includes('如果你爱')) {
    puaTechniques.push('情感勒索');
    severity += 3;
    analysis = '使用情感勒索来操控对方的行为';
  }
  
  if (lowerText.includes('为什么你不') || lowerText.includes('你为什么不')) {
    puaTechniques.push('质疑攻击');
    severity += 1;
    analysis = '通过质疑来让对方产生自我怀疑';
  }
  
  severity = Math.min(severity, 10);
  
  if (puaTechniques.length === 0) {
    puaTechniques = ['轻微操控'];
    analysis = '语言中包含一定的操控性质';
  }
  
  return {
    category,
    severity,
    puaTechniques,
    analysis,
    responses: {
      mild: "我理解你的观点，但我有自己的考虑。",
      firm: "我不同意这种说法，每个人的情况不同。",
      analytical: "这种比较是不公平的，我们应该理性地讨论具体问题。"
    }
  };
}

// 在函数内部初始化 OpenAI 客户端，而不是模块级别
function createOpenAIClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not found. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable.');
  }
  
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
    timeout: 15000, // 设置15秒超时
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
    
    // 极简化的 prompt 以最大化响应速度
    const prompt = `分析："${text}"
    
返回JSON：
{
  "category": "workplace",
  "severity": 6,
  "puaTechniques": ["压力操控"],
  "analysis": "通过比较制造压力",
  "responses": {
    "mild": "我有自己的工作安排",
    "firm": "我不会因为别人而改变我的计划", 
    "analytical": "每个人的工作方式不同，不应该用别人来衡量"
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
      temperature: 0.1, // 进一步降低温度
      max_tokens: 400,   // 进一步限制响应长度
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API call timeout')), 12000); // 12秒超时
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
      console.log('API timeout, using local analysis as fallback');
      const localResult = localAnalyze(text);
      return NextResponse.json({
        ...localResult,
        analysis: `${localResult.analysis}（使用本地分析）`
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