import { MultipleChoiceScenario, FillInBlankScenario } from "@/types/pua";

// 选择题训练场景
export const multipleChoiceScenarios: MultipleChoiceScenario[] = [
  {
    id: "mc1",
    situation: "在社交聚会中",
    category: "Guilt-tripping",
    difficulty: "easy",
    puaText: "如果你真的在乎我，就不会这么早离开。",
    question: "面对这种内疚操控，最好的回应方式是什么？",
    options: [
      {
        id: "mc1_a",
        text: "好吧，我再待一会儿。",
        score: 2,
        explanation: "这种回应屈服于内疚操控，没有设立界限。",
        isCorrect: false
      },
      {
        id: "mc1_b",
        text: "我理解你希望我留下，但我需要离开了。这不代表我不在乎你。",
        score: 9,
        explanation: "完美的回应：承认对方感受，设立清晰界限，拒绝内疚操控。",
        isCorrect: true
      },
      {
        id: "mc1_c",
        text: "你总是这样让我有负罪感！",
        score: 4,
        explanation: "虽然识别了操控，但回应过于激烈，可能升级冲突。",
        isCorrect: false
      },
      {
        id: "mc1_d",
        text: "我不想讨论这个。",
        score: 3,
        explanation: "回避问题，没有解决操控行为，也没有设立清晰界限。",
        isCorrect: false
      }
    ],
    tips: [
      "承认对方的感受，但不要被内疚操控",
      "使用'我'的陈述表达你的需求",
      "保持冷静和坚定的语调"
    ],
    explanation: "内疚操控是一种常见的PUA技巧，通过让你感到内疚来控制你的行为。最好的应对方式是承认对方的感受，同时坚持你的界限。"
  },
  {
    id: "mc2",
    situation: "讨论关系进展",
    category: "Love bombing",
    difficulty: "medium",
    puaText: "我从未遇到像你这样的人。你在各方面都很完美。我们应该马上住在一起！",
    question: "如何应对这种过度的赞美和快速推进关系的压力？",
    options: [
      {
        id: "mc2_a",
        text: "谢谢你的夸奖，但我觉得我们应该慢慢来。",
        score: 8,
        explanation: "很好的回应：表达感谢，设立节奏界限，保持理性。",
        isCorrect: true
      },
      {
        id: "mc2_b",
        text: "好的，我们搬到一起吧！",
        score: 1,
        explanation: "完全被爱情轰炸操控，没有保持理性思考。",
        isCorrect: false
      },
      {
        id: "mc2_c",
        text: "你这样说让我觉得不舒服。",
        score: 6,
        explanation: "表达了不适感，但没有具体说明为什么或如何改善。",
        isCorrect: false
      },
      {
        id: "mc2_d",
        text: "我需要时间考虑这么重要的决定。",
        score: 7,
        explanation: "理性的回应，但可以更直接地设立界限。",
        isCorrect: false
      }
    ],
    tips: [
      "识别过度的赞美和快速推进的红旗",
      "保持自己的节奏，不要被压力影响",
      "相信你的直觉关于关系进展速度"
    ],
    explanation: "爱情轰炸是通过过度的关注和赞美来快速建立依赖关系的操控技巧。健康的关系应该有自然的发展节奏。"
  },
  {
    id: "mc3",
    situation: "在争执中",
    category: "Gaslighting",
    difficulty: "hard",
    puaText: "那根本没发生过。你总是在编造事情，对什么都太敏感了。",
    question: "面对这种否认现实的精神控制，应该如何回应？",
    options: [
      {
        id: "mc3_a",
        text: "也许我记错了...",
        score: 1,
        explanation: "完全被精神控制操控，开始怀疑自己的记忆和感知。",
        isCorrect: false
      },
      {
        id: "mc3_b",
        text: "我清楚地记得发生了什么，我相信我的记忆。",
        score: 9,
        explanation: "优秀的回应：坚持事实，维护自己的现实感知，拒绝被操控。",
        isCorrect: true
      },
      {
        id: "mc3_c",
        text: "你在撒谎！你就是想让我发疯！",
        score: 3,
        explanation: "虽然识别了操控，但情绪化的回应可能让情况恶化。",
        isCorrect: false
      },
      {
        id: "mc3_d",
        text: "我们对这件事的记忆不同。",
        score: 5,
        explanation: "过于妥协，没有坚持事实，给了操控者继续否认的空间。",
        isCorrect: false
      }
    ],
    tips: [
      "相信你的记忆和经历",
      "记录重要事件以备参考",
      "寻求第三方的支持和验证"
    ],
    explanation: "精神控制是最危险的操控形式之一，通过否认现实来让受害者怀疑自己的感知。坚持事实和相信自己的经历是关键。"
  },
  {
    id: "mc4",
    situation: "制定周末计划",
    category: "Isolation tactics",
    difficulty: "medium",
    puaText: "你的朋友们对你影响不好。你应该多花时间和我在一起。",
    question: "如何应对试图孤立你与朋友关系的操控？",
    options: [
      {
        id: "mc4_a",
        text: "也许你说得对，我确实应该少见他们。",
        score: 2,
        explanation: "被孤立操控成功，这会损害你的社交支持网络。",
        isCorrect: false
      },
      {
        id: "mc4_b",
        text: "我的朋友对我很重要，我需要保持这些关系。我们也可以一起度过时间。",
        score: 9,
        explanation: "完美回应：维护友谊，设立界限，提供平衡的解决方案。",
        isCorrect: true
      },
      {
        id: "mc4_c",
        text: "你没有权利评判我的朋友！",
        score: 5,
        explanation: "设立了界限，但过于对抗性，可能升级冲突。",
        isCorrect: false
      },
      {
        id: "mc4_d",
        text: "我会考虑你的建议。",
        score: 3,
        explanation: "模糊的回应，没有明确拒绝孤立企图。",
        isCorrect: false
      }
    ],
    tips: [
      "保持你的社交联系",
      "识别孤立企图的红旗",
      "在关系中寻求平衡，而不是排他性"
    ],
    explanation: "孤立是控制性关系的常见策略，通过切断你与支持网络的联系来增加依赖性。维护友谊对心理健康至关重要。"
  },
  {
    id: "mc5",
    situation: "分享成就后",
    category: "Negging",
    difficulty: "easy",
    puaText: "对你这个水平来说还不错，但你还是没有大多数人有经验。",
    question: "面对这种反讽式的'恭维'，最好的回应是什么？",
    options: [
      {
        id: "mc5_a",
        text: "谢谢你的'恭维'。",
        score: 4,
        explanation: "讽刺的回应，但没有直接解决不尊重的行为。",
        isCorrect: false
      },
      {
        id: "mc5_b",
        text: "我为我的成就感到骄傲，不需要与他人比较。",
        score: 9,
        explanation: "优秀的回应：自信地维护自己的成就，拒绝负面比较。",
        isCorrect: true
      },
      {
        id: "mc5_c",
        text: "你说得对，我确实还需要努力。",
        score: 2,
        explanation: "接受了负面评价，损害了自信心。",
        isCorrect: false
      },
      {
        id: "mc5_d",
        text: "至少我比你强。",
        score: 3,
        explanation: "虽然反击了，但降低到了同样的水平，可能升级冲突。",
        isCorrect: false
      }
    ],
    tips: [
      "识别反讽式恭维的真实意图",
      "自信地承认你的成就",
      "不要接受不必要的比较"
    ],
    explanation: "Negging是通过反讽式恭维来降低你自信心的操控技巧。最好的应对是保持自信，拒绝接受负面评价。"
  }
];

// 填空题训练场景
export const fillInBlankScenarios: FillInBlankScenario[] = [
  {
    id: "fib1",
    situation: "在工作场合",
    category: "Guilt-tripping",
    difficulty: "easy",
    puaText: "如果你真的是团队的一员，就不会拒绝加班。",
    tips: [
      "保持专业但坚定的语调",
      "表达你的工作界限",
      "不要为合理的界限道歉"
    ],
    idealResponsePoints: [
      "设定清晰的工作界限",
      "使用'我'的陈述",
      "不接受内疚操控",
      "保持专业性"
    ],
    standardAnswer: "我理解项目的重要性，但我已经安排了其他承诺。我会确保在正常工作时间内高效完成我的任务。团队合作不意味着要牺牲个人界限。",
    answerExplanation: "这个回应承认了工作的重要性，同时坚持个人界限。使用了'我'的陈述，没有被内疚操控影响，并且重新定义了什么是真正的团队合作。"
  },
  {
    id: "fib2",
    situation: "在恋爱关系中",
    category: "Love bombing",
    difficulty: "medium",
    puaText: "你是我生命中最重要的人，没有你我无法生存。我们应该每天都在一起。",
    tips: [
      "识别过度依赖的红旗",
      "设定健康的关系界限",
      "鼓励独立性"
    ],
    idealResponsePoints: [
      "表达关心但设立界限",
      "鼓励健康的独立性",
      "拒绝过度依赖",
      "保持关系平衡"
    ],
    standardAnswer: "我很珍惜我们的关系，但健康的关系需要两个独立的个体。我们都需要自己的空间和时间来成长。让我们建立一个平衡的关系，而不是完全依赖。",
    answerExplanation: "这个回应表达了对关系的重视，同时设立了健康的界限。强调了独立性的重要性，拒绝了过度依赖的要求，并提出了更健康的关系模式。"
  },
  {
    id: "fib3",
    situation: "在家庭聚会中",
    category: "Gaslighting",
    difficulty: "hard",
    puaText: "你从小就很敏感，总是夸大事情。那件事根本没有你说的那么严重。",
    tips: [
      "坚持你的经历和感受",
      "不要被否定影响",
      "寻求支持和验证"
    ],
    idealResponsePoints: [
      "坚持自己的经历",
      "拒绝被否定",
      "维护自己的感知",
      "设立尊重的界限"
    ],
    standardAnswer: "我的感受和经历是真实有效的。我不会让任何人否定我的现实或告诉我应该如何感受。如果你不能尊重我的经历，我们需要暂停这个对话。",
    answerExplanation: "这个回应坚定地维护了自己的现实感知，拒绝被精神控制操控。设立了明确的尊重界限，并准备在必要时结束不健康的对话。"
  },
  {
    id: "fib4",
    situation: "与朋友的对话",
    category: "Isolation tactics",
    difficulty: "medium",
    puaText: "你的家人总是给你压力，你应该少和他们联系，多和我们这些真正理解你的人在一起。",
    tips: [
      "识别孤立企图",
      "保持重要关系",
      "寻求平衡而非排他性"
    ],
    idealResponsePoints: [
      "维护家庭关系",
      "识别孤立策略",
      "寻求关系平衡",
      "拒绝排他性要求"
    ],
    standardAnswer: "我感谢你的关心，但我的家庭关系对我很重要，即使有时会有挑战。真正的朋友会支持我维护所有重要的关系，而不是要求我选择。我需要在生活中保持平衡。",
    answerExplanation: "这个回应感谢了朋友的关心，同时拒绝了孤立要求。强调了真正友谊的特征，并坚持维护多元化的关系网络。"
  },
  {
    id: "fib5",
    situation: "在社交媒体上",
    category: "Negging",
    difficulty: "easy",
    puaText: "你的照片看起来不错，不过滤镜用得有点多。自然一点会更好看。",
    tips: [
      "不要接受不请自来的'建议'",
      "保持自信",
      "设立关于评论的界限"
    ],
    idealResponsePoints: [
      "拒绝不请自来的评判",
      "保持自信",
      "设立界限",
      "不需要为自己的选择辩护"
    ],
    standardAnswer: "我对我的照片很满意，不需要关于如何改进的建议。如果你不喜欢我的风格，你可以选择不关注。我会按照自己喜欢的方式表达自己。",
    answerExplanation: "这个回应自信地拒绝了不请自来的评判，设立了清晰的界限。没有为自己的选择辩护，而是坚持了自主权和自我表达的权利。"
  }
];

// 导出所有场景的统一接口
export const getAllTrainingScenarios = () => {
  return [...multipleChoiceScenarios, ...fillInBlankScenarios];
};

export const getScenariosByType = (type: "multiple-choice" | "fill-in-blank") => {
  return type === "multiple-choice" ? multipleChoiceScenarios : fillInBlankScenarios;
};

export const getScenariosByDifficulty = (difficulty: "easy" | "medium" | "hard", type?: "multiple-choice" | "fill-in-blank") => {
  if (type) {
    return getScenariosByType(type).filter(scenario => scenario.difficulty === difficulty);
  }
  return getAllTrainingScenarios().filter(scenario => scenario.difficulty === difficulty);
};