import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    const prompt = `你是一个专业的心理学专家和反PUA顾问。请分析以下话语的PUA程度，并生成相应的反PUA回复。

需要分析的话语：${text}

请按照以下步骤进行分析：

1. 识别PUA技巧：分析这句话使用了哪些PUA技巧（如情感勒索、贬低、孤立、否定情感、转移责任、比较操控等）
2. 评估严重程度：根据操控性、伤害性、紧急性评估1-10的严重程度
3. 确定场景类别：判断是职场、感情、家庭还是通用场景
4. 生成反PUA回复：根据PUA程度生成三种不同强度的反击回复

回复原则：
- 低程度PUA(1-3)：温和但明确地设立界限，保持关系和谐
- 中程度PUA(4-7)：坚定地拒绝操控，明确表达自己的立场
- 高程度PUA(8-10)：强硬反击，保护自己的心理健康，必要时考虑断绝关系

请严格按照以下JSON格式返回：

{
  "category": "workplace|relationship|family|general 中的一个",
  "severity": "1到10之间的数字，表示PUA严重程度",
  "puaTechniques": ["识别出的PUA技巧列表"],
  "analysis": "简要分析这句话的操控性质",
  "responses": {
    "mild": "温和但坚定的回应，适合轻度PUA",
    "firm": "明确且直接的回应，适合中度PUA", 
    "analytical": "理性分析并强硬反击，适合重度PUA"
  }
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ 
        role: "system", 
        content: "你现在正在面对一个使用PUA话术的人。你需要保持清醒和坚定，用不同的方式回应他们的话语。你的回应应该既显示出对自我的尊重，又不会激化冲突。" 
      }, {
        role: "user",
        content: prompt
      }],
      model: "deepseek-chat",
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      if (!response) {
        throw new Error('API返回了空响应');
      }

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到JSON格式的响应');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      if (!parsedResponse.category || 
          !parsedResponse.severity || 
          !parsedResponse.puaTechniques ||
          !parsedResponse.analysis ||
          !parsedResponse.responses ||
          !parsedResponse.responses.mild ||
          !parsedResponse.responses.firm ||
          !parsedResponse.responses.analytical) {
        throw new Error('响应格式不完整');
      }
      
      const validCategories = ['workplace', 'relationship', 'family', 'general'];
      if (!validCategories.includes(parsedResponse.category)) {
        parsedResponse.category = 'general';
      }
      
      parsedResponse.severity = Math.min(Math.max(1, Number(parsedResponse.severity)), 10);
      
      return NextResponse.json(parsedResponse);
    } catch (e) {
      console.error('解析API响应失败:', e, '原始响应:', response);
      return NextResponse.json({
        category: 'general',
        severity: 5,
        puaTechniques: [],
        analysis: "无法分析",
        responses: {
          mild: "我理解你的想法，但我需要一些时间考虑。",
          firm: "这个问题我们需要好好讨论，但不是用这种方式。",
          analytical: "让我们先冷静下来，理性地分析一下这个情况。"
        }
      });
    }
  } catch (error) {
    console.error('调用API失败:', error);
    return NextResponse.json({
      category: 'general',
      severity: 5,
      puaTechniques: [],
      analysis: "无法分析",
      responses: {
        mild: "抱歉，我现在需要一些时间思考。",
        firm: "这个问题我们稍后再讨论。",
        analytical: "让我们稍后用更合适的方式继续这个对话。"
      }
    });
  }
}