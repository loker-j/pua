import { NextRequest, NextResponse } from "next/server";

interface EvaluationRequest {
  userAnswer: string;
  standardAnswer: string;
  idealResponsePoints: string[];
  puaText: string;
  category: string;
  language: "zh" | "en";
}

interface EvaluationResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string;
  comparison: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userAnswer, standardAnswer, idealResponsePoints, puaText, category, language }: EvaluationRequest = await request.json();

    if (!userAnswer || !standardAnswer || !idealResponsePoints) {
      return NextResponse.json(
        { error: language === "zh" ? "缺少必要参数" : "Missing required parameters" },
        { status: 400 }
      );
    }

    // 构建评估提示词
    const prompt = language === "zh" 
      ? `请评估用户对PUA语言的回应质量。

PUA原文：${puaText}
类别：${category}

用户回答：${userAnswer}

标准答案：${standardAnswer}

理想回应要点：${idealResponsePoints.join(", ")}

请按以下JSON格式返回评估结果：
{
  "score": 1-10的分数,
  "strengths": ["用户回应的优点"],
  "improvements": ["需要改进的地方"],
  "suggestions": "具体的改进建议",
  "comparison": "与标准答案的对比分析"
}

评分标准：
- 是否设立了清晰的界限 (2分)
- 是否使用了"我"的陈述 (2分)
- 是否直接应对了操控行为 (2分)
- 语调是否适当（坚定但不激进）(2分)
- 是否保持了自信和自尊 (2分)

请确保返回有效的JSON格式。`
      : `Please evaluate the quality of the user's response to PUA language.

Original PUA text: ${puaText}
Category: ${category}

User's answer: ${userAnswer}

Standard answer: ${standardAnswer}

Ideal response points: ${idealResponsePoints.join(", ")}

Please return the evaluation in the following JSON format:
{
  "score": score from 1-10,
  "strengths": ["strengths of the user's response"],
  "improvements": ["areas for improvement"],
  "suggestions": "specific improvement suggestions",
  "comparison": "comparison analysis with the standard answer"
}

Scoring criteria:
- Clear boundaries established (2 points)
- Use of "I" statements (2 points)
- Direct addressing of manipulative behavior (2 points)
- Appropriate tone (firm but not aggressive) (2 points)
- Maintained confidence and self-respect (2 points)

Please ensure valid JSON format is returned.`;

    // 调用AI API进行评估
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // 解析AI返回的JSON
    let evaluation: EvaluationResponse;
    try {
      // 提取JSON部分（去除可能的markdown格式）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      evaluation = JSON.parse(jsonStr);
    } catch (parseError) {
      // 如果解析失败，使用备用评估逻辑
      evaluation = fallbackEvaluation(userAnswer, standardAnswer, idealResponsePoints, language);
    }

    // 验证和清理评估结果
    evaluation.score = Math.max(1, Math.min(10, evaluation.score || 5));
    evaluation.strengths = evaluation.strengths || [];
    evaluation.improvements = evaluation.improvements || [];
    evaluation.suggestions = evaluation.suggestions || (language === "zh" ? "继续练习，注意设立清晰的界限。" : "Keep practicing and focus on setting clear boundaries.");
    evaluation.comparison = evaluation.comparison || (language === "zh" ? "与标准答案相比，你的回应有一定的改进空间。" : "Compared to the standard answer, your response has room for improvement.");

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error("Training evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 备用评估逻辑（当AI解析失败时使用）
function fallbackEvaluation(
  userAnswer: string, 
  standardAnswer: string, 
  idealResponsePoints: string[], 
  language: "zh" | "en"
): EvaluationResponse {
  const answer = userAnswer.toLowerCase();
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 检查界限设立
  if (answer.includes("界限") || answer.includes("boundary") || 
      answer.includes("不能") || answer.includes("cannot") ||
      answer.includes("不会") || answer.includes("won't")) {
    score += 2;
    strengths.push(language === "zh" ? "设立了清晰的界限" : "Established clear boundaries");
  } else {
    improvements.push(language === "zh" ? "需要更明确地设立界限" : "Need to establish clearer boundaries");
  }

  // 检查"我"的陈述
  if (answer.includes("我") || answer.includes("i ") || answer.includes("i'm") || answer.includes("i'll")) {
    score += 2;
    strengths.push(language === "zh" ? "使用了'我'的陈述" : "Used 'I' statements");
  } else {
    improvements.push(language === "zh" ? "尝试使用更多'我'的陈述" : "Try using more 'I' statements");
  }

  // 检查是否应对操控
  if (answer.includes("操控") || answer.includes("manipul") || 
      answer.includes("不公平") || answer.includes("unfair") ||
      answer.includes("不对") || answer.includes("wrong")) {
    score += 2;
    strengths.push(language === "zh" ? "识别并应对了操控行为" : "Identified and addressed manipulative behavior");
  }

  // 检查语调
  if (!answer.includes("恨") && !answer.includes("hate") && 
      !answer.includes("蠢") && !answer.includes("stupid")) {
    score += 2;
    strengths.push(language === "zh" ? "保持了适当的语调" : "Maintained appropriate tone");
  } else {
    improvements.push(language === "zh" ? "避免使用过于激烈的语言" : "Avoid using overly aggressive language");
  }

  // 检查自信
  if (answer.includes("我相信") || answer.includes("i believe") ||
      answer.includes("我知道") || answer.includes("i know") ||
      answer.includes("我的") || answer.includes("my")) {
    score += 2;
    strengths.push(language === "zh" ? "表现出了自信" : "Showed confidence");
  }

  score = Math.max(1, Math.min(10, score));

  if (strengths.length === 0) {
    strengths.push(language === "zh" ? "你尝试了应对这个情况" : "You attempted to address the situation");
  }

  const suggestions = score <= 3 
    ? (language === "zh" ? "建议重点练习设立界限和使用'我'的陈述。" : "Focus on practicing boundary setting and using 'I' statements.")
    : score <= 6
    ? (language === "zh" ? "你的回应有一些好的元素，可以更直接地应对操控。" : "Your response has good elements, but could be more direct in addressing manipulation.")
    : (language === "zh" ? "很好的回应！继续保持这种坚定而理性的态度。" : "Great response! Keep maintaining this firm yet rational approach.");

  return {
    score,
    strengths,
    improvements,
    suggestions,
    comparison: language === "zh" 
      ? "与标准答案相比，你的回应展现了一定的理解，但还有改进空间。"
      : "Compared to the standard answer, your response shows understanding but has room for improvement."
  };
} 