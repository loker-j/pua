import { PUACategory } from "@/types/pua";

interface PUAPattern {
  id: string;
  category: PUACategory;
  pattern: string;
  explanation: string;
  severity: number;
  keywords: string[];
  responses: {
    mild: string;
    firm: string;
    analytical: string;
  };
}

export const puaDatabase: PUAPattern[] = [
  {
    id: "workplace-1",
    category: "workplace",
    pattern: "别人都能做到，为什么你不行？",
    explanation: "这是一种比较性的操控策略，试图通过与他人比较让你感到不足。",
    severity: 7,
    keywords: ["比较", "自我怀疑", "团队压力"],
    responses: {
      mild: "我理解这项任务很重要。我有自己的处理方式，希望能得到具体的反馈而不是比较。",
      firm: "与他人比较并不能帮助或激励我。我更希望我们能讨论我可以具体改进的地方。",
      analytical: "每个人的表现都会因经验、培训和个人优势而不同。比较团队成员并不能考虑这些变量，也不是有效的管理方式。"
    }
  },
  {
    id: "workplace-2",
    category: "workplace",
    pattern: "我只是想帮你提高，别这么敏感。",
    explanation: "这结合了未经请求的批评和语气控制，否定你的情感反应的有效性。",
    severity: 6,
    keywords: ["语气控制", "否定情感", "批评"],
    responses: {
      mild: "我感谢你想帮助我的意图，但我更希望得到关注具体行为而不是我的性格或反应的反馈。",
      firm: "将我的回应标记为'敏感'是在否定我的观点。如果你想提供建设性的反馈，我很愿意听，但请尊重我的反应。",
      analytical: "有效的反馈应该具体、关注行为，并以尊重的方式传达。将情感反应视为'敏感'会造成沟通障碍，而不是改进机会。"
    }
  },
  {
    id: "relationship-1",
    category: "relationship",
    pattern: "如果你真的爱我，你就会为我这么做。",
    explanation: "这通过将爱与特定行为联系起来进行操控，暗示拒绝请求意味着你不爱对方。",
    severity: 8,
    keywords: ["情感勒索", "爱的条件", "内疚"],
    responses: {
      mild: "我确实在乎你，但爱一个人并不意味着要做他们要求的每件事。我们需要互相尊重对方的界限。",
      firm: "爱不是通过服从要求来衡量的。我根据自己的价值观和界限做决定，而不是为了证明我的感情。",
      analytical: "这种说法在爱和特定行为之间建立了错误的等价关系。健康的关系尊重自主权，不使用情感操控来影响行为。"
    }
  },
  {
    id: "relationship-2",
    category: "relationship",
    pattern: "没有我你什么都不是，你永远找不到像我这样的人。",
    explanation: "这种说法通过破坏自尊和制造被抛弃的恐惧来维持关系中的控制。",
    severity: 9,
    keywords: ["孤立", "贬低", "恐惧"],
    responses: {
      mild: "我理解你可能感到不安，但这些话很伤人。我的价值不依赖于任何关系。",
      firm: "我的自我价值不是由这段关系决定的。这种说法具有操控性且不可接受。",
      analytical: "这种说法结合了贬低和排他性主张来制造依赖。这是一种公认的操控策略，会损害心理健康和关系健康。"
    }
  },
  {
    id: "family-1",
    category: "family",
    pattern: "我为你做了这么多，你就是这样报答我的？",
    explanation: "这利用过去的关心或支持来制造债务感和当前服从的义务。",
    severity: 7,
    keywords: ["内疚", "义务", "互惠"],
    responses: {
      mild: "我感谢你的支持，但这不意味着我不能做出自己的选择。我们能不能不提过去的恩情来讨论这个问题？",
      firm: "我感谢你所做的一切，但用这些来影响我现在的决定是不公平的。我的选择需要基于当前对我来说什么是对的。",
      analytical: "这种说法不当地援引互惠规范。真诚的支持是无条件给予的，不期望特定回报。通过过去的行为制造义务是一种操控。"
    }
  },
  {
    id: "family-2",
    category: "family",
    pattern: "如果你不听家人的话，没人会尊重你。",
    explanation: "这将家庭服从与社会认可联系起来，为独立选择制造被拒绝的恐惧。",
    severity: 6,
    keywords: ["社会压力", "尊重", "家庭义务"],
    responses: {
      mild: "我重视你们的观点，但我也需要做对我来说感觉正确的决定。尊重来自多个方面。",
      firm: "尊重不是通过遵循他人的指示获得的，而是通过按照自己的价值观生活。我需要你们尊重我的自主权。",
      analytical: "这种说法在家庭服从和社会尊重之间创造了错误的二分法。这些是独立的变量，个人诚信往往比服从带来更多尊重。"
    }
  },
  {
    id: "general-1",
    category: "general",
    pattern: "你对这件事太情绪化/敏感了。",
    explanation: "这否定合理的感受，将注意力从问题转移到你的反应上。",
    severity: 5,
    keywords: ["否定情感", "语气控制", "转移焦点"],
    responses: {
      mild: "我的感受是有效的，即使你不认同。我们能否专注于问题本身，而不是我表达的方式？",
      firm: "我的情感反应是恰当的，不是问题所在。请关注实际问题，而不是否定我的感受。",
      analytical: "将情感反应标记为过度是一种否定形式，会阻碍有效沟通。情感在决策中提供有价值的信息，不应被忽视。"
    }
  },
  {
    id: "general-2",
    category: "general",
    pattern: "我只是在开玩笑，你不能开玩笑吗？",
    explanation: "这将不当行为的责任转移到你身上，说你'太敏感'，而不是承认不当的评论。",
    severity: 5,
    keywords: ["推卸责任", "转移责任", "否定情感"],
    responses: {
      mild: "我理解你可能没有恶意，但这对我来说不像玩笑。我们能否对这个话题更谨慎一些？",
      firm: "无论是否是玩笑，这都影响到了我。我希望你能承认这一点，而不是质疑我的反应。",
      analytical: "造成不适或伤害的'玩笑'不是有效的沟通。将责任转移给听者而不是检视'玩笑'的内容，这是在逃避责任。"
    }
  }
];