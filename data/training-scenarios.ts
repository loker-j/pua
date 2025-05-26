import { TrainingScenario } from "@/types/pua";

export const trainingScenarios: TrainingScenario[] = [
  {
    id: "ts1",
    situation: "在社交聚会中",
    category: "Guilt-tripping",
    difficulty: "easy",
    puaText: "如果你真的在乎我，就不会这么早离开。",
    idealResponsePoints: [
      "设定清晰的界限",
      "使用'我'的陈述",
      "不接受内疚操控"
    ],
    tips: [
      "保持冷静和坚定的回应",
      "表达你的感受，无需为你的选择道歉",
      "承认对方的感受，同时维护你的界限"
    ]
  },
  {
    id: "ts2",
    situation: "讨论计划时",
    category: "Love bombing",
    difficulty: "medium",
    puaText: "我从未遇到像你这样的人。你在各方面都很完美。我们应该马上住在一起！",
    idealResponsePoints: [
      "保持个人节奏",
      "识别爱情轰炸",
      "设定健康的界限"
    ],
    tips: [
      "相信你的直觉关于进展速度",
      "表达感谢的同时保持界限",
      "明确表达你对关系进展速度的舒适程度"
    ]
  },
  {
    id: "ts3",
    situation: "在争执中",
    category: "Gaslighting",
    difficulty: "hard",
    puaText: "那根本没发生过。你总是在编造事情，对什么都太敏感了。",
    idealResponsePoints: [
      "坚持事实",
      "直接应对精神控制",
      "保持自我信任"
    ],
    tips: [
      "相信你的记忆和经历",
      "尽可能记录事件",
      "保持冷静但坚定地维护你的现实"
    ]
  },
  {
    id: "ts4",
    situation: "制定周末计划",
    category: "Isolation tactics",
    difficulty: "medium",
    puaText: "你的朋友们对你影响不好。你应该多花时间和我在一起。",
    idealResponsePoints: [
      "维护社交联系",
      "识别孤立企图",
      "设定健康的界限"
    ],
    tips: [
      "保持你的社交联系",
      "表达关系中平衡的重要性",
      "坚定地维护你拥有其他关系的权利"
    ]
  },
  {
    id: "ts5",
    situation: "分享成就后",
    category: "Negging",
    difficulty: "easy",
    puaText: "对你这个水平来说还不错，但你还是没有大多数人有经验。",
    idealResponsePoints: [
      "识别负面评价",
      "保持自信",
      "设定关于尊重的界限"
    ],
    tips: [
      "自信地承认你的成就",
      "不接受反讽式的恭维",
      "直接处理不尊重的行为"
    ]
  }
];