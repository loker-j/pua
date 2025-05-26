// 第一阶段：快速分析
export async function analyzePUAText(text: string): Promise<{
  category: string;
  severity: number;
  puaTechniques: string[];
  analysis: string;
}> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('分析请求失败:', error);
    return {
      category: 'general',
      severity: 5,
      puaTechniques: [],
      analysis: "无法分析此话语的PUA程度"
    };
  }
}

// 第二阶段：生成回应建议
export async function generateResponses(text: string, analysis: {
  category: string;
  severity: number;
  puaTechniques: string[];
  analysis: string;
}): Promise<{
  responses: {
    mild: string;
    firm: string;
    analytical: string;
  };
}> {
  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, analysis }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('回应生成请求失败:', error);
    return {
      responses: {
        mild: "我理解你的想法，但我需要一些时间考虑。",
        firm: "这个问题我们需要好好讨论，但不是用这种方式。",
        analytical: "让我们先冷静下来，理性地分析一下这个情况。"
      }
    };
  }
}